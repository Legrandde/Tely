import api from "@/api/axio";

export interface ProgressionExtractionPdf {
  etape: "serveur" | "analyse" | "ocr";
  message: string;
  pourcentage: number;
  page?: number;
  totalPages?: number;
}

export interface ResultatExtractionPdf {
  text: string;
  source: "serveur" | "gemini_vision" | "pdfjs" | "ocr";
  pages: number;
}

const SEUIL_TEXTE_VALIDE = 40;
const MAX_PAGES_OCR = 15;

function nettoyerTexte(brut: string): string {
  return brut
    .replace(/\r\n|\r/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Améliore le contraste d'une page scannée (niveaux de gris + étirement de contraste)
 * afin d'augmenter la fidélité de l'OCR sur les photocopies / scans d'examens.
 */
function pretraiterCanvasPourOcr(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = imageData.data;
  const facteur = 1.35; // boost de contraste modéré qui préserve les accents et symboles

  for (let i = 0; i < d.length; i += 4) {
    const gris = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    const ajuste = Math.min(255, Math.max(0, (gris - 128) * facteur + 128));
    d[i] = ajuste;
    d[i + 1] = ajuste;
    d[i + 2] = ajuste;
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Extrait le texte d'un PDF :
 * 1. Extraction rapide côté serveur (`/api/pdf/extract-text`).
 * 2. Si le PDF est un scan (texte vide / 422), lecture locale via `pdfjs-dist`
 *    puis OCR haute résolution (`tesseract.js`, langue française) page par page.
 */
export async function extraireTextePdf(
  file: File,
  onProgress?: (p: ProgressionExtractionPdf) => void,
  options?: { forceVision?: boolean }
): Promise<ResultatExtractionPdf> {
  // 1) Tentative côté serveur (PDF natif ou Gemini Vision pour scans & formules LaTeX)
  onProgress?.({
    etape: "serveur",
    message: options?.forceVision
      ? "Analyse Vision IA (texte + formules LaTeX)…"
      : "Lecture du PDF en cours…",
    pourcentage: 15,
  });

  try {
    const formData = new FormData();
    formData.append("pdf", file);
    if (options?.forceVision) {
      formData.append("force_vision", "1");
    }

    const { data } = await api.post<{
      success: boolean;
      text?: string;
      source?: "serveur" | "gemini_vision";
    }>("/api/pdf/extract-text", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 65000,
    });

    const texteServeur = nettoyerTexte(data.text ?? "");
    if (texteServeur.length >= SEUIL_TEXTE_VALIDE) {
      onProgress?.({ etape: "serveur", message: "Extraction terminée", pourcentage: 100 });
      return {
        text: texteServeur,
        source: data.source === "gemini_vision" ? "gemini_vision" : "serveur",
        pages: 1,
      };
    }
  } catch (err: unknown) {
    // 422 = PDF scanné sans couche texte → on bascule automatiquement sur l'OCR local.
    // On tente aussi le fallback local en cas de souci d'encodage serveur.
    const status = (err as { response?: { status?: number } })?.response?.status;
    if (status === 413) {
      throw new Error("Le fichier PDF est trop volumineux (20 Mo maximum).");
    }
  }

  // 2) Chargement dynamique de pdfjs-dist (0 Ko dans le bundle principal)
  onProgress?.({
    etape: "analyse",
    message: "Analyse des pages du PDF…",
    pourcentage: 20,
  });

  const pdfjs = await import("pdfjs-dist");
  const workerUrl = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const buffer = await file.arrayBuffer();
  const pdfDoc = await pdfjs.getDocument({ data: buffer }).promise;
  const totalPages = pdfDoc.numPages;

  // Vérification de la couche texte native via pdf.js (certains PDF non lus par smalot/pdfparser)
  const morceauxPdfJs: string[] = [];
  for (let p = 1; p <= totalPages; p++) {
    const page = await pdfDoc.getPage(p);
    const content = await page.getTextContent();
    const lignes = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .trim();
    if (lignes) morceauxPdfJs.push(lignes);
  }

  const textePdfJs = nettoyerTexte(morceauxPdfJs.join("\n\n"));
  if (textePdfJs.length >= SEUIL_TEXTE_VALIDE) {
    onProgress?.({ etape: "analyse", message: "Extraction terminée", pourcentage: 100 });
    return { text: textePdfJs, source: "pdfjs", pages: totalPages };
  }

  // 3) PDF scanné détecté → OCR haute fidélité avec Tesseract.js (français)
  const pagesATraiter = Math.min(totalPages, MAX_PAGES_OCR);
  onProgress?.({
    etape: "ocr",
    message: `PDF scanné détecté — préparation de l'OCR (${pagesATraiter} page${pagesATraiter > 1 ? "s" : ""})…`,
    pourcentage: 25,
    page: 1,
    totalPages: pagesATraiter,
  });

  const { createWorker } = await import("tesseract.js");
  let pageEnCours = 1;

  const worker = await createWorker("fra", 1, {
    logger: (m) => {
      if (m.status === "recognizing text" && typeof m.progress === "number") {
        const base = ((pageEnCours - 1) / pagesATraiter) * 70 + 25;
        const delta = (m.progress / pagesATraiter) * 70;
        const pct = Math.min(98, Math.round(base + delta));
        onProgress?.({
          etape: "ocr",
          message: `Reconnaissance OCR — page ${pageEnCours}/${pagesATraiter} (${Math.round(m.progress * 100)} %)…`,
          pourcentage: pct,
          page: pageEnCours,
          totalPages: pagesATraiter,
        });
      }
    },
  });

  try {
    const textesPages: string[] = [];

    for (let p = 1; p <= pagesATraiter; p++) {
      pageEnCours = p;
      onProgress?.({
        etape: "ocr",
        message: `Rendu et lecture OCR — page ${p}/${pagesATraiter}…`,
        pourcentage: Math.min(95, Math.round(25 + ((p - 1) / pagesATraiter) * 70)),
        page: p,
        totalPages: pagesATraiter,
      });

      const page = await pdfDoc.getPage(p);
      const viewportBase = page.getViewport({ scale: 1 });
      const echelle = Math.min(2.4, 2200 / Math.max(viewportBase.width, 1));
      const viewport = page.getViewport({ scale: Math.max(1.8, echelle) });

      const canvas = document.createElement("canvas");
      canvas.width = Math.round(viewport.width);
      canvas.height = Math.round(viewport.height);

      const ctx = canvas.getContext("2d");
      if (!ctx) continue;

      // Fond blanc pour éviter les transparences noires à l'OCR
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({ canvasContext: ctx, viewport, canvas }).promise;
      pretraiterCanvasPourOcr(canvas);

      const { data } = await worker.recognize(canvas);
      const textePage = nettoyerTexte(data.text ?? "");
      if (textePage) {
        textesPages.push(textePage);
      }

      // Libération mémoire du canvas entre chaque page
      canvas.width = 0;
      canvas.height = 0;
    }

    const texteFinal = nettoyerTexte(textesPages.join("\n\n"));
    if (!texteFinal) {
      throw new Error(
        "Aucun texte lisible n'a pu être reconnu dans ce PDF scanné. Vérifiez la netteté du scan."
      );
    }

    onProgress?.({ etape: "ocr", message: "Reconnaissance OCR terminée", pourcentage: 100 });
    return { text: texteFinal, source: "ocr", pages: pagesATraiter };
  } finally {
    await worker.terminate();
  }
}

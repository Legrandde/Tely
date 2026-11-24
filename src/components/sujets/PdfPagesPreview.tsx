import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, FileText, Loader2 } from "lucide-react";

interface PdfPagesPreviewProps {
  /** Fichier PDF local fraîchement importé (formulaire). */
  file?: File | null;
  /** URL du PDF enregistré sur le serveur (page détail / édition). */
  url?: string | null;
  titre?: string;
}

const MAX_PAGES_APERCU = 12;

/**
 * Affiche visuellement les pages d'un PDF (figures géométriques, schémas, courbes, formules)
 * directement dans la page (compatible mobile & desktop via pdfjs-dist, avec repli iframe).
 */
export default function PdfPagesPreview({
  file,
  url,
  titre = "Document original (figures & schémas)",
}: PdfPagesPreviewProps) {
  const [pages, setPages] = useState<string[]>([]);
  const [pageIdx, setPageIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fallbackIframe, setFallbackIframe] = useState(false);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setObjectUrl(null);
      return;
    }
    const created = URL.createObjectURL(file);
    setObjectUrl(created);
    return () => URL.revokeObjectURL(created);
  }, [file]);

  useEffect(() => {
    if (!file && !url) {
      setPages([]);
      return;
    }

    let annule = false;
    setLoading(true);
    setFallbackIframe(false);
    setPageIdx(0);

    async function renderPages() {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url
        ).toString();

        const source = file
          ? { data: await file.arrayBuffer() }
          : { url: url as string, withCredentials: false };

        const doc = await pdfjs.getDocument(source).promise;
        const total = Math.min(doc.numPages, MAX_PAGES_APERCU);
        const rendues: string[] = [];

        for (let p = 1; p <= total; p++) {
          if (annule) return;
          const page = await doc.getPage(p);
          const base = page.getViewport({ scale: 1 });
          const scale = Math.min(1.8, 1200 / Math.max(base.width, 1));
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement("canvas");
          canvas.width = Math.round(viewport.width);
          canvas.height = Math.round(viewport.height);
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;

          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          await page.render({ canvasContext: ctx, viewport, canvas }).promise;
          rendues.push(canvas.toDataURL("image/jpeg", 0.9));
          canvas.width = 0;
          canvas.height = 0;
        }

        if (!annule) {
          setPages(rendues);
        }
      } catch {
        // Repli propre sur iframe si CORS bloque la lecture binaire d'un PDF distant
        if (!annule) {
          setFallbackIframe(true);
        }
      } finally {
        if (!annule) setLoading(false);
      }
    }

    void renderPages();
    return () => {
      annule = true;
    };
  }, [file, url]);

  const lienOuverture = objectUrl || url || null;
  if (!file && !url) return null;

  return (
    <div className="mt-5 rounded-xl border border-border bg-muted/30 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <FileText className="size-4 text-amber-500" aria-hidden="true" />
          <span>{titre}</span>
          {pages.length > 0 && (
            <span className="text-xs font-normal text-muted-foreground">
              — Page {pageIdx + 1} / {pages.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {pages.length > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPageIdx((i) => Math.max(0, i - 1))}
                disabled={pageIdx === 0}
                aria-label="Page précédente"
                className="flex size-7 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-muted disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setPageIdx((i) => Math.min(pages.length - 1, i + 1))}
                disabled={pageIdx >= pages.length - 1}
                aria-label="Page suivante"
                className="flex size-7 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-muted disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          )}

          {lienOuverture && (
            <a
              href={lienOuverture}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              Ouvrir le PDF
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-xs text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-amber-500" />
          Chargement des pages et schémas du PDF…
        </div>
      ) : fallbackIframe && lienOuverture ? (
        <iframe
          src={lienOuverture}
          title={titre}
          className="h-[520px] w-full rounded-lg border border-border bg-white"
        />
      ) : pages.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-border bg-white shadow-xs">
          <img
            src={pages[pageIdx]}
            alt={`${titre} — page ${pageIdx + 1}`}
            className="mx-auto block h-auto max-h-[680px] w-full object-contain"
          />
        </div>
      ) : null}
    </div>
  );
}

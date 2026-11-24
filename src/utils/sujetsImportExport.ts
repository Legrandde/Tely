import type { SujetItem } from "@/types/admin";

export interface OptionSelect {
  value: string;
  label: string;
}

export interface SujetImportRow {
  idTemp: string;
  titre: string;
  type: "bac" | "brevet" | "composition" | "autre";
  session: "juin" | "septembre" | "janvier";
  annee: number;
  matiere_id: string;
  matiereLabel?: string;
  niveau_id: string;
  niveauLabel?: string;
  ennonce: string;
  pdfFile?: File | null;
  source?: string;
}

const COLONNES_EXPORT = [
  "titre",
  "type",
  "session",
  "annee",
  "matiere",
  "niveau",
  "ennonce",
  "pdf_url",
] as const;

function normaliserChaine(v: unknown): string {
  return String(v ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function normaliserType(v: unknown): SujetImportRow["type"] {
  const s = normaliserChaine(v);
  if (s.includes("bac")) return "bac";
  if (s.includes("brevet") || s.includes("bepc") || s.includes("bfem")) return "brevet";
  if (s.includes("comp")) return "composition";
  return "autre";
}

function normaliserSession(v: unknown): SujetImportRow["session"] {
  const s = normaliserChaine(v);
  if (s.includes("sept")) return "septembre";
  if (s.includes("janv")) return "janvier";
  return "juin";
}

function normaliserAnnee(v: unknown): number {
  const n = Number.parseInt(String(v ?? ""), 10);
  const max = new Date().getFullYear();
  if (!Number.isNaN(n) && n >= 2000 && n <= max) return n;
  return max;
}

function resoudreOption(valeur: unknown, options: OptionSelect[]): OptionSelect | undefined {
  const brut = String(valeur ?? "").trim();
  if (!brut) return undefined;
  // Correspondance par ID exact
  const parId = options.find((o) => o.value === brut);
  if (parId) return parId;
  // Correspondance exacte sans accent/casse
  const norm = normaliserChaine(brut);
  const exact = options.find((o) => normaliserChaine(o.label) === norm);
  if (exact) return exact;
  // Correspondance partielle
  return options.find(
    (o) => normaliserChaine(o.label).includes(norm) || norm.includes(normaliserChaine(o.label))
  );
}

function sujetVersLigneExport(s: SujetItem): Record<(typeof COLONNES_EXPORT)[number], string | number> {
  return {
    titre: s.titre ?? "",
    type: s.type ?? "bac",
    session: s.session ?? "juin",
    annee: s.annee ?? new Date().getFullYear(),
    matiere: s.matiere?.nom ?? "",
    niveau: s.niveau?.libelle ?? "",
    ennonce: s.ennonce ?? s.enonce ?? "",
    pdf_url: s.pdf_url ?? "",
  };
}

function telechargerBlob(blob: Blob, nomFichier: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomFichier;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function dateJour(): string {
  return new Date().toISOString().slice(0, 10);
}

function echapperCsv(val: string | number): string {
  const s = String(val ?? "");
  if (/[;"\r\n,]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** Export CSV (UTF-8 avec BOM pour ouverture parfaite dans Excel). */
export function exporterSujetsCsv(sujets: SujetItem[]): void {
  const lignes = sujets.map(sujetVersLigneExport);
  const entete = COLONNES_EXPORT.join(";");
  const corps = lignes.map((l) => COLONNES_EXPORT.map((c) => echapperCsv(l[c])).join(";"));
  const csv = "\uFEFF" + [entete, ...corps].join("\r\n");
  telechargerBlob(new Blob([csv], { type: "text/csv;charset=utf-8;" }), `sujets-tely-${dateJour()}.csv`);
}

/** Export Excel (.xlsx) via SheetJS chargé dynamiquement. */
export async function exporterSujetsExcel(sujets: SujetItem[]): Promise<void> {
  const XLSX = await import("xlsx");
  const lignes = sujets.map(sujetVersLigneExport);
  const ws = XLSX.utils.json_to_sheet(lignes, { header: [...COLONNES_EXPORT] });
  ws["!cols"] = [
    { wch: 36 },
    { wch: 14 },
    { wch: 12 },
    { wch: 8 },
    { wch: 22 },
    { wch: 18 },
    { wch: 64 },
    { wch: 32 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sujets d'examen");
  XLSX.writeFile(wb, `sujets-tely-${dateJour()}.xlsx`);
}

/** Export JSON structuré. */
export function exporterSujetsJson(sujets: SujetItem[]): void {
  const lignes = sujets.map(sujetVersLigneExport);
  const json = JSON.stringify(lignes, null, 2);
  telechargerBlob(new Blob([json], { type: "application/json;charset=utf-8;" }), `sujets-tely-${dateJour()}.json`);
}

function echapperHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Export PDF imprimable A4 propre des sujets filtrés. */
export function exporterSujetsPdf(sujets: SujetItem[]): void {
  const w = window.open("", "_blank", "width=960,height=720");
  if (!w) return;

  const blocs = sujets
    .map((s, i) => {
      const ennonce = echapperHtml(s.ennonce ?? s.enonce ?? "").replace(/\n/g, "<br/>");
      const meta = [
        s.type?.toUpperCase(),
        s.session ? `Session ${s.session}` : "",
        s.annee,
        s.matiere?.nom,
        s.niveau?.libelle,
      ]
        .filter(Boolean)
        .join(" · ");
      return `
        <article class="sujet">
          <div class="meta">${i + 1}. ${echapperHtml(meta)}</div>
          <h2>${echapperHtml(s.titre)}</h2>
          <div class="ennonce">${ennonce || "<em>Aucun énoncé</em>"}</div>
        </article>
      `;
    })
    .join("");

  w.document.write(`<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>Export des sujets d'examen — Tely (${dateJour()})</title>
  <style>
    @page { margin: 18mm; }
    body { font-family: system-ui, -apple-system, Segoe UI, sans-serif; color: #0f172a; line-height: 1.55; margin: 0; }
    header { border-bottom: 2px solid #f59e0b; padding-bottom: 12px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: baseline; }
    header h1 { margin: 0; font-size: 20px; }
    header span { font-size: 12px; color: #64748b; }
    .sujet { page-break-inside: avoid; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 18px; margin-bottom: 16px; }
    .meta { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: #b45309; margin-bottom: 4px; }
    h2 { margin: 0 0 10px; font-size: 16px; color: #0f172a; }
    .ennonce { font-size: 13px; color: #334155; white-space: normal; }
  </style>
</head>
<body>
  <header>
    <h1>Tely — Catalogue des sujets d'examen</h1>
    <span>${sujets.length} sujet(s) · Exporté le ${dateJour()}</span>
  </header>
  ${blocs}
  <script>window.onload = function () { window.print(); };</script>
</body>
</html>`);
  w.document.close();
}

/** Télécharge un modèle prêt à remplir (CSV ou Excel). */
export async function telechargerModeleImport(format: "csv" | "xlsx"): Promise<void> {
  const exemple = [
    {
      titre: "BAC Mathématiques 2025 — Série SM",
      type: "bac",
      session: "juin",
      annee: 2025,
      matiere: "Mathématiques",
      niveau: "Terminale",
      ennonce: "Exercice 1 : Étudier la fonction f(x) = (x^2 + 1) / (x - 1)...",
    },
  ];

  if (format === "csv") {
    const cols = ["titre", "type", "session", "annee", "matiere", "niveau", "ennonce"] as const;
    const csv =
      "\uFEFF" +
      cols.join(";") +
      "\r\n" +
      cols.map((c) => echapperCsv(exemple[0][c])).join(";");
    telechargerBlob(new Blob([csv], { type: "text/csv;charset=utf-8;" }), "modele-import-sujets.csv");
    return;
  }

  const XLSX = await import("xlsx");
  const ws = XLSX.utils.json_to_sheet(exemple);
  ws["!cols"] = [
    { wch: 36 },
    { wch: 12 },
    { wch: 12 },
    { wch: 8 },
    { wch: 20 },
    { wch: 16 },
    { wch: 60 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Modèle");
  XLSX.writeFile(wb, "modele-import-sujets.xlsx");
}

function lireChamp(row: Record<string, unknown>, cles: string[]): unknown {
  const entries = Object.entries(row);
  for (const cle of cles) {
    const cible = normaliserChaine(cle);
    const trouve = entries.find(([k]) => normaliserChaine(k) === cible);
    if (trouve && String(trouve[1] ?? "").trim() !== "") return trouve[1];
  }
  return undefined;
}

/** Parse un fichier CSV, Excel (.xlsx/.xls) ou JSON en lignes prêtes pour l'import. */
export async function parserFichierImportSujets(
  file: File,
  matieres: OptionSelect[],
  niveaux: OptionSelect[]
): Promise<SujetImportRow[]> {
  const ext = file.name.toLowerCase().split(".").pop() ?? "";
  let bruts: Record<string, unknown>[] = [];

  if (ext === "json") {
    const txt = await file.text();
    const parsed = JSON.parse(txt);
    bruts = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.data) ? parsed.data : [parsed];
  } else {
    const XLSX = await import("xlsx");
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: "array" });
    const firstSheet = wb.SheetNames[0];
    if (!firstSheet) return [];
    bruts = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[firstSheet], { defval: "" });
  }

  return bruts
    .map((row, idx): SujetImportRow | null => {
      const titre = String(lireChamp(row, ["titre", "title", "nom", "sujet"]) ?? "").trim();
      const ennonce = String(lireChamp(row, ["ennonce", "enonce", "énoncé", "contenu", "texte", "content"]) ?? "").trim();
      if (!titre && !ennonce) return null;

      const matVal = lireChamp(row, ["matiere_id", "matiere", "matière", "discipline", "subject"]);
      const nivVal = lireChamp(row, ["niveau_id", "niveau", "classe", "level"]);
      const matMatch = resoudreOption(matVal, matieres);
      const nivMatch = resoudreOption(nivVal, niveaux);

      return {
        idTemp: `row-${Date.now()}-${idx}`,
        titre: titre || `Sujet importé #${idx + 1}`,
        type: normaliserType(lireChamp(row, ["type", "examen"])),
        session: normaliserSession(lireChamp(row, ["session", "mois"])),
        annee: normaliserAnnee(lireChamp(row, ["annee", "année", "year"])),
        matiere_id: matMatch?.value ?? "",
        matiereLabel: matMatch?.label ?? (matVal ? String(matVal) : undefined),
        niveau_id: nivMatch?.value ?? "",
        niveauLabel: nivMatch?.label ?? (nivVal ? String(nivVal) : undefined),
        ennonce,
        source: ext.toUpperCase(),
      };
    })
    .filter((r): r is SujetImportRow => r !== null);
}

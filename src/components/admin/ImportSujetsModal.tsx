import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Trash2,
  UploadCloud,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import {
  createSujet,
  loadMatiereOptions,
  loadNiveauOptions,
} from "@/services/resourceService";
import { extraireTextePdf } from "@/utils/pdfOcr";
import {
  parserFichierImportSujets,
  telechargerModeleImport,
  type OptionSelect,
  type SujetImportRow,
} from "@/utils/sujetsImportExport";
import { useToast } from "@/context/ToastContext";

interface ImportSujetsModalProps {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}

export default function ImportSujetsModal({ open, onClose, onImported }: ImportSujetsModalProps) {
  const toast = useToast();
  const [matieres, setMatieres] = useState<OptionSelect[]>([]);
  const [niveaux, setNiveaux] = useState<OptionSelect[]>([]);

  // Valeurs par défaut (utilisées pour les PDF ou les lignes sans matière/niveau reconnu)
  const [defMatiereId, setDefMatiereId] = useState("");
  const [defNiveauId, setDefNiveauId] = useState("");
  const [defType, setDefType] = useState<SujetImportRow["type"]>("bac");
  const [defSession, setDefSession] = useState<SujetImportRow["session"]>("juin");
  const [defAnnee, setDefAnnee] = useState(new Date().getFullYear());

  const [rows, setRows] = useState<SujetImportRow[]>([]);
  const [parsing, setParsing] = useState(false);
  const [parseMessage, setParseMessage] = useState("");
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    Promise.all([loadMatiereOptions(), loadNiveauOptions()])
      .then(([m, n]) => {
        setMatieres(m);
        setNiveaux(n);
        if (!defMatiereId && m[0]) setDefMatiereId(m[0].value);
        if (!defNiveauId && n[0]) setDefNiveauId(n[0].value);
      })
      .catch(() => {
        setError("Impossible de charger les matières et niveaux.");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function reset() {
    setRows([]);
    setError(null);
    setParseMessage("");
    setImportProgress(null);
  }

  function handleClose() {
    if (importing || parsing) return;
    reset();
    onClose();
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);
    setParsing(true);

    try {
      const files = Array.from(fileList);
      const nouvellesLignes: SujetImportRow[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.toLowerCase().split(".").pop() ?? "";

        if (ext === "pdf" || file.type === "application/pdf") {
          setParseMessage(`Extraction PDF (${i + 1}/${files.length}) : ${file.name}…`);
          try {
            const res = await extraireTextePdf(file, (p) => {
              setParseMessage(`PDF ${i + 1}/${files.length} (${file.name}) — ${p.message}`);
            });
            nouvellesLignes.push({
              idTemp: `pdf-${Date.now()}-${i}`,
              titre: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
              type: defType,
              session: defSession,
              annee: defAnnee,
              matiere_id: defMatiereId,
              niveau_id: defNiveauId,
              ennonce: res.text,
              pdfFile: file,
              source: res.source === "gemini_vision" ? "PDF (IA)" : res.source === "ocr" ? "PDF (OCR)" : "PDF",
            });
          } catch (e) {
            toast.error(
              `Échec sur "${file.name}" : ${e instanceof Error ? e.message : "lecture impossible"}`
            );
          }
        } else if (["csv", "xlsx", "xls", "json"].includes(ext)) {
          setParseMessage(`Lecture du fichier ${file.name}…`);
          const parsed = await parserFichierImportSujets(file, matieres, niveaux);
          nouvellesLignes.push(
            ...parsed.map((r) => ({
              ...r,
              matiere_id: r.matiere_id || defMatiereId,
              niveau_id: r.niveau_id || defNiveauId,
            }))
          );
        } else {
          toast.warning(`Format non supporté ignoré : ${file.name}`);
        }
      }

      if (nouvellesLignes.length === 0) {
        setError("Aucun sujet valide trouvé dans le(s) fichier(s) sélectionné(s).");
      } else {
        setRows((prev) => [...prev, ...nouvellesLignes]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible de lire le fichier sélectionné.");
    } finally {
      setParsing(false);
      setParseMessage("");
    }
  }

  function updateRow(idTemp: string, patch: Partial<SujetImportRow>) {
    setRows((prev) => prev.map((r) => (r.idTemp === idTemp ? { ...r, ...patch } : r)));
  }

  function removeRow(idTemp: string) {
    setRows((prev) => prev.filter((r) => r.idTemp !== idTemp));
  }

  const validRows = rows.filter(
    (r) => r.titre.trim() && r.ennonce.trim() && r.matiere_id && r.niveau_id
  );

  async function handleConfirmImport() {
    if (validRows.length === 0) return;
    setImporting(true);
    setError(null);
    setImportProgress({ done: 0, total: validRows.length });

    let succes = 0;
    let echecs = 0;

    for (let i = 0; i < validRows.length; i++) {
      const r = validRows[i];
      try {
        await createSujet(
          {
            titre: r.titre.trim(),
            type: r.type,
            session: r.session,
            annee: r.annee,
            matiere_id: r.matiere_id,
            niveau_id: r.niveau_id,
            ennonce: r.ennonce.trim(),
          },
          r.pdfFile ?? null
        );
        succes++;
      } catch {
        echecs++;
      }
      setImportProgress({ done: i + 1, total: validRows.length });
    }

    setImporting(false);
    if (succes > 0) {
      toast.success(
        echecs > 0
          ? `${succes} sujet(s) importé(s), ${echecs} en erreur.`
          : `${succes} sujet(s) importé(s) avec succès !`
      );
      reset();
      onImported();
      onClose();
    } else {
      setError("Aucun sujet n'a pu être enregistré. Vérifiez les champs obligatoires.");
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Importer des sujets d'examen" maxWidth="max-w-4xl">
      <div className="space-y-5">
        {/* Barre modèles */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-muted/40 px-4 py-3 text-xs">
          <span className="text-muted-foreground">
            Formats acceptés : <strong className="text-foreground">CSV, Excel (.xlsx/.xls), JSON</strong> et{" "}
            <strong className="text-foreground">PDF (numérique ou scanné avec OCR)</strong>.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void telechargerModeleImport("xlsx")}
              className="inline-flex items-center gap-1 font-medium text-amber-600 hover:underline dark:text-amber-400 cursor-pointer"
            >
              <Download size={13} /> Modèle Excel
            </button>
            <span className="text-border">|</span>
            <button
              type="button"
              onClick={() => void telechargerModeleImport("csv")}
              className="inline-flex items-center gap-1 font-medium text-amber-600 hover:underline dark:text-amber-400 cursor-pointer"
            >
              <Download size={13} /> Modèle CSV
            </button>
          </div>
        </div>

        {/* Valeurs par défaut (surtout utiles pour l'import de PDFs en lot) */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Matière par défaut</label>
            <select
              value={defMatiereId}
              onChange={(e) => setDefMatiereId(e.target.value)}
              className="tely-input py-1.5 text-xs"
            >
              {matieres.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Niveau par défaut</label>
            <select
              value={defNiveauId}
              onChange={(e) => setDefNiveauId(e.target.value)}
              className="tely-input py-1.5 text-xs"
            >
              {niveaux.map((n) => (
                <option key={n.value} value={n.value}>
                  {n.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Type</label>
            <select
              value={defType}
              onChange={(e) => setDefType(e.target.value as SujetImportRow["type"])}
              className="tely-input py-1.5 text-xs"
            >
              <option value="bac">Baccalauréat</option>
              <option value="brevet">BFEM / Brevet</option>
              <option value="composition">Composition</option>
              <option value="autre">Autre</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Session</label>
            <select
              value={defSession}
              onChange={(e) => setDefSession(e.target.value as SujetImportRow["session"])}
              className="tely-input py-1.5 text-xs"
            >
              <option value="juin">Juin</option>
              <option value="septembre">Septembre</option>
              <option value="janvier">Janvier</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Année</label>
            <input
              type="number"
              min={2000}
              max={new Date().getFullYear()}
              value={defAnnee}
              onChange={(e) => setDefAnnee(Number(e.target.value) || new Date().getFullYear())}
              className="tely-input py-1.5 text-xs"
            />
          </div>
        </div>

        {/* Zone dépôt multi-fichiers */}
        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (!parsing && !importing) void handleFiles(e.dataTransfer.files);
          }}
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-6 text-center transition-colors hover:border-amber-500/60"
        >
          <input
            type="file"
            multiple
            accept=".csv,.xlsx,.xls,.json,.pdf,application/pdf,text/csv"
            disabled={parsing || importing}
            onChange={(e) => {
              void handleFiles(e.target.files);
              e.target.value = "";
            }}
            className="hidden"
          />
          <UploadCloud className="mb-2 size-7 text-amber-500" />
          <p className="text-sm font-semibold text-foreground">
            {parsing ? parseMessage || "Analyse en cours…" : "Déposez vos fichiers CSV, Excel, JSON ou PDF ici"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Vous pouvez sélectionner plusieurs PDF d'examen à la fois (le PDF original est aussi conservé)
          </p>
        </label>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-xs text-destructive">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Aperçu des sujets à importer */}
        {rows.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">
                Aperçu ({validRows.length}/{rows.length} prêt{validRows.length > 1 ? "s" : ""})
              </span>
              <button
                type="button"
                onClick={reset}
                disabled={importing}
                className="text-muted-foreground hover:text-destructive cursor-pointer"
              >
                Tout vider
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto rounded-xl border border-border">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-muted/80 text-left text-[11px] uppercase tracking-wider text-muted-foreground backdrop-blur">
                  <tr>
                    <th className="px-3 py-2">Titre</th>
                    <th className="px-3 py-2">Matière</th>
                    <th className="px-3 py-2">Niveau</th>
                    <th className="px-3 py-2">Source</th>
                    <th className="px-3 py-2 text-center">État</th>
                    <th className="px-2 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((r) => {
                    const ok = Boolean(r.titre.trim() && r.ennonce.trim() && r.matiere_id && r.niveau_id);
                    return (
                      <tr key={r.idTemp} className="bg-card">
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={r.titre}
                            onChange={(e) => updateRow(r.idTemp, { titre: e.target.value })}
                            className="w-full rounded border border-transparent bg-transparent px-1.5 py-0.5 text-xs font-medium text-foreground focus:border-border focus:outline-none"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={r.matiere_id}
                            onChange={(e) => updateRow(r.idTemp, { matiere_id: e.target.value })}
                            className="rounded border border-border bg-background px-1.5 py-1 text-xs"
                          >
                            <option value="">— Choisir —</option>
                            {matieres.map((m) => (
                              <option key={m.value} value={m.value}>
                                {m.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={r.niveau_id}
                            onChange={(e) => updateRow(r.idTemp, { niveau_id: e.target.value })}
                            className="rounded border border-border bg-background px-1.5 py-1 text-xs"
                          >
                            <option value="">— Choisir —</option>
                            {niveaux.map((n) => (
                              <option key={n.value} value={n.value}>
                                {n.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            {r.pdfFile ? <FileText size={12} /> : <FileSpreadsheet size={12} />}
                            {r.source ?? "Fichier"}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          {ok ? (
                            <CheckCircle2 size={15} className="mx-auto text-emerald-500" />
                          ) : (
                            <AlertCircle size={15} className="mx-auto text-amber-500" />
                          )}
                        </td>
                        <td className="px-2 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => removeRow(r.idTemp)}
                            disabled={importing}
                            aria-label="Retirer cette ligne"
                            className="rounded p-1 text-muted-foreground hover:text-destructive cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Barre de progression d'import */}
        {importProgress && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Enregistrement des sujets…</span>
              <span>
                {importProgress.done}/{importProgress.total}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-200"
                style={{ width: `${Math.round((importProgress.done / importProgress.total) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Pied de modal */}
        <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={handleClose} disabled={importing || parsing}>
            Annuler
          </Button>
          <Button
            type="button"
            variant="brand"
            onClick={() => void handleConfirmImport()}
            disabled={importing || parsing || validRows.length === 0}
          >
            {importing
              ? "Import en cours…"
              : `Importer ${validRows.length} sujet${validRows.length > 1 ? "s" : ""}`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Eye,
  PenTool,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import {
  createSujet,
  updateSujet,
  getSujetById,
  loadMatiereOptions,
  loadNiveauOptions,
} from "../services/resourceService";
import { useToast } from "../context/ToastContext";
import { extraireTextePdf, type ProgressionExtractionPdf } from "@/utils/pdfOcr";
import PdfPagesPreview from "@/components/sujets/PdfPagesPreview";
import ContenuScientifique from "@/components/ui/ContenuScientifique";

interface SujetFormState {
  titre: string;
  type: "bac" | "brevet" | "composition" | "autre";
  session: "juin" | "septembre" | "janvier";
  annee: number;
  matiere_id: string;
  niveau_id: string;
  ennonce: string;
}

const INITIAL_STATE: SujetFormState = {
  titre: "",
  type: "bac",
  session: "juin",
  annee: new Date().getFullYear(),
  matiere_id: "",
  niveau_id: "",
  ennonce: "",
};

export default function FormSujetPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const isProfesseur = location.pathname.toLowerCase().includes("professeur");
  const basePath = isProfesseur ? "/Dashboard-professeur/sujets" : "/Dashbord-admin/sujets";

  const [form, setForm] = useState<SujetFormState>(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [fetchingInitial, setFetchingInitial] = useState(isEditMode);
  const [error, setError] = useState<string>();
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  // Options
  const [matieres, setMatieres] = useState<{ value: string; label: string }[]>([]);
  const [niveaux, setNiveaux] = useState<{ value: string; label: string }[]>([]);

  // État PDF / OCR / Vision LaTeX
  const [extractingPdf, setExtractingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<ProgressionExtractionPdf | null>(null);
  const [pdfSuccessName, setPdfSuccessName] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [existingPdfUrl, setExistingPdfUrl] = useState<string | null>(null);
  const [pdfSource, setPdfSource] = useState<"serveur" | "gemini_vision" | "pdfjs" | "ocr" | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const [matOptions, nivOptions] = await Promise.all([
          loadMatiereOptions(),
          loadNiveauOptions(),
        ]);
        setMatieres(matOptions);
        setNiveaux(nivOptions);

        if (isEditMode && id) {
          const sujetData = await getSujetById(id);
          const raw = sujetData as unknown as Record<string, unknown>;
          setForm({
            titre: String(raw.titre ?? ""),
            type: (raw.type as SujetFormState["type"]) || "bac",
            session: (raw.session as SujetFormState["session"]) || "juin",
            annee: Number(raw.annee) || new Date().getFullYear(),
            matiere_id:
              typeof raw.matiere === "object" && raw.matiere !== null
                ? String((raw.matiere as { id?: string | number }).id ?? "")
                : String(raw.matiere_id ?? ""),
            niveau_id:
              typeof raw.niveau === "object" && raw.niveau !== null
                ? String((raw.niveau as { id?: string | number }).id ?? "")
                : String(raw.niveau_id ?? ""),
            ennonce: String(raw.ennonce ?? ""),
          });
          if (typeof raw.pdf_url === "string" && raw.pdf_url) {
            setExistingPdfUrl(raw.pdf_url);
          }
        }
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          "Impossible de charger les données du sujet.";
        setError(msg);
        toast.error(msg);
      } finally {
        setFetchingInitial(false);
      }
    }
    init();
  }, [id, isEditMode, toast]);

  function handleChange(field: keyof SujetFormState, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleFileUpload(file: File, forceVision = false) {
    const isPdf = file && (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"));
    if (!isPdf) {
      toast.error("Veuillez sélectionner un fichier PDF valide.");
      return;
    }

    // Conserve le PDF original pour l'attacher au sujet (figures géométriques & schémas intacts)
    setPdfFile(file);
    setExtractingPdf(true);
    setPdfProgress({
      etape: "serveur",
      message: forceVision ? "Analyse Vision IA (texte + formules LaTeX)…" : "Lecture du PDF en cours…",
      pourcentage: 10,
    });
    setPdfSuccessName(null);
    setPdfSource(null);
    setError(undefined);

    try {
      const resultat = await extraireTextePdf(file, (p) => setPdfProgress(p), { forceVision });

      if (resultat.text) {
        setForm((prev) => ({
          ...prev,
          ennonce: resultat.text,
          titre: prev.titre || file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
        }));
        setActiveTab("edit");
        setPdfSuccessName(file.name);
        setPdfSource(resultat.source);
        toast.success(
          resultat.source === "gemini_vision"
            ? `Texte et formules LaTeX extraits par Vision IA depuis "${file.name}"`
            : resultat.source === "ocr"
            ? `Texte reconnu par OCR (${resultat.pages} page${resultat.pages > 1 ? "s" : ""}) depuis "${file.name}"`
            : `Énoncé extrait avec succès depuis "${file.name}"`
        );
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ??
        (err instanceof Error ? err.message : null) ??
        "Erreur lors de l'extraction du texte du PDF.";
      setError(msg);
      toast.error(msg);
    } finally {
      setExtractingPdf(false);
      setPdfProgress(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.titre.trim()) {
      setError("Le titre du sujet d'examen est obligatoire.");
      return;
    }
    if (!form.matiere_id) {
      setError("Veuillez sélectionner une matière.");
      return;
    }
    if (!form.niveau_id) {
      setError("Veuillez sélectionner un niveau scolaire.");
      return;
    }
    if (!form.ennonce.trim()) {
      setError("Veuillez saisir ou extraire le texte de l'épreuve.");
      return;
    }

    setError(undefined);
    setLoading(true);

    try {
      const payload = form as unknown as Record<string, unknown>;
      if (isEditMode && id) {
        await updateSujet(id, payload, pdfFile);
        toast.success("Sujet d'examen mis à jour avec succès !");
      } else {
        await createSujet(payload, pdfFile);
        toast.success("Nouveau sujet d'examen créé avec succès !");
      }
      navigate(basePath);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Erreur lors de l'enregistrement du sujet.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  const selectedMatiereLabel = useMemo(
    () => matieres.find((m) => m.value === form.matiere_id)?.label ?? "Non définie",
    [matieres, form.matiere_id]
  );

  const selectedNiveauLabel = useMemo(
    () => niveaux.find((n) => n.value === form.niveau_id)?.label ?? "Non défini",
    [niveaux, form.niveau_id]
  );

  if (fetchingInitial) {
    return (
      <div className="min-h-screen pb-16 animate-pulse">
        {/* Sticky Top Bar Skeleton */}
        <div className="tely-page border-b border-gray-200 sticky top-0 z-20 px-4 sm:px-8 py-3.5">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] bg-gray-100" />
              <div className="space-y-1.5">
                <div className="h-3 w-40 bg-gray-100 rounded" />
                <div className="h-5 w-56 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-20 rounded-[10px] bg-gray-100 border border-gray-200" />
              <div className="h-9 w-36 rounded-[10px] bg-gray-200" />
            </div>
          </div>
        </div>

        {/* 12-Col Grid Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Colonne Gauche (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Carte 1 : Informations générales */}
            <div className="tely-card p-5 sm:p-6 space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-gray-200">
                <div className="w-8 h-8 rounded-lg bg-gray-100" />
                <div className="space-y-1.5">
                  <div className="h-4 w-52 bg-gray-200 rounded" />
                  <div className="h-3 w-64 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="h-3.5 w-36 bg-gray-200 rounded mb-1.5" />
                  <div className="h-10 w-full bg-gray-100 rounded-[10px] border border-gray-200" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="h-3.5 w-24 bg-gray-200 rounded mb-1.5" />
                    <div className="h-10 w-full bg-gray-100 rounded-[10px] border border-gray-200" />
                  </div>
                  <div>
                    <div className="h-3.5 w-32 bg-gray-200 rounded mb-1.5" />
                    <div className="h-10 w-full bg-gray-100 rounded-[10px] border border-gray-200" />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i}>
                      <div className="h-3.5 w-20 bg-gray-200 rounded mb-1.5" />
                      <div className="h-10 w-full bg-gray-100 rounded-[10px] border border-gray-200" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Carte 2 : Énoncé & Importation PDF */}
            <div className="tely-card p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gray-100" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-48 bg-gray-200 rounded" />
                    <div className="h-3 w-60 bg-gray-100 rounded" />
                  </div>
                </div>
                <div className="h-8 w-36 bg-gray-100 rounded-[10px]" />
              </div>
              <div className="h-28 w-full rounded-[10px] border-2 border-dashed border-gray-200 bg-gray-50/70" />
              <div className="h-72 w-full rounded-[10px] bg-gray-100 border border-gray-200" />
            </div>
          </div>

          {/* Colonne Droite (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="tely-card p-5 space-y-4">
              <div className="h-4 w-40 bg-gray-200 rounded" />
              <div className="space-y-2.5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-4 w-full bg-gray-100 rounded" />
                ))}
              </div>
              <div className="h-10 w-full bg-gray-200 rounded-[10px]" />
              <div className="h-9 w-full bg-gray-100 rounded-[10px]" />
            </div>
            <div className="tely-card p-5 space-y-3">
              <div className="h-3.5 w-36 bg-gray-200 rounded" />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 w-full bg-gray-50 rounded-[10px]" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      {/* ── Entête supérieure avec fil d'ariane & actions rapides ── */}
      <div className="tely-page border-b border-gray-200 sticky top-0 z-20 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(basePath)}
              className="p-2 rounded-[10px] text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
              title="Retour aux sujets"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Link to={basePath} className="hover:underline">
                  Sujets d'examens
                </Link>
                <span>/</span>
                <span className="text-gray-900 font-medium">
                  {isEditMode ? "Modifier le sujet" : "Nouveau sujet officiel"}
                </span>
              </div>
              <h1 className="tely-h1">
                {isEditMode ? `Modifier : ${form.titre || "Sans titre"}` : "Créer un sujet d'examen"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate(basePath)}
              className="tely-btn-outline"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="tely-btn"
            >
              {loading ? (
                <span className="inline-block h-4 w-28 bg-white/30 rounded animate-pulse" />
              ) : (
                <>
                  <Save size={16} />
                  <span>{isEditMode ? "Mettre à jour" : "Publier le sujet"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Contenu principal (Grille 2 colonnes) ── */}
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 sm:px-8 pt-6">
        {error && (
          <div className="mb-6 p-4 rounded-[10px] bg-red-50 border border-red-200 flex items-start gap-3 text-sm text-red-700">
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-gray-900" />
            <div>
              <p className="font-semibold">Vérification requise</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Colonne Gauche (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Boîte 1 : Métadonnées du Sujet */}
            <div className="tely-card p-5 sm:p-6">
              <h2 className="tely-title text-lg mb-4 flex items-center gap-2">
                <BookOpen size={18} className="text-gray-900" />
                Informations officielles de l'épreuve
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="tely-label block mb-1.5">
                    Titre complet de l'épreuve <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.titre}
                    onChange={(e) => handleChange("titre", e.target.value)}
                    placeholder="Ex: BAC 2023 — Épreuve de Physique-Chimie (Terminale SM)"
                    className="tely-input"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="tely-label block mb-1.5">
                      Matière <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={form.matiere_id}
                      onChange={(e) => handleChange("matiere_id", e.target.value)}
                      className="tely-input"
                    >
                      <option value="">Sélectionner une matière...</option>
                      {matieres.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="tely-label block mb-1.5">
                      Niveau scolaire <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={form.niveau_id}
                      onChange={(e) => handleChange("niveau_id", e.target.value)}
                      className="tely-input"
                    >
                      <option value="">Sélectionner un niveau...</option>
                      {niveaux.map((n) => (
                        <option key={n.value} value={n.value}>
                          {n.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div>
                    <label className="tely-label block mb-1.5">
                      Type d'examen
                    </label>
                    <select
                      value={form.type}
                      onChange={(e) =>
                        handleChange("type", e.target.value as SujetFormState["type"])
                      }
                      className="tely-input"
                    >
                      <option value="bac">Baccalauréat Unique</option>
                      <option value="brevet">BEPC / Brevet</option>
                      <option value="composition">Composition</option>
                      <option value="autre">CEE / Autre</option>
                    </select>
                  </div>

                  <div>
                    <label className="tely-label block mb-1.5">
                      Année de session
                    </label>
                    <input
                      type="number"
                      min={1990}
                      max={2035}
                      value={form.annee}
                      onChange={(e) => handleChange("annee", Number(e.target.value))}
                      className="tely-input"
                    />
                  </div>

                  <div>
                    <label className="tely-label block mb-1.5">
                      Session
                    </label>
                    <select
                      value={form.session}
                      onChange={(e) =>
                        handleChange("session", e.target.value as SujetFormState["session"])
                      }
                      className="tely-input"
                    >
                      <option value="juin">Session Juin (Normale)</option>
                      <option value="septembre">Session Septembre (Remplacement)</option>
                      <option value="janvier">Session Janvier</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Boîte 2 : Énoncé & Extraction PDF */}
            <div className="tely-card p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="tely-title text-lg flex items-center gap-2">
                    <PenTool size={18} className="text-gray-900" />
                    Texte intégral & Consignes de l'épreuve
                  </h2>
                  <p className="tely-subtitle">
                    Saisissez le texte complet ou importez directement un document PDF pour remplir automatiquement l'énoncé.
                  </p>
                </div>

                {/* Tabs Écriture / Aperçu */}
                <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-[10px]">
                  <button
                    type="button"
                    onClick={() => setActiveTab("edit")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[10px] transition-all cursor-pointer ${
                      activeTab === "edit"
                        ? "bg-gray-900 text-white"
                        : "text-gray-500 hover:text-gray-900 [&_svg]:text-gray-900"
                    }`}
                  >
                    <PenTool size={13} />
                    Éditeur
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("preview")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[10px] transition-all cursor-pointer ${
                      activeTab === "preview"
                        ? "bg-gray-900 text-white"
                        : "text-gray-500 hover:text-gray-900 [&_svg]:text-gray-900"
                    }`}
                  >
                    <Eye size={13} />
                    Aperçu
                  </button>
                </div>
              </div>

              {/* ── Zone Import PDF interactive (natif + OCR scan) ── */}
              <div className="mb-4">
                <label
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (!extractingPdf) setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (extractingPdf) return;
                    const file = e.dataTransfer.files?.[0];
                    if (file) void handleFileUpload(file);
                  }}
                  className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-[10px] text-center transition-all cursor-pointer ${
                    extractingPdf
                      ? "border-amber-500 bg-amber-50/40 dark:bg-amber-500/10 cursor-wait"
                      : isDragging
                      ? "border-amber-500 bg-amber-50/60 dark:bg-amber-500/15"
                      : pdfSuccessName
                      ? "border-gray-900 bg-gray-50 hover:bg-gray-100 dark:border-zinc-600 dark:bg-zinc-900/60"
                      : "border-gray-200 bg-gray-50 hover:border-gray-900 dark:border-zinc-800 dark:bg-zinc-900/40"
                  }`}
                >
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    disabled={extractingPdf}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleFileUpload(file);
                      e.target.value = "";
                    }}
                    className="hidden"
                  />

                  {extractingPdf ? (
                    <div className="w-full max-w-md mx-auto space-y-2.5 py-1">
                      <p className="text-xs font-semibold text-foreground">
                        {pdfProgress?.message ?? "Extraction du texte en cours…"}
                      </p>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-zinc-800">
                        <div
                          className="h-full rounded-full bg-amber-500 transition-all duration-300"
                          style={{ width: `${pdfProgress?.pourcentage ?? 15}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {pdfProgress?.etape === "ocr"
                          ? "Document scanné détecté — reconnaissance automatique du texte en français…"
                          : "Analyse du document PDF…"}
                      </p>
                    </div>
                  ) : pdfSuccessName ? (
                    <div className="flex flex-col items-center gap-1.5 text-foreground">
                      <CheckCircle2 size={32} className="text-amber-500" />
                      <p className="text-sm font-bold">
                        {pdfSource === "gemini_vision"
                          ? "Texte et formules LaTeX extraits (Vision IA)"
                          : pdfSource === "ocr"
                          ? "Texte reconnu par OCR (PDF scanné)"
                          : "Fichier extrait avec succès"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Document source : <span className="font-medium underline">{pdfSuccessName}</span> (cliquez pour remplacer)
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="p-3 bg-white dark:bg-zinc-900 text-foreground rounded-full mb-1">
                        <UploadCloud size={24} />
                      </div>
                      <p className="text-sm font-bold text-foreground">
                        Glissez-déposez le PDF de l'épreuve ici, ou <span className="tely-link underline">parcourez</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF numérique ou scanné : texte + formules extraits automatiquement, et PDF original joint pour conserver les figures et schémas
                      </p>
                    </div>
                  )}
                </label>

                {pdfFile && !extractingPdf && (
                  <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-3.5 py-2 text-xs">
                    <span className="text-muted-foreground">
                      Pièce jointe conservée :{" "}
                      <strong className="font-medium text-foreground">{pdfFile.name}</strong>{" "}
                      (figures &amp; schémas disponibles en PDF pour les élèves)
                    </span>
                    <div className="flex items-center gap-3">
                      {pdfSource !== "gemini_vision" && (
                        <button
                          type="button"
                          onClick={() => void handleFileUpload(pdfFile, true)}
                          className="font-medium text-amber-600 hover:text-amber-500 dark:text-amber-400 cursor-pointer"
                        >
                          Ré-extraire les formules (IA)
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setPdfFile(null);
                          setPdfSuccessName(null);
                          setPdfSource(null);
                        }}
                        className="text-muted-foreground hover:text-destructive cursor-pointer"
                      >
                        Retirer le PDF
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Éditeur ou Aperçu */}
              {activeTab === "edit" ? (
                <div className="relative">
                  <textarea
                    required
                    rows={14}
                    value={form.ennonce}
                    onChange={(e) => handleChange("ennonce", e.target.value)}
                    placeholder="Tapez ici le contenu de l'épreuve (Partie I, Partie II, Exercice 1, Problème...) ou utilisez l'importation PDF ci-dessus."
                    className="tely-input leading-relaxed"
                  />
                  <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 px-1">
                    <span>Supporte les formules KaTeX / LaTeX et le formatage texte</span>
                    <span>{form.ennonce.length} caractères | {form.ennonce.split(/\s+/).filter(Boolean).length} mots</span>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-muted/40 border border-border rounded-[10px] min-h-[300px] text-sm">
                  {form.ennonce ? (
                    <ContenuScientifique texte={form.ennonce} />
                  ) : (
                    <p className="text-muted-foreground italic text-center py-12">
                      L'énoncé est actuellement vide. Rédigez du texte ou importez un PDF pour afficher l'aperçu.
                    </p>
                  )}
                </div>
              )}

              {/* Aperçu visuel des pages du PDF (figures géométriques, schémas, courbes) */}
              {(pdfFile || existingPdfUrl) && (
                <PdfPagesPreview file={pdfFile} url={existingPdfUrl} />
              )}
            </div>
          </div>

          {/* Colonne Droite : Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
            {/* Carte 1 : Actions principales */}
            <div className="tely-card p-5">
              <h3 className="tely-title text-lg mb-3">
                Publication & Statut
              </h3>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-xs py-2 border-b border-gray-200">
                  <span className="text-gray-500">Statut de l'épreuve</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-gray-500 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Prêt à publier
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs py-2 border-b border-gray-200">
                  <span className="text-gray-500">Visibilité</span>
                  <span className="font-medium text-gray-800">Public (Élèves & Profs)</span>
                </div>
                <div className="flex items-center justify-between text-xs py-2 border-b border-gray-200">
                  <span className="text-gray-500">Mode</span>
                  <span className="font-medium text-gray-800">{isEditMode ? "Mise à jour" : "Création"}</span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="tely-btn w-full"
                >
                  {loading ? (
                    <span className="inline-block h-4 w-32 bg-white/30 rounded animate-pulse" />
                  ) : (
                    <>
                      <Save size={16} />
                      <span>{isEditMode ? "Mettre à jour le sujet" : "Enregistrer et publier"}</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(basePath)}
                  className="tely-btn-outline w-full"
                >
                  Annuler les modifications
                </button>
              </div>
            </div>

            {/* Carte 2 : Synthèse pédagogique en direct */}
            <div className="tely-card p-5">
              <h3 className="tely-title text-lg mb-3 flex items-center gap-2">
                <GraduationCap size={16} className="text-gray-900" />
                Synthèse de l'épreuve
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 bg-gray-50 rounded-[10px]">
                  <p className="text-gray-400 mb-0.5">Matière officielle</p>
                  <p className="font-semibold text-gray-800">{selectedMatiereLabel}</p>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-[10px]">
                  <p className="text-gray-400 mb-0.5">Niveau & Cycle</p>
                  <p className="font-semibold text-gray-800">{selectedNiveauLabel}</p>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-[10px]">
                  <p className="text-gray-400 mb-0.5">Session d'examen</p>
                  <p className="font-semibold text-gray-800">
                    Session {form.session.toUpperCase()} {form.annee} ({form.type.toUpperCase()})
                  </p>
                </div>
              </div>
            </div>

            {/* Carte 3 : Conseils de rédaction */}
            <div className="tely-card p-4 text-xs text-gray-500 space-y-2">
              <p className="font-bold flex items-center gap-1.5 text-gray-900">
                <FileText size={14} className="text-gray-900" />
                Conseils officiels MEPU-A
              </p>
              <ul className="list-disc pl-4 space-y-1 text-gray-500">
                <li>Précisez bien le barème total (ex: Théorie 5 pts, Pratique 15 pts).</li>
                <li>Pour les épreuves scientifiques, spécifiez les constantes données (ex: g = 10 N/kg).</li>
                <li>L'énoncé extrait du PDF peut être complété ou réajusté à tout moment.</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

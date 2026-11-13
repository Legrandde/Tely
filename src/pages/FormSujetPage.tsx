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
  Sparkles,
} from "lucide-react";
import {
  createSujet,
  updateSujet,
  getSujetById,
  loadMatiereOptions,
  loadNiveauOptions,
} from "../services/resourceService";
import { useToast } from "../context/ToastContext";
import api from "../api/axio";

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

  // État PDF
  const [extractingPdf, setExtractingPdf] = useState(false);
  const [pdfSuccessName, setPdfSuccessName] = useState<string | null>(null);

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

  async function handleFileUpload(file: File) {
    if (!file || file.type !== "application/pdf") {
      toast.error("Veuillez sélectionner un fichier PDF valide.");
      return;
    }

    setExtractingPdf(true);
    setPdfSuccessName(null);
    setError(undefined);

    try {
      const formData = new FormData();
      formData.append("pdf", file);

      const { data } = await api.post<{ success: boolean; text: string; filename: string }>(
        "/api/pdf/extract-text",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (data.text) {
        setForm((prev) => ({
          ...prev,
          ennonce: data.text,
          titre: prev.titre || file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
        }));
        setPdfSuccessName(file.name);
        toast.success(`Énoncé extrait avec succès depuis "${file.name}"`);
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Erreur lors de l'extraction du texte du PDF.";
      setError(msg);
      toast.error(msg);
    } finally {
      setExtractingPdf(false);
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
        await updateSujet(id, payload);
        toast.success("Sujet d'examen mis à jour avec succès !");
      } else {
        await createSujet(payload);
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
      <div className="min-h-screen bg-slate-50/70 pb-16 animate-pulse">
        {/* Sticky Top Bar Skeleton */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 sm:px-8 py-3.5 shadow-2xs">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100" />
              <div className="space-y-1.5">
                <div className="h-3 w-40 bg-slate-100 rounded" />
                <div className="h-5 w-56 bg-slate-200 rounded" />
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-20 rounded-xl bg-slate-100 border border-slate-200" />
              <div className="h-9 w-36 rounded-xl bg-amber-200/70" />
            </div>
          </div>
        </div>

        {/* 12-Col Grid Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Colonne Gauche (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Carte 1 : Informations générales */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-amber-100" />
                <div className="space-y-1.5">
                  <div className="h-4 w-52 bg-slate-200 rounded" />
                  <div className="h-3 w-64 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="h-3.5 w-36 bg-slate-200 rounded mb-1.5" />
                  <div className="h-10 w-full bg-slate-100 rounded-xl border border-slate-200" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="h-3.5 w-24 bg-slate-200 rounded mb-1.5" />
                    <div className="h-10 w-full bg-slate-100 rounded-xl border border-slate-200" />
                  </div>
                  <div>
                    <div className="h-3.5 w-32 bg-slate-200 rounded mb-1.5" />
                    <div className="h-10 w-full bg-slate-100 rounded-xl border border-slate-200" />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i}>
                      <div className="h-3.5 w-20 bg-slate-200 rounded mb-1.5" />
                      <div className="h-10 w-full bg-slate-100 rounded-xl border border-slate-200" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Carte 2 : Énoncé & Importation PDF */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-100" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-48 bg-slate-200 rounded" />
                    <div className="h-3 w-60 bg-slate-100 rounded" />
                  </div>
                </div>
                <div className="h-8 w-36 bg-slate-100 rounded-xl" />
              </div>
              <div className="h-28 w-full rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/70" />
              <div className="h-72 w-full rounded-xl bg-slate-100 border border-slate-200" />
            </div>
          </div>

          {/* Colonne Droite (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
              <div className="h-4 w-40 bg-slate-200 rounded" />
              <div className="space-y-2.5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-4 w-full bg-slate-100 rounded" />
                ))}
              </div>
              <div className="h-10 w-full bg-amber-200/70 rounded-xl" />
              <div className="h-9 w-full bg-slate-100 rounded-xl" />
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
              <div className="h-3.5 w-36 bg-slate-200 rounded" />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 w-full bg-slate-50 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      {/* ── Entête supérieure avec fil d'ariane & actions rapides ── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(basePath)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Retour aux sujets"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Link to={basePath} className="hover:underline">
                  Sujets d'examens
                </Link>
                <span>/</span>
                <span className="text-slate-600 font-medium">
                  {isEditMode ? "Modifier le sujet" : "Nouveau sujet officiel"}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                {isEditMode ? `Modifier : ${form.titre || "Sans titre"}` : "Créer un sujet d'examen"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate(basePath)}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs transition-all disabled:opacity-60 cursor-pointer"
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
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-sm text-red-700">
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-500" />
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
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
              <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <BookOpen size={18} className="text-amber-500" />
                Informations officielles de l'épreuve
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Titre complet de l'épreuve <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.titre}
                    onChange={(e) => handleChange("titre", e.target.value)}
                    placeholder="Ex: BAC 2023 — Épreuve de Physique-Chimie (Terminale SM)"
                    className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                      Matière <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={form.matiere_id}
                      onChange={(e) => handleChange("matiere_id", e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50"
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
                    <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                      Niveau scolaire <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={form.niveau_id}
                      onChange={(e) => handleChange("niveau_id", e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50"
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
                    <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                      Type d'examen
                    </label>
                    <select
                      value={form.type}
                      onChange={(e) =>
                        handleChange("type", e.target.value as SujetFormState["type"])
                      }
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50"
                    >
                      <option value="bac">Baccalauréat Unique</option>
                      <option value="brevet">BEPC / Brevet</option>
                      <option value="composition">Composition</option>
                      <option value="autre">CEE / Autre</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                      Année de session
                    </label>
                    <input
                      type="number"
                      min={1990}
                      max={2035}
                      value={form.annee}
                      onChange={(e) => handleChange("annee", Number(e.target.value))}
                      className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                      Session
                    </label>
                    <select
                      value={form.session}
                      onChange={(e) =>
                        handleChange("session", e.target.value as SujetFormState["session"])
                      }
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50"
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
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <PenTool size={18} className="text-amber-500" />
                    Texte intégral & Consignes de l'épreuve
                  </h2>
                  <p className="text-xs text-slate-500">
                    Saisissez le texte complet ou importez directement un document PDF pour remplir automatiquement l'énoncé.
                  </p>
                </div>

                {/* Tabs Écriture / Aperçu */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setActiveTab("edit")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                      activeTab === "edit"
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <PenTool size={13} />
                    Éditeur
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("preview")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                      activeTab === "preview"
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <Eye size={13} />
                    Aperçu
                  </button>
                </div>
              </div>

              {/* ── Zone Import PDF interactive ── */}
              <div className="mb-4">
                <label
                  className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl text-center transition-all cursor-pointer ${
                    extractingPdf
                      ? "border-amber-400 bg-amber-50/70 cursor-wait"
                      : pdfSuccessName
                      ? "border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50/70"
                      : "border-slate-200 hover:border-amber-400 hover:bg-amber-50/20"
                  }`}
                >
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    disabled={extractingPdf}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                      e.target.value = "";
                    }}
                    className="hidden"
                  />

                  {extractingPdf ? (
                    <div className="w-full max-w-md mx-auto space-y-2.5 animate-pulse py-1">
                      <div className="h-3.5 bg-amber-200/80 rounded w-3/4 mx-auto" />
                      <div className="h-2.5 bg-amber-200/60 rounded w-full" />
                      <div className="h-2.5 bg-amber-200/60 rounded w-5/6 mx-auto" />
                    </div>
                  ) : pdfSuccessName ? (
                    <div className="flex flex-col items-center gap-1.5 text-emerald-800">
                      <CheckCircle2 size={32} className="text-emerald-500" />
                      <p className="text-sm font-bold">Fichier extrait avec succès</p>
                      <p className="text-xs text-emerald-600">
                        Document source : <span className="font-medium underline">{pdfSuccessName}</span> (cliquez pour remplacer)
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="p-3 bg-amber-50 text-amber-600 rounded-full mb-1">
                        <UploadCloud size={24} />
                      </div>
                      <p className="text-sm font-bold text-slate-800">
                        Glissez-déposez le PDF de l'épreuve ici, ou <span className="text-amber-600 underline">parcourez</span>
                      </p>
                      <p className="text-xs text-slate-400">
                        Le texte de l'énoncé, les questions et barèmes seront automatiquement extraits
                      </p>
                    </div>
                  )}
                </label>
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
                    className="w-full p-4 font-mono text-xs sm:text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50 leading-relaxed"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 px-1">
                    <span>Supporte les formules KaTeX / LaTeX et le formatage texte</span>
                    <span>{form.ennonce.length} caractères | {form.ennonce.split(/\s+/).filter(Boolean).length} mots</span>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl min-h-[300px] whitespace-pre-wrap font-serif text-sm text-slate-800 leading-relaxed">
                  {form.ennonce ? (
                    form.ennonce
                  ) : (
                    <p className="text-slate-400 italic text-center py-12">
                      L'énoncé est actuellement vide. Rédigez du texte ou importez un PDF pour afficher l'aperçu.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Colonne Droite : Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
            {/* Carte 1 : Actions principales */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Sparkles size={16} className="text-amber-500" />
                Publication & Statut
              </h3>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100">
                  <span className="text-slate-500">Statut de l'épreuve</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Prêt à publier
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100">
                  <span className="text-slate-500">Visibilité</span>
                  <span className="font-medium text-slate-800">Public (Élèves & Profs)</span>
                </div>
                <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100">
                  <span className="text-slate-500">Mode</span>
                  <span className="font-medium text-slate-800">{isEditMode ? "Mise à jour" : "Création"}</span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs transition-all disabled:opacity-60 cursor-pointer"
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
                  className="w-full text-center text-xs font-medium text-slate-500 hover:text-slate-700 py-2 transition-colors cursor-pointer"
                >
                  Annuler les modifications
                </button>
              </div>
            </div>

            {/* Carte 2 : Synthèse pédagogique en direct */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <GraduationCap size={16} className="text-amber-500" />
                Synthèse de l'épreuve
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <p className="text-slate-400 mb-0.5">Matière officielle</p>
                  <p className="font-semibold text-slate-800">{selectedMatiereLabel}</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <p className="text-slate-400 mb-0.5">Niveau & Cycle</p>
                  <p className="font-semibold text-slate-800">{selectedNiveauLabel}</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <p className="text-slate-400 mb-0.5">Session d'examen</p>
                  <p className="font-semibold text-slate-800">
                    Session {form.session.toUpperCase()} {form.annee} ({form.type.toUpperCase()})
                  </p>
                </div>
              </div>
            </div>

            {/* Carte 3 : Conseils de rédaction */}
            <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-4 text-xs text-amber-900 space-y-2">
              <p className="font-bold flex items-center gap-1.5 text-amber-800">
                <FileText size={14} />
                Conseils officiels MEPU-A
              </p>
              <ul className="list-disc pl-4 space-y-1 text-amber-800/90">
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

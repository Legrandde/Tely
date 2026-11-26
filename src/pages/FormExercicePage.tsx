import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  PenTool,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Eye,
  BookOpen,
  GraduationCap,
  Image as ImageIcon,
} from "lucide-react";
import {
  createExercice,
  updateExercice,
  loadMatiereOptions,
  loadNiveauOptions,
  loadCategorieOptions,
} from "../services/resourceService";
import { getExercice } from "../services/exerciceService";
import { useToast } from "../context/ToastContext";
import api from "../api/axio";
import ContenuScientifique from "@/components/ui/ContenuScientifique";
import type { Difficulte, ExerciceType } from "../types/exercice";

interface ExerciceFormState {
  titre: string;
  enonce: string;
  type: ExerciceType;
  difficulte: Difficulte;
  est_actif: boolean;
  matiere_id: string;
  niveau_id: string;
  categorie_id?: string;
  image?: string;
}

const INITIAL_STATE: ExerciceFormState = {
  titre: "",
  enonce: "",
  type: "classique",
  difficulte: "moyen",
  est_actif: true,
  matiere_id: "",
  niveau_id: "",
  categorie_id: "",
  image: "",
};

export default function FormExercicePage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const isProfesseur = location.pathname.toLowerCase().includes("professeur");
  const basePath = isProfesseur ? "/Dashboard-professeur/exercices" : "/Dashbord-admin/exercices";

  const [form, setForm] = useState<ExerciceFormState>(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [fetchingInitial, setFetchingInitial] = useState(isEditMode);
  const [error, setError] = useState<string>();
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  // Options
  const [matieres, setMatieres] = useState<{ value: string; label: string }[]>([]);
  const [niveaux, setNiveaux] = useState<{ value: string; label: string }[]>([]);
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);

  // Extraction PDF
  const [extractingPdf, setExtractingPdf] = useState(false);
  const [pdfSuccessName, setPdfSuccessName] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const [matOptions, nivOptions, catOptions] = await Promise.all([
          loadMatiereOptions(),
          loadNiveauOptions(),
          loadCategorieOptions(),
        ]);
        setMatieres(matOptions);
        setNiveaux(nivOptions);
        setCategories(catOptions);

        if (isEditMode && id) {
          const exData = await getExercice(id);
          const raw = exData as unknown as Record<string, unknown>;
          setForm({
            titre: String(raw.titre ?? ""),
            enonce: String(raw.enonce ?? ""),
            type: (raw.type as ExerciceType) || "classique",
            difficulte: (raw.difficulte as Difficulte) || "moyen",
            est_actif: raw.est_actif !== false,
            matiere_id:
              typeof raw.matiere === "object" && raw.matiere !== null
                ? String((raw.matiere as { id?: string | number }).id ?? "")
                : String(raw.matiere_id ?? ""),
            niveau_id:
              typeof raw.niveau === "object" && raw.niveau !== null
                ? String((raw.niveau as { id?: string | number }).id ?? "")
                : String(raw.niveau_id ?? ""),
            categorie_id:
              typeof raw.categorie === "object" && raw.categorie !== null
                ? String((raw.categorie as { id?: string | number }).id ?? "")
                : String(raw.categorie_id ?? ""),
            image: String(raw.image ?? raw.image_url ?? ""),
          });
        }
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          "Impossible de charger les données de l'exercice.";
        setError(msg);
        toast.error(msg);
      } finally {
        setFetchingInitial(false);
      }
    }
    init();
  }, [id, isEditMode, toast]);

  function handleChange(field: keyof ExerciceFormState, value: unknown) {
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
          enonce: data.text,
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
      setError("Le titre de l'exercice est obligatoire.");
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
    if (!form.enonce.trim()) {
      setError("Veuillez rédiger ou extraire l'énoncé de l'exercice.");
      return;
    }

    setError(undefined);
    setLoading(true);

    try {
      const payload: Record<string, unknown> = {
        titre: form.titre,
        enonce: form.enonce,
        type: form.type,
        difficulte: form.difficulte,
        est_actif: form.est_actif,
        matiere_id: form.matiere_id,
        niveau_id: form.niveau_id,
      };
      if (form.categorie_id) payload.categorie_id = form.categorie_id;
      if (form.image) payload.image = form.image;

      if (isEditMode && id) {
        await updateExercice(id, payload);
        toast.success("Exercice mis à jour avec succès !");
      } else {
        await createExercice(payload);
        toast.success("Nouvel exercice créé avec succès !");
      }
      navigate(basePath);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Erreur lors de l'enregistrement de l'exercice.";
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
                <div className="h-3 w-36 bg-gray-100 rounded" />
                <div className="h-5 w-52 bg-gray-200 rounded" />
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
            {/* Carte 1 : Métadonnées */}
            <div className="tely-card p-5 sm:p-6 space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-gray-200">
                <div className="w-8 h-8 rounded-lg bg-gray-100" />
                <div className="space-y-1.5">
                  <div className="h-4 w-48 bg-gray-200 rounded" />
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
                    <div className="h-3.5 w-28 bg-gray-200 rounded mb-1.5" />
                    <div className="h-10 w-full bg-gray-100 rounded-[10px] border border-gray-200" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i}>
                      <div className="h-3.5 w-24 bg-gray-200 rounded mb-1.5" />
                      <div className="h-10 w-full bg-gray-100 rounded-[10px] border border-gray-200" />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="h-3.5 w-44 bg-gray-200 rounded mb-1.5" />
                  <div className="h-10 w-full bg-gray-100 rounded-[10px] border border-gray-200" />
                </div>
              </div>
            </div>

            {/* Carte 2 : Énoncé & Importation PDF */}
            <div className="tely-card p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gray-100" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-44 bg-gray-200 rounded" />
                    <div className="h-3 w-56 bg-gray-100 rounded" />
                  </div>
                </div>
                <div className="h-8 w-36 bg-gray-100 rounded-[10px]" />
              </div>
              <div className="h-28 w-full rounded-[10px] border-2 border-dashed border-gray-200 bg-gray-50/70" />
              <div className="h-64 w-full rounded-[10px] bg-gray-100 border border-gray-200" />
            </div>
          </div>

          {/* Colonne Droite (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="tely-card p-5 space-y-4">
              <div className="h-4 w-44 bg-gray-200 rounded" />
              <div className="h-10 w-full bg-gray-50 rounded-[10px] border border-gray-200" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-100 rounded" />
                <div className="h-4 w-full bg-gray-100 rounded" />
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
              className="tely-icon-btn text-gray-900 hover:bg-white"
              title="Retour aux exercices"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Link to={basePath} className="hover:underline">
                  Exercices
                </Link>
                <span>/</span>
                <span className="text-gray-900 font-medium">
                  {isEditMode ? "Modifier l'exercice" : "Nouvel exercice"}
                </span>
              </div>
              <h1 className="tely-h1">
                {isEditMode ? `Modifier : ${form.titre || "Sans titre"}` : "Créer un exercice"}
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
                  <span>{isEditMode ? "Mettre à jour" : "Publier l'exercice"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Formulaire (Grille 2 colonnes) ── */}
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
            {/* Boîte 1 : Métadonnées */}
            <div className="tely-card p-5 sm:p-6">
              <h2 className="tely-title text-lg mb-4 flex items-center gap-2">
                <BookOpen size={18} className="text-gray-900" />
                Détails et classification de l'exercice
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="tely-label block mb-1.5">
                    Titre de l'exercice <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.titre}
                    onChange={(e) => handleChange("titre", e.target.value)}
                    placeholder="Ex: Étude de fonction logarithme népérien et calcul intégral"
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
                      Type d'exercice
                    </label>
                    <select
                      value={form.type}
                      onChange={(e) =>
                        handleChange("type", e.target.value as ExerciceType)
                      }
                      className="tely-input"
                    >
                      <option value="classique">Exercice classique</option>
                      <option value="qcm">QCM</option>
                      <option value="probleme">Problème de synthèse</option>
                      <option value="sujet_examen">Sujet d'examen</option>
                    </select>
                  </div>

                  <div>
                    <label className="tely-label block mb-1.5">
                      Difficulté
                    </label>
                    <select
                      value={form.difficulte}
                      onChange={(e) =>
                        handleChange("difficulte", e.target.value as Difficulte)
                      }
                      className="tely-input"
                    >
                      <option value="facile">Facile</option>
                      <option value="moyen">Moyen</option>
                      <option value="difficile">Difficile / Avancé</option>
                    </select>
                  </div>

                  <div>
                    <label className="tely-label block mb-1.5">
                      Catégorie (optionnelle)
                    </label>
                    <select
                      value={form.categorie_id}
                      onChange={(e) => handleChange("categorie_id", e.target.value)}
                      className="tely-input"
                    >
                      <option value="">Aucune</option>
                      {categories.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="tely-label block mb-1.5">
                    URL de l'image d'illustration (optionnelle)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-900">
                      <ImageIcon size={16} />
                    </div>
                    <input
                      type="text"
                      value={form.image ?? ""}
                      onChange={(e) => handleChange("image", e.target.value)}
                      placeholder="https://... ou /banner1.png"
                      className="tely-input pl-10 pr-4"
                    />
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
                    Énoncé de l'exercice
                  </h2>
                  <p className="tely-subtitle">
                    Saisissez l'énoncé ou téléversez un PDF d'exercice ou de fiche de TD pour extraction automatique.
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-[10px]">
                  <button
                    type="button"
                    onClick={() => setActiveTab("edit")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[10px] transition-all ${
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
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[10px] transition-all ${
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

              {/* Zone Drag & Drop PDF */}
              <div className="mb-4">
                <label
                  className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-[10px] text-center transition-all cursor-pointer ${
                    extractingPdf
                      ? "border-gray-900 bg-gray-50 cursor-wait"
                      : pdfSuccessName
                      ? "border-gray-900 bg-gray-50 hover:bg-gray-100"
                      : "border-gray-200 bg-gray-50 hover:border-gray-900"
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
                      <div className="h-3.5 bg-gray-200 rounded w-3/4 mx-auto" />
                      <div className="h-2.5 bg-gray-200/70 rounded w-full" />
                      <div className="h-2.5 bg-gray-200/70 rounded w-5/6 mx-auto" />
                    </div>
                  ) : pdfSuccessName ? (
                    <div className="flex flex-col items-center gap-1.5 text-gray-900">
                      <CheckCircle2 size={32} className="text-gray-900" />
                      <p className="text-sm font-bold">Fiche PDF extraite avec succès</p>
                      <p className="text-xs text-gray-500">
                        Fichier source : <span className="font-medium underline">{pdfSuccessName}</span> (cliquez pour remplacer)
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="p-3 bg-white text-gray-900 rounded-full mb-1">
                        <UploadCloud size={24} />
                      </div>
                      <p className="text-sm font-bold text-gray-800">
                        Glissez-déposez le PDF de l'exercice ici, ou <span className="tely-link underline">parcourez</span>
                      </p>
                      <p className="text-xs text-gray-400">
                        Le texte de l'exercice sera automatiquement extrait et injecté dans l'éditeur
                      </p>
                    </div>
                  )}
                </label>
              </div>

              {activeTab === "edit" ? (
                <div className="relative">
                  <textarea
                    required
                    rows={12}
                    value={form.enonce}
                    onChange={(e) => handleChange("enonce", e.target.value)}
                    placeholder="Rédigez l'énoncé complet, les sous-questions 1), 2), 3) ou utilisez l'import PDF ci-dessus."
                    className="tely-input leading-relaxed"
                  />
                  <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 px-1">
                    <span>Supporte KaTeX pour les équations mathématiques</span>
                    <span>{form.enonce.length} caractères | {form.enonce.split(/\s+/).filter(Boolean).length} mots</span>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-muted/40 border border-border rounded-[10px] min-h-[260px] text-sm">
                  {form.enonce ? (
                    <ContenuScientifique texte={form.enonce} />
                  ) : (
                    <p className="text-muted-foreground italic text-center py-10">
                      L'énoncé est vide pour le moment.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Colonne Droite (4 cols) */}
          <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
            {/* Publication */}
            <div className="tely-card p-5">
              <h3 className="tely-title text-lg mb-3">
                Publication & Disponibilité
              </h3>

              <div className="space-y-3 mb-4">
                <label className="flex items-center justify-between p-2.5 rounded-[10px] border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                  <span className="text-xs font-medium text-gray-700">Rendre l'exercice actif</span>
                  <input
                    type="checkbox"
                    checked={form.est_actif}
                    onChange={(e) => handleChange("est_actif", e.target.checked)}
                    className="tely-checkbox cursor-pointer"
                  />
                </label>

                <div className="flex items-center justify-between text-xs py-1.5 px-1 border-b border-gray-200">
                  <span className="text-gray-500">Mode</span>
                  <span className="font-medium text-gray-800">{isEditMode ? "Mise à jour" : "Création"}</span>
                </div>
                <div className="flex items-center justify-between text-xs py-1.5 px-1 border-b border-gray-200">
                  <span className="text-gray-500">Difficulté</span>
                  <span className="capitalize font-semibold text-gray-900">{form.difficulte}</span>
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
                      <span>{isEditMode ? "Mettre à jour" : "Publier l'exercice"}</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(basePath)}
                  className="tely-btn-outline w-full"
                >
                  Annuler
                </button>
              </div>
            </div>

            {/* Synthèse */}
            <div className="tely-card p-5">
              <h3 className="tely-title text-lg mb-3 flex items-center gap-2">
                <GraduationCap size={16} className="text-gray-900" />
                Synthèse pédagogique
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 bg-gray-50 rounded-[10px]">
                  <p className="text-gray-400 mb-0.5">Matière</p>
                  <p className="font-semibold text-gray-800">{selectedMatiereLabel}</p>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-[10px]">
                  <p className="text-gray-400 mb-0.5">Niveau cible</p>
                  <p className="font-semibold text-gray-800">{selectedNiveauLabel}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

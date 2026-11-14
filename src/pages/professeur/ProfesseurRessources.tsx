import { useEffect, useState, useMemo } from "react";
import {
  Pencil,
  Trash2,
  FileText,
  Search,
  Filter,
  Download,
  Upload,
} from "lucide-react";
import ConfirmModal from "../../components/ui/ConfirmModal";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../context/ToastContext";
import {
  listRessources,
  createRessource,
  updateRessource,
  deleteRessource,
  listMatieres,
  listNiveaux,
} from "../../services/resourceService";
import type { RessourceItem } from "../../types/admin";

const TYPE_CONFIG: Record<string, { label: string; class: string }> = {
  cours: { label: "Cours complet", class: "text-gray-900" },
  resume: { label: "Fiche résumé", class: "text-gray-900" },
  fiche: { label: "Fiche méthode", class: "text-gray-900" },
  td: { label: "Feuille de TD", class: "text-gray-900" },
  autre: { label: "Autre document", class: "text-gray-600" },
};

export default function ProfesseurRessources() {
  const [ressources, setRessources] = useState<RessourceItem[]>([]);
  const [matieres, setMatieres] = useState<Array<{ id: string | number; nom: string }>>([]);
  const [niveaux, setNiveaux] = useState<Array<{ id: string | number; libelle: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterMatiere, setFilterMatiere] = useState<string>("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRessource, setEditingRessource] = useState<RessourceItem | null>(null);

  // Form states
  const [formTitre, setFormTitre] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formType, setFormType] = useState("cours");
  const [formMatiereId, setFormMatiereId] = useState("");
  const [formNiveauId, setFormNiveauId] = useState("");
  const [formFile, setFormFile] = useState<File | null>(null);
  const [formUrl, setFormUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string>();

  const [deleteTarget, setDeleteTarget] = useState<RessourceItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const toast = useToast();

  async function fetchData() {
    setLoading(true);
    setError(undefined);
    try {
      const [resData, matData, nivData] = await Promise.all([
        listRessources(),
        listMatieres(),
        listNiveaux(),
      ]);
      setRessources(resData);
      setMatieres(matData);
      setNiveaux(nivData);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Impossible de charger les ressources";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      listRessources(),
      listMatieres(),
      listNiveaux(),
    ])
      .then(([resData, matData, nivData]) => {
        if (!cancelled) {
          setRessources(resData);
          setMatieres(matData);
          setNiveaux(nivData);
          setError(undefined);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const errorMsg =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            "Impossible de charger les ressources";
          setError(errorMsg);
          toast.error(errorMsg);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [toast]);

  const filteredRessources = useMemo(() => {
    return ressources.filter((r) => {
      const matchSearch =
        !search.trim() ||
        r.titre.toLowerCase().includes(search.toLowerCase()) ||
        (r.description && r.description.toLowerCase().includes(search.toLowerCase())) ||
        (r.matiere?.nom && r.matiere.nom.toLowerCase().includes(search.toLowerCase())) ||
        (r.niveau?.libelle && r.niveau.libelle.toLowerCase().includes(search.toLowerCase()));

      const matchType = filterType === "all" || r.type === filterType;
      const matchMatiere =
        filterMatiere === "all" || String(r.matiere_id ?? r.matiere?.id) === String(filterMatiere);

      return matchSearch && matchType && matchMatiere;
    });
  }, [ressources, search, filterType, filterMatiere]);

  function openCreate() {
    setEditingRessource(null);
    setFormTitre("");
    setFormDescription("");
    setFormType("cours");
    setFormMatiereId(matieres[0] ? String(matieres[0].id) : "");
    setFormNiveauId(niveaux[0] ? String(niveaux[0].id) : "");
    setFormFile(null);
    setFormUrl("");
    setFormError(undefined);
    setModalOpen(true);
  }

  function openEdit(r: RessourceItem) {
    setEditingRessource(r);
    setFormTitre(r.titre);
    setFormDescription(r.description ?? "");
    setFormType(r.type);
    setFormMatiereId(String(r.matiere?.id ?? r.matiere_id ?? ""));
    setFormNiveauId(String(r.niveau?.id ?? r.niveau_id ?? ""));
    setFormFile(null);
    setFormUrl(r.fichier_url ?? r.fichier_path ?? "");
    setFormError(undefined);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingRessource(null);
    setFormError(undefined);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formTitre.trim()) {
      setFormError("Le titre de la ressource est obligatoire.");
      return;
    }
    if (!formMatiereId) {
      setFormError("Veuillez sélectionner une matière.");
      return;
    }
    if (!formNiveauId) {
      setFormError("Veuillez sélectionner un niveau.");
      return;
    }
    if (!editingRessource && !formFile && !formUrl.trim()) {
      setFormError("Veuillez téléverser un fichier (PDF, etc.) ou fournir une URL.");
      return;
    }

    setSubmitting(true);
    setFormError(undefined);

    try {
      const formData = new FormData();
      formData.append("titre", formTitre);
      if (formDescription) formData.append("description", formDescription);
      formData.append("type", formType);
      formData.append("matiere_id", formMatiereId);
      formData.append("niveau_id", formNiveauId);

      if (formFile) {
        formData.append("fichier", formFile);
      } else if (
        formUrl.trim() &&
        formUrl.trim() !== (editingRessource?.fichier_url ?? editingRessource?.fichier_path ?? "")
      ) {
        formData.append("fichier_path", formUrl.trim());
      }

      if (editingRessource) {
        await updateRessource(editingRessource.id, formData);
        toast.success("Ressource modifiée avec succès.");
      } else {
        await createRessource(formData);
        toast.success("Ressource pédagogique publiée avec succès.");
      }

      closeModal();
      fetchData();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Erreur lors de l'enregistrement de la ressource.";
      setFormError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteRessource(deleteTarget.id);
      setRessources((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      toast.success(`La ressource "${deleteTarget.titre}" a été supprimée.`);
      setDeleteTarget(null);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Suppression impossible.";
      toast.error(errorMsg);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Entête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="tely-h1">Documents & Ressources PDF</h1>
          <p className="tely-subtitle mt-1">
            Mettez à disposition de vos élèves des cours complets, des fiches méthodes et des résumés téléchargeables
          </p>
        </div>

        <button
          onClick={openCreate}
          className="tely-btn self-start sm:self-auto"
        >
          <Upload size={16} />
          Publier un document PDF
        </button>
      </div>

      {/* Barre d'outils / Recherche & Filtres */}
      <div className="flex flex-col lg:flex-row items-center gap-3 tely-card p-3.5">
        <div className="relative flex-1 w-full lg:min-w-[260px] lg:max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-900 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par titre ou description..."
            className="tely-input pl-10"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <div className="flex items-center gap-1.5 tely-label">
            <Filter size={14} className="text-gray-900" /> Type :
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="tely-input w-auto max-w-[190px] truncate"
          >
            <option value="all">Tous les types</option>
            <option value="cours">Cours complets</option>
            <option value="resume">Fiches résumés</option>
            <option value="fiche">Fiches méthodes</option>
            <option value="td">Feuilles de TD</option>
            <option value="autre">Autres</option>
          </select>

          <div className="flex items-center gap-1.5 tely-label ml-1">
            Matière :
          </div>
          <select
            value={filterMatiere}
            onChange={(e) => setFilterMatiere(e.target.value)}
            className="tely-input w-auto max-w-[190px] truncate"
          >
            <option value="all">Toutes matières</option>
            {matieres.map((m) => (
              <option key={m.id} value={String(m.id)}>
                {m.nom}
              </option>
            ))}
          </select>
        </div>

        <div className="lg:ml-auto tely-label whitespace-nowrap">
          Total : <span className="font-semibold text-gray-800">{filteredRessources.length}</span> document(s)
        </div>
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="overflow-x-auto tely-card animate-pulse">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left tely-overline border-b border-gray-100">
                <th className="px-5 py-3.5">Document</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Matière & Niveau</th>
                <th className="px-5 py-3.5">Enseignant</th>
                <th className="px-5 py-3.5 text-center">Fichier</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  <td className="px-5 py-3.5 max-w-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 shrink-0" />
                      <div className="space-y-1.5">
                        <div className="h-4 w-40 bg-gray-200 rounded" />
                        <div className="h-3 w-48 bg-gray-100 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="h-5 w-24 bg-gray-100 rounded-full" />
                  </td>
                  <td className="px-5 py-3.5 space-y-1.5">
                    <div className="h-3.5 w-24 bg-gray-200 rounded" />
                    <div className="h-3 w-20 bg-gray-100 rounded" />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="h-3.5 w-28 bg-gray-100 rounded" />
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <div className="h-5 w-16 bg-gray-100 rounded-md mx-auto" />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <div className="w-7 h-7 rounded-lg bg-gray-100" />
                      <div className="w-7 h-7 rounded-lg bg-gray-100" />
                      <div className="w-7 h-7 rounded-lg bg-gray-100" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : error ? (
        <div className="py-16 text-center tely-card tely-error">
          {error}
        </div>
      ) : filteredRessources.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center tely-card">
          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
            <FileText size={22} className="text-gray-900" />
          </div>
          <p className="text-sm text-gray-500 font-medium">Aucun document pour le moment</p>
          <p className="text-xs text-gray-400 mt-1 max-w-sm">
            {search || filterType !== "all" || filterMatiere !== "all"
              ? "Aucun document ne correspond à vos filtres."
              : "Téléversez vos fiches de cours, polycopiés et formulaires au format PDF."}
          </p>
          {!search && filterType === "all" && filterMatiere === "all" && (
            <button
              onClick={openCreate}
              className="tely-link text-sm mt-3"
            >
              Publier un premier document PDF
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto tely-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left tely-overline border-b border-gray-100">
                <th className="px-5 py-3.5">Document</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Matière & Niveau</th>
                <th className="px-5 py-3.5">Enseignant</th>
                <th className="px-5 py-3.5 text-center">Fichier</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRessources.map((r) => {
                const typeInfo = TYPE_CONFIG[r.type] ?? TYPE_CONFIG.autre;
                return (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-900 max-w-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-[10px] bg-gray-50 text-gray-900 flex items-center justify-center shrink-0">
                          <FileText size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{r.titre}</p>
                          <p className="text-xs text-gray-400 truncate max-w-sm">
                            {r.description || <span className="italic">Aucune description</span>}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`tely-chip ${typeInfo.class}`}
                      >
                        {typeInfo.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-700">
                      <div className="text-xs">
                        <strong className="text-gray-900">{r.matiere?.nom ?? "—"}</strong>
                        <span className="text-gray-400 block">{r.niveau?.libelle ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-600">
                      {r.professeur?.user
                        ? `${r.professeur.user.prenom} ${r.professeur.user.nom}`
                        : "Enseignant certifié"}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="tely-chip uppercase font-mono">
                        {r.format || "PDF"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {r.fichier_url && (
                          <a
                            href={r.fichier_url}
                            target="_blank"
                            rel="noreferrer"
                            title="Télécharger / Visualiser"
                            className="tely-icon-btn text-gray-900"
                          >
                            <Download size={15} />
                          </a>
                        )}
                        <button
                          onClick={() => openEdit(r)}
                          title="Modifier"
                          className="tely-icon-btn text-gray-900"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(r)}
                          title="Supprimer"
                          className="tely-icon-btn text-gray-900 hover:bg-red-50"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Déposer / Modifier une Ressource */}
      <Modal open={modalOpen} onClose={closeModal}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <h2 className="tely-title text-xl">
              {editingRessource ? "Modifier la ressource" : "Publier une ressource pédagogique"}
            </h2>
            <p className="tely-subtitle mt-1">
              Partagez des fiches de cours, résumés de formules ou exercices complémentaires en PDF.
            </p>
          </div>

          {formError && (
            <div className="tely-error">
              {formError}
            </div>
          )}

          <div>
            <label className="tely-label mb-1.5 block">
              Titre du document <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formTitre}
              onChange={(e) => setFormTitre(e.target.value)}
              placeholder="Ex: Formulaire complet de trigonométrie et dérivées"
              className="tely-input"
            />
          </div>

          <div>
            <label className="tely-label mb-1.5 block">
              Type de document <span className="text-red-500">*</span>
            </label>
            <select
              value={formType}
              onChange={(e) => setFormType(e.target.value)}
              className="tely-input"
            >
              <option value="cours">Cours complet</option>
              <option value="resume">Fiche résumé / Mémento</option>
              <option value="fiche">Fiche méthode</option>
              <option value="td">Feuille de TD</option>
              <option value="autre">Autre document</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="tely-label mb-1.5 block">
                Matière <span className="text-red-500">*</span>
              </label>
              <select
                value={formMatiereId}
                onChange={(e) => setFormMatiereId(e.target.value)}
                className="tely-input"
              >
                <option value="">Sélectionner une matière...</option>
                {matieres.map((m) => (
                  <option key={m.id} value={String(m.id)}>
                    {m.nom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="tely-label mb-1.5 block">
                Niveau scolaire <span className="text-red-500">*</span>
              </label>
              <select
                value={formNiveauId}
                onChange={(e) => setFormNiveauId(e.target.value)}
                className="tely-input"
              >
                <option value="">Sélectionner un niveau...</option>
                {niveaux.map((n) => (
                  <option key={n.id} value={String(n.id)}>
                    {n.libelle}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="tely-label mb-1.5 block">
              Description / Conseils de lecture
            </label>
            <textarea
              rows={3}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Explications pour l'élève sur l'utilisation de cette ressource..."
              className="tely-input"
            />
          </div>

          {/* Fichier upload */}
          <div className="p-4 border border-dashed border-gray-200 rounded-[10px] bg-gray-50 flex flex-col items-center justify-center text-center">
            <Upload size={22} className="text-gray-900 mb-2" />
            <span className="text-xs font-semibold text-gray-700">
              {formFile ? formFile.name : "Sélectionner un fichier (PDF, DOCX, etc.)"}
            </span>
            <span className="text-[11px] text-gray-400 mt-0.5">Taille maximale : 30 Mo</span>
            <input
              type="file"
              accept=".pdf,.docx,.doc,.odt,.txt"
              onChange={(e) => setFormFile(e.target.files?.[0] ?? null)}
              className="mt-2 text-xs text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-900 file:text-white hover:file:bg-gray-700 cursor-pointer"
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={closeModal}
              className="tely-btn-outline flex-1"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="tely-btn flex-1"
            >
              {submitting ? "Téléversement..." : editingRessource ? "Mettre à jour" : "Publier le document"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal confirmation suppression */}
      <ConfirmModal
        open={!!deleteTarget}
        title={`Supprimer la ressource "${deleteTarget?.titre}" ?`}
        description="Cette action est irréversible. Le document ne sera plus accessible aux apprenants."
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

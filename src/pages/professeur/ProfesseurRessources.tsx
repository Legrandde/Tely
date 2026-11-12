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
  cours: { label: "Cours complet", class: "bg-blue-50 text-blue-700 border-blue-200" },
  resume: { label: "Fiche résumé", class: "bg-amber-50 text-amber-700 border-amber-200" },
  fiche: { label: "Fiche méthode", class: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  td: { label: "Feuille de TD", class: "bg-purple-50 text-purple-700 border-purple-200" },
  autre: { label: "Autre document", class: "bg-gray-100 text-gray-700 border-gray-200" },
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
      } else if (formUrl.trim()) {
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
          <h1 className="text-xl font-bold text-gray-900">Documents & Ressources PDF</h1>
          <p className="text-sm text-gray-500">
            Mettez à disposition de vos élèves des cours complets, des fiches méthodes et des résumés téléchargeables
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 text-sm font-medium bg-amber-500 text-white rounded-xl px-4 py-2.5 hover:bg-amber-600 shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Upload size={16} />
          Publier un document PDF
        </button>
      </div>

      {/* Barre d'outils / Recherche & Filtres */}
      <div className="flex flex-col lg:flex-row items-center gap-3 bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 flex-1 w-full lg:max-w-md">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par titre ou description..."
            className="bg-transparent text-sm text-gray-800 outline-none w-full placeholder-gray-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Filter size={14} /> Type :
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2.5 py-2 bg-gray-50 text-gray-700 outline-none focus:ring-2 focus:ring-amber-200"
          >
            <option value="all">Tous les types</option>
            <option value="cours">Cours complets</option>
            <option value="resume">Fiches résumés</option>
            <option value="fiche">Fiches méthodes</option>
            <option value="td">Feuilles de TD</option>
            <option value="autre">Autres</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs text-gray-500 ml-1">
            Matière :
          </div>
          <select
            value={filterMatiere}
            onChange={(e) => setFilterMatiere(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2.5 py-2 bg-gray-50 text-gray-700 outline-none focus:ring-2 focus:ring-amber-200"
          >
            <option value="all">Toutes matières</option>
            {matieres.map((m) => (
              <option key={m.id} value={String(m.id)}>
                {m.nom}
              </option>
            ))}
          </select>
        </div>

        <div className="lg:ml-auto text-xs text-gray-500 whitespace-nowrap">
          Total : <span className="font-semibold text-gray-800">{filteredRessources.length}</span> document(s)
        </div>
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="py-20 text-center text-sm text-gray-400">
          Chargement des documents pédagogiques...
        </div>
      ) : error ? (
        <div className="py-16 text-center text-sm text-red-500 bg-red-50 rounded-xl border border-red-100">
          {error}
        </div>
      ) : filteredRessources.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-gray-100">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-3">
            <FileText size={22} className="text-amber-500" />
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
              className="text-sm font-medium text-amber-600 hover:text-amber-700 mt-3"
            >
              Publier un premier document PDF
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-100 rounded-2xl bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/75 text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
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
                  <tr key={r.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-900 max-w-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
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
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${typeInfo.class}`}
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
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700 uppercase font-semibold">
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
                            className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          >
                            <Download size={15} />
                          </a>
                        )}
                        <button
                          onClick={() => openEdit(r)}
                          title="Modifier"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(r)}
                          title="Supprimer"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
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
            <h2 className="text-lg font-bold text-gray-900">
              {editingRessource ? "Modifier la ressource" : "Publier une ressource pédagogique"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Partagez des fiches de cours, résumés de formules ou exercices complémentaires en PDF.
            </p>
          </div>

          {formError && (
            <div className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
              {formError}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">
              Titre du document <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formTitre}
              onChange={(e) => setFormTitre(e.target.value)}
              placeholder="Ex: Formulaire complet de trigonométrie et dérivées"
              className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">
              Type de document <span className="text-red-500">*</span>
            </label>
            <select
              value={formType}
              onChange={(e) => setFormType(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-200"
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
              <label className="text-xs font-semibold text-gray-600 mb-1 block">
                Matière <span className="text-red-500">*</span>
              </label>
              <select
                value={formMatiereId}
                onChange={(e) => setFormMatiereId(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-200"
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
              <label className="text-xs font-semibold text-gray-600 mb-1 block">
                Niveau scolaire <span className="text-red-500">*</span>
              </label>
              <select
                value={formNiveauId}
                onChange={(e) => setFormNiveauId(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-200"
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
            <label className="text-xs font-semibold text-gray-600 mb-1 block">
              Description / Conseils de lecture
            </label>
            <textarea
              rows={3}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Explications pour l'élève sur l'utilisation de cette ressource..."
              className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </div>

          {/* Fichier upload */}
          <div className="p-4 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/60 flex flex-col items-center justify-center text-center">
            <Upload size={22} className="text-amber-500 mb-2" />
            <span className="text-xs font-semibold text-gray-700">
              {formFile ? formFile.name : "Sélectionner un fichier (PDF, DOCX, etc.)"}
            </span>
            <span className="text-[11px] text-gray-400 mt-0.5">Taille maximale : 30 Mo</span>
            <input
              type="file"
              accept=".pdf,.docx,.doc,.odt,.txt"
              onChange={(e) => setFormFile(e.target.files?.[0] ?? null)}
              className="mt-2 text-xs text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 text-sm font-medium border border-gray-200 rounded-xl px-4 py-2.5 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 text-sm font-medium bg-amber-500 text-white rounded-xl px-4 py-2.5 hover:bg-amber-600 transition-colors disabled:opacity-60 cursor-pointer shadow-sm"
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

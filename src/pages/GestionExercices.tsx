import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Pencil, Trash2, BookOpen, Search, Eye, Filter } from "lucide-react";
import ConfirmModal from "../components/ui/ConfirmModal";
import ResourceForm from "../components/form/ResourceForm";
import Modal from "../components/ui/Modal";
import { exerciceSchema } from "../config/resourceSchemas";
import type { Exercice } from "../types/exercice";
import { deleteExercice, listExercices, listMatieres, listNiveaux } from "../services/resourceService";
import { useToast } from "../context/ToastContext";
import { resolveImageUrl } from "../utils/imageUrl";

const DIFFICULTE_STYLES: Record<string, string> = {
  facile: "text-emerald-700",
  moyen: "text-amber-700",
  difficile: "text-red-700",
};

const TYPE_LABELS: Record<string, string> = {
  classique: "Classique",
  qcm: "QCM",
  probleme: "Problème",
  sujet_examen: "Sujet d'examen",
};

export default function GestionExercices() {
  const [exercices, setExercices] = useState<Exercice[]>([]);
  const [matieres, setMatieres] = useState<Array<{ id: string | number; nom: string }>>([]);
  const [niveaux, setNiveaux] = useState<Array<{ id: string | number; libelle: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const [search, setSearch] = useState("");
  const [filterMatiere, setFilterMatiere] = useState<string>("all");
  const [filterNiveau, setFilterNiveau] = useState<string>("all");
  const [filterDifficulte, setFilterDifficulte] = useState<string>("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingExercice, setEditingExercice] = useState<Exercice | null>(null);
  const [viewExercice, setViewExercice] = useState<Exercice | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Exercice | null>(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  async function fetchExercices() {
    setLoading(true);
    setError(undefined);
    try {
      const [exData, matData, nivData] = await Promise.all([
        listExercices(),
        listMatieres(),
        listNiveaux(),
      ]);
      setExercices(exData);
      setMatieres(matData);
      setNiveaux(nivData);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Impossible de charger les exercices";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    Promise.all([listExercices(), listMatieres(), listNiveaux()])
      .then(([exData, matData, nivData]) => {
        if (!cancelled) {
          setExercices(exData);
          setMatieres(matData);
          setNiveaux(nivData);
          setError(undefined);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const errorMsg =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            "Impossible de charger les exercices";
          setError(errorMsg);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredExercices = useMemo(() => {
    return (exercices || []).filter((ex) => {
      const matchSearch =
        !search.trim() ||
        ex.titre?.toLowerCase().includes(search.toLowerCase()) ||
        ex.enonce?.toLowerCase().includes(search.toLowerCase()) ||
        (ex.matiere?.nom && ex.matiere.nom.toLowerCase().includes(search.toLowerCase())) ||
        (ex.niveau?.libelle && ex.niveau.libelle.toLowerCase().includes(search.toLowerCase()));

      const matchMatiere =
        filterMatiere === "all" || String(ex.matiere?.id) === String(filterMatiere);
      const matchNiveau =
        filterNiveau === "all" || String(ex.niveau?.id) === String(filterNiveau);
      const matchDifficulte =
        filterDifficulte === "all" || ex.difficulte === filterDifficulte;

      return matchSearch && matchMatiere && matchNiveau && matchDifficulte;
    });
  }, [exercices, search, filterMatiere, filterNiveau, filterDifficulte]);

  const navigate = useNavigate();
  const location = useLocation();
  const isProfesseur = location.pathname.toLowerCase().includes("professeur");
  const baseRoute = isProfesseur ? "/Dashboard-professeur/exercices" : "/Dashbord-admin/exercices";

  function openCreate() {
    navigate(`${baseRoute}/nouveau`);
  }

  function openEdit(exercice: Exercice) {
    navigate(`${baseRoute}/${exercice.id}/modifier`);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingExercice(null);
  }

  function handleFormSuccess() {
    toast.success(editingExercice ? "Exercice mis à jour avec succès" : "Nouvel exercice créé avec succès");
    closeModal();
    fetchExercices();
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteExercice(deleteTarget.id);
      setExercices((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      toast.success(`L'exercice "${deleteTarget.titre}" a été supprimé.`);
      setDeleteTarget(null);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Suppression impossible";
      toast.error(errorMsg);
    } finally {
      setDeleting(false);
    }
  }

  const initialValues = editingExercice
    ? {
        titre: editingExercice.titre,
        enonce: editingExercice.enonce,
        type: editingExercice.type,
        difficulte: editingExercice.difficulte,
        image: editingExercice.image || editingExercice.image_url || "",
        matiere_id: editingExercice.matiere?.id,
        niveau_id: editingExercice.niveau?.id,
        categorie_id: editingExercice.categorie?.id,
        professeur_id: editingExercice.professeur?.id,
        est_actif: editingExercice.est_actif,
      }
    : {
        type: "classique",
        difficulte: "moyen",
        est_actif: true,
        image: "",
      };

  return (
    <div className="space-y-6">
      {/* Entête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="tely-h1">Gestion des exercices</h1>
          <p className="tely-subtitle mt-1">
            Créez, éditez et organisez l'ensemble de la banque d'exercices et travaux dirigés
          </p>
        </div>

        <button
          onClick={openCreate}
          className="tely-btn self-start sm:self-auto"
        >
          <Plus size={16} />
          Ajouter un exercice
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
            placeholder="Rechercher par titre ou énoncé..."
            className="tely-input pl-10"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <div className="flex items-center gap-1.5 tely-label">
            <Filter size={14} className="text-gray-900" /> Matière :
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

          <div className="flex items-center gap-1.5 tely-label ml-1">
            Niveau :
          </div>
          <select
            value={filterNiveau}
            onChange={(e) => setFilterNiveau(e.target.value)}
            className="tely-input w-auto max-w-[190px] truncate"
          >
            <option value="all">Tous niveaux</option>
            {niveaux.map((n) => (
              <option key={n.id} value={String(n.id)}>
                {n.libelle}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1.5 tely-label ml-1">
            Difficulté :
          </div>
          <select
            value={filterDifficulte}
            onChange={(e) => setFilterDifficulte(e.target.value)}
            className="tely-input w-auto max-w-[190px] truncate"
          >
            <option value="all">Toutes</option>
            <option value="facile">Facile</option>
            <option value="moyen">Moyen</option>
            <option value="difficile">Difficile</option>
          </select>
        </div>

        <div className="lg:ml-auto tely-label whitespace-nowrap">
          Total : <span className="font-semibold text-gray-800">{filteredExercices.length}</span> exercice(s)
        </div>
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="overflow-x-auto tely-card animate-pulse">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left tely-overline border-b border-gray-100">
                <th className="px-5 py-3.5">Titre</th>
                <th className="px-5 py-3.5">Matière</th>
                <th className="px-5 py-3.5">Niveau</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Difficulté</th>
                <th className="px-5 py-3.5 text-center">Statut</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <tr key={i}>
                  <td className="px-5 py-3.5 max-w-xs space-y-1.5">
                    <div className="h-4 w-44 bg-gray-200 rounded" />
                    <div className="h-3 w-56 bg-gray-100 rounded" />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="h-3.5 w-24 bg-gray-200 rounded" />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="h-3.5 w-20 bg-gray-200 rounded" />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="h-5 w-16 bg-gray-100 rounded" />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="h-5 w-16 bg-gray-100 rounded-full" />
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <div className="h-5 w-14 bg-gray-100 rounded-full mx-auto" />
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
      ) : filteredExercices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center tely-card">
          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
            <BookOpen size={22} className="text-gray-900" />
          </div>
          <p className="text-sm text-gray-500 font-medium">Aucun exercice pour le moment</p>
          <p className="text-xs text-gray-400 mt-1 max-w-sm">
            {search || filterMatiere !== "all" || filterNiveau !== "all" || filterDifficulte !== "all"
              ? "Aucun exercice ne correspond aux filtres appliqués."
              : "Créez votre premier exercice avec son énoncé et ses caractéristiques."}
          </p>
          {!search && filterMatiere === "all" && filterNiveau === "all" && (
            <button
              onClick={openCreate}
              className="tely-link text-sm mt-3"
            >
              Créer le premier exercice
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto tely-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left tely-overline border-b border-gray-100">
                <th className="px-5 py-3.5">Titre</th>
                <th className="px-5 py-3.5">Matière</th>
                <th className="px-5 py-3.5">Niveau</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Difficulté</th>
                <th className="px-5 py-3.5 text-center">Statut</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredExercices.map((exercice) => (
                <tr
                  key={exercice.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-5 py-3.5 font-medium text-gray-900 max-w-xs">
                    <div className="truncate font-semibold">{exercice.titre}</div>
                    <div className="text-xs text-gray-400 truncate max-w-sm font-normal">
                      {exercice.enonce}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-700">
                    {exercice.matiere?.nom ?? "—"}
                  </td>
                  <td className="px-5 py-3.5 text-gray-700">
                    {exercice.niveau?.libelle ?? "—"}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">
                    <span className="tely-chip">
                      {TYPE_LABELS[exercice.type] ?? exercice.type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`tely-chip capitalize ${
                        DIFFICULTE_STYLES[exercice.difficulte] ?? "text-gray-600"
                      }`}
                    >
                      {exercice.difficulte}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span
                      className={`tely-chip ${
                        exercice.est_actif
                          ? "text-emerald-700"
                          : "text-gray-500"
                      }`}
                    >
                      {exercice.est_actif ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setViewExercice(exercice)}
                        title="Consulter l'énoncé"
                        className="tely-icon-btn text-gray-900"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => openEdit(exercice)}
                        title="Modifier"
                        className="tely-icon-btn text-gray-900"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(exercice)}
                        title="Supprimer"
                        className="tely-icon-btn text-gray-900 hover:bg-red-50"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Ajout / Modification */}
      <Modal open={modalOpen} onClose={closeModal}>
        <ResourceForm
          schema={exerciceSchema}
          resourceId={editingExercice?.id}
          initialValues={initialValues}
          onSuccess={handleFormSuccess}
          onCancel={closeModal}
        />
      </Modal>

      {/* Modal Visualisation Exercice */}
      <Modal open={!!viewExercice} onClose={() => setViewExercice(null)}>
        {viewExercice && (
          <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
            <div className="border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="tely-overline">
                  {TYPE_LABELS[viewExercice.type] ?? viewExercice.type}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className={`tely-chip capitalize ${DIFFICULTE_STYLES[viewExercice.difficulte]}`}>
                  {viewExercice.difficulte}
                </span>
              </div>
              <h2 className="tely-title text-xl">{viewExercice.titre}</h2>
              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                <span>Matière : <strong className="text-gray-800">{viewExercice.matiere?.nom ?? "Non définie"}</strong></span>
                <span>Niveau : <strong className="text-gray-800">{viewExercice.niveau?.libelle ?? "Non défini"}</strong></span>
              </div>
            </div>

            {(viewExercice.image || viewExercice.image_url) && (
              <div className="rounded-lg overflow-hidden max-h-56 bg-gray-100">
                <img
                  src={resolveImageUrl(viewExercice.image_url || viewExercice.image) || ""}
                  alt={viewExercice.titre}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="bg-gray-50 rounded-[10px] p-4">
              <h3 className="tely-overline mb-2">
                Énoncé de l'exercice
              </h3>
              <div className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
                {viewExercice.enonce}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setViewExercice(null)}
                className="tely-btn-outline"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal confirmation suppression */}
      <ConfirmModal
        open={!!deleteTarget}
        title={`Supprimer "${deleteTarget?.titre}" ?`}
        description="Cette action est irréversible. L'exercice et ses éventuelles corrections associées seront définitivement supprimés."
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

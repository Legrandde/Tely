import { useEffect, useState, useMemo } from "react";
import { Plus, Pencil, Trash2, Library, Search } from "lucide-react";
import ConfirmModal from "../components/ui/ConfirmModal";
import ResourceForm from "../components/form/ResourceForm";
import Modal from "../components/ui/Modal";
import { matiereSchema } from "../config/resourceSchemas";
import { deleteMatiere, listMatieres } from "../services/resourceService";
import type { MatiereItem } from "../types/admin";
import { useToast } from "../context/ToastContext";
import { resolveImageUrl } from "../utils/imageUrl";

export default function GestionMatieres() {
  const [matieres, setMatieres] = useState<MatiereItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMatiere, setEditingMatiere] = useState<MatiereItem | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<MatiereItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  async function fetchMatieres() {
    setLoading(true);
    setError(undefined);
    try {
      const data = await listMatieres();
      setMatieres(data);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Impossible de charger les matières";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    listMatieres()
      .then((data) => {
        if (!cancelled) {
          setMatieres(data);
          setError(undefined);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const errorMsg =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            "Impossible de charger les matières";
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

  const filteredMatieres = useMemo(() => {
    if (!search.trim()) return matieres;
    const q = search.toLowerCase();
    return matieres.filter(
      (m) =>
        m.nom.toLowerCase().includes(q) ||
        m.code.toLowerCase().includes(q) ||
        (m.description && m.description.toLowerCase().includes(q))
    );
  }, [matieres, search]);

  function openCreate() {
    setEditingMatiere(null);
    setModalOpen(true);
  }

  function openEdit(matiere: MatiereItem) {
    setEditingMatiere(matiere);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingMatiere(null);
  }

  function handleFormSuccess() {
    toast.success(editingMatiere ? "Matière mise à jour avec succès" : "Nouvelle matière créée avec succès");
    closeModal();
    fetchMatieres();
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteMatiere(deleteTarget.id);
      setMatieres((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      toast.success(`La matière "${deleteTarget.nom}" a été supprimée.`);
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

  const initialValues = editingMatiere
    ? {
        nom: editingMatiere.nom,
        code: editingMatiere.code,
        image: editingMatiere.image || editingMatiere.image_url || "",
        description: editingMatiere.description ?? "",
      }
    : {
        image: "/banner1.png",
      };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center font-bold">
            <Library size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Matières & Disciplines</h1>
            <p className="text-xs text-gray-500">
              Gérez les matières du programme scolaire, leurs codes officiels et illustrations.
            </p>
          </div>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} />
          Nouvelle matière
        </button>
      </div>

      {/* Barre d'outils / Recherche */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 flex-1 w-full sm:max-w-md">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou code (ex: MATH)..."
            className="bg-transparent text-sm text-gray-800 outline-none w-full placeholder-gray-400"
          />
        </div>
        <div className="text-xs text-gray-500 whitespace-nowrap self-end sm:self-auto">
          Total : <span className="font-semibold text-gray-800">{filteredMatieres.length}</span> matière(s)
        </div>
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="py-20 text-center text-sm text-gray-400">
          Chargement des matières...
        </div>
      ) : error ? (
        <div className="py-16 text-center text-sm text-red-500 bg-red-50 rounded-xl border border-red-100">
          {error}
        </div>
      ) : filteredMatieres.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-gray-100">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-3">
            <Library size={22} className="text-amber-500" />
          </div>
          <p className="text-sm text-gray-500 font-medium">Aucune matière trouvée</p>
          <p className="text-xs text-gray-400 mt-1 max-w-sm">
            {search ? "Aucun résultat ne correspond à votre recherche." : "Commencez par ajouter une matière au programme."}
          </p>
          {!search && (
            <button
              onClick={openCreate}
              className="text-sm font-medium text-amber-600 hover:text-amber-700 mt-3 cursor-pointer"
            >
              Ajouter une première matière
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-100 rounded-2xl bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/75 text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <th className="px-5 py-3.5">Illustration</th>
                <th className="px-5 py-3.5">Nom de la matière</th>
                <th className="px-5 py-3.5">Code</th>
                <th className="px-5 py-3.5">Description</th>
                <th className="px-5 py-3.5 text-center">Exercices liés</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMatieres.map((matiere) => {
                const imgUrl = resolveImageUrl(matiere.image_url || matiere.image);
                return (
                  <tr key={matiere.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={matiere.nom}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-amber-500 font-bold text-xs bg-amber-50">
                            {matiere.code?.slice(0, 3) || "MAT"}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-gray-900 flex items-center gap-2 pt-5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                      {matiere.nom}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-gray-100 text-gray-700 font-mono">
                        {matiere.code}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 max-w-md truncate">
                      {matiere.description || <span className="text-gray-300 italic">Aucune description</span>}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-600">
                        {matiere.exercices_count ?? 0}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEdit(matiere)}
                          title="Modifier"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(matiere)}
                          title="Supprimer"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
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

      {/* Modal Création / Édition */}
      <Modal open={modalOpen} onClose={closeModal}>
        <div className="mb-3">
          <h2 className="text-base font-bold text-gray-900">
            {editingMatiere ? `Modifier la matière "${editingMatiere.nom}"` : "Créer une nouvelle matière"}
          </h2>
        </div>
        <ResourceForm
          schema={matiereSchema}
          initialValues={initialValues}
          resourceId={editingMatiere?.id}
          onSuccess={handleFormSuccess}
          onCancel={closeModal}
        />
      </Modal>

      {/* Modal Confirmation Suppression */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Supprimer la matière"
        description={`Êtes-vous sûr de vouloir supprimer la matière "${deleteTarget?.nom}" ? Tous les cours et exercices associés peuvent être impactés.`}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

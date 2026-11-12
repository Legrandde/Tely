import { useEffect, useState, useMemo } from "react";
import { Plus, Pencil, Trash2, Tag, Search } from "lucide-react";
import ConfirmModal from "../components/ui/ConfirmModal";
import ResourceForm from "../components/form/ResourceForm";
import Modal from "../components/ui/Modal";
import { categorieSchema } from "../config/resourceSchemas";
import { deleteCategorie, listCategories } from "../services/resourceService";
import type { CategorieItem } from "../types/admin";
import { useToast } from "../context/ToastContext";

export default function GestionCategories() {
  const [categories, setCategories] = useState<CategorieItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategorie, setEditingCategorie] = useState<CategorieItem | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<CategorieItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  async function fetchCategories() {
    setLoading(true);
    setError(undefined);
    try {
      const data = await listCategories();
      setCategories(data);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Impossible de charger les catégories";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    listCategories()
      .then((data) => {
        if (!cancelled) {
          setCategories(data);
          setError(undefined);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const errorMsg =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            "Impossible de charger les catégories";
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

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    return categories.filter(
      (c) =>
        c.nom.toLowerCase().includes(q) ||
        (c.couleur && c.couleur.toLowerCase().includes(q)) ||
        (c.icone && c.icone.toLowerCase().includes(q))
    );
  }, [categories, search]);

  function openCreate() {
    setEditingCategorie(null);
    setModalOpen(true);
  }

  function openEdit(cat: CategorieItem) {
    setEditingCategorie(cat);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingCategorie(null);
  }

  function handleFormSuccess() {
    toast.success(editingCategorie ? "Catégorie mise à jour avec succès" : "Nouvelle catégorie créée avec succès");
    closeModal();
    fetchCategories();
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCategorie(deleteTarget.id);
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      toast.success(`La catégorie "${deleteTarget.nom}" a été supprimée.`);
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

  const initialValues = editingCategorie
    ? {
        nom: editingCategorie.nom,
        couleur: editingCategorie.couleur ?? "#f59e0b",
        icone: editingCategorie.icone ?? "tag",
      }
    : {
        couleur: "#f59e0b",
        icone: "book",
      };

  return (
    <div className="space-y-6">
      {/* Entête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Gestion des catégories</h1>
          <p className="text-sm text-gray-500">
            Organisez les contenus pédagogiques par chapitres, thèmes ou modules d'apprentissage
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 text-sm font-medium bg-amber-500 text-white rounded-xl px-4 py-2.5 hover:bg-amber-600 shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} />
          Ajouter une catégorie
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
            placeholder="Rechercher une catégorie..."
            className="bg-transparent text-sm text-gray-800 outline-none w-full placeholder-gray-400"
          />
        </div>
        <div className="text-xs text-gray-500 whitespace-nowrap self-end sm:self-auto">
          Total : <span className="font-semibold text-gray-800">{filteredCategories.length}</span> catégorie(s)
        </div>
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="py-20 text-center text-sm text-gray-400">
          Chargement des catégories...
        </div>
      ) : error ? (
        <div className="py-16 text-center text-sm text-red-500 bg-red-50 rounded-xl border border-red-100">
          {error}
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-gray-100">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-3">
            <Tag size={22} className="text-amber-500" />
          </div>
          <p className="text-sm text-gray-500 font-medium">Aucune catégorie trouvée</p>
          <p className="text-xs text-gray-400 mt-1 max-w-sm">
            {search ? "Aucun résultat ne correspond à votre recherche." : "Créez votre première catégorie pour organiser les exercices."}
          </p>
          {!search && (
            <button
              onClick={openCreate}
              className="text-sm font-medium text-amber-600 hover:text-amber-700 mt-3"
            >
              Ajouter une première catégorie
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-100 rounded-2xl bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/75 text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <th className="px-5 py-3.5">Nom de la catégorie</th>
                <th className="px-5 py-3.5">Couleur</th>
                <th className="px-5 py-3.5">Icône</th>
                <th className="px-5 py-3.5 text-center">Exercices liés</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCategories.map((cat) => (
                <tr key={cat.id} className="hover:bg-amber-50/30 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-900 flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10 shadow-xs"
                      style={{ backgroundColor: cat.couleur || "#f59e0b" }}
                    ></span>
                    {cat.nom}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs px-2.5 py-1 rounded bg-gray-100 text-gray-700">
                      {cat.couleur || "#f59e0b"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">
                    <span className="text-xs px-2.5 py-1 rounded-md bg-amber-50 text-amber-700">
                      {cat.icone || "default"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                      {cat.exercices_count ?? 0}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEdit(cat)}
                        title="Modifier"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(cat)}
                        title="Supprimer"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
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
          schema={categorieSchema}
          resourceId={editingCategorie?.id}
          initialValues={initialValues}
          onSuccess={handleFormSuccess}
          onCancel={closeModal}
        />
      </Modal>

      {/* Modal confirmation suppression */}
      <ConfirmModal
        open={!!deleteTarget}
        title={`Supprimer la catégorie "${deleteTarget?.nom}" ?`}
        description="Cette action est irréversible. Les exercices rattachés perdront leur catégorie."
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

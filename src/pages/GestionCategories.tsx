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
          <h1 className="tely-h1">Gestion des catégories</h1>
          <p className="text-sm text-gray-500">
            Organisez les contenus pédagogiques par chapitres, thèmes ou modules d'apprentissage
          </p>
        </div>

        <button
          onClick={openCreate}
          className="tely-btn self-start sm:self-auto"
        >
          <Plus size={16} />
          Ajouter une catégorie
        </button>
      </div>

      {/* Barre d'outils / Recherche */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 tely-card p-3">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-[10px] px-3 flex-1 w-full sm:max-w-md transition-all duration-200 focus-within:border-gray-900 focus-within:shadow-[0_0_0_3px_rgba(17,17,17,0.06)]">
          <Search size={16} className="text-gray-900 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une catégorie..."
            className="flex-1 w-full bg-transparent border-none outline-none text-sm text-gray-900 py-3.5 placeholder:text-gray-400"
          />
        </div>
        <div className="text-xs text-gray-500 whitespace-nowrap self-end sm:self-auto">
          Total : <span className="font-semibold text-gray-800">{filteredCategories.length}</span> catégorie(s)
        </div>
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="overflow-x-auto tely-card animate-pulse">
          <table className="w-full text-sm">
            <thead>
              <tr className="tely-overline text-left border-b border-gray-100">
                <th className="px-5 py-3.5">Nom de la catégorie</th>
                <th className="px-5 py-3.5">Couleur</th>
                <th className="px-5 py-3.5">Icône</th>
                <th className="px-5 py-3.5 text-center">Exercices liés</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3.5 h-3.5 rounded-full bg-gray-300 shrink-0" />
                      <div className="h-4 w-36 bg-gray-200 rounded" />
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="h-5 w-16 bg-gray-100 rounded" />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="h-5 w-16 bg-gray-100 rounded-md" />
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <div className="h-5 w-10 bg-gray-100 rounded-full mx-auto" />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
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
        <div className="py-16 text-center text-sm text-red-500 tely-card">
          {error}
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center tely-card">
          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
            <Tag size={22} className="text-gray-900" />
          </div>
          <p className="text-sm text-gray-500 font-medium">Aucune catégorie trouvée</p>
          <p className="text-xs text-gray-400 mt-1 max-w-sm">
            {search ? "Aucun résultat ne correspond à votre recherche." : "Créez votre première catégorie pour organiser les exercices."}
          </p>
          {!search && (
            <button
              onClick={openCreate}
              className="tely-link text-sm mt-3"
            >
              Ajouter une première catégorie
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto tely-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="tely-overline text-left border-b border-gray-100">
                <th className="px-5 py-3.5">Nom de la catégorie</th>
                <th className="px-5 py-3.5">Couleur</th>
                <th className="px-5 py-3.5">Icône</th>
                <th className="px-5 py-3.5 text-center">Exercices liés</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCategories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-900 flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10 shadow-xs"
                      style={{ backgroundColor: cat.couleur || "#f59e0b" }}
                    ></span>
                    {cat.nom}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs text-gray-700">
                      {cat.couleur || "#f59e0b"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">
                    <span className="text-xs font-medium text-gray-900">
                      {cat.icone || "default"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className="text-xs font-semibold text-gray-700">
                      {cat.exercices_count ?? 0}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEdit(cat)}
                        title="Modifier"
                        className="tely-icon-btn text-gray-900"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(cat)}
                        title="Supprimer"
                        className="tely-icon-btn text-gray-900 hover:text-red-500 hover:bg-red-50"
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

import { useEffect, useState, useMemo } from "react";
import { Plus, Pencil, Trash2, Layers, Search, Filter } from "lucide-react";
import ConfirmModal from "../components/ui/ConfirmModal";
import ResourceForm from "../components/form/ResourceForm";
import Modal from "../components/ui/Modal";
import { niveauSchema } from "../config/resourceSchemas";
import { deleteNiveau, listNiveaux } from "../services/resourceService";
import type { NiveauItem } from "../types/admin";
import { useToast } from "../context/ToastContext";

export default function GestionNiveaux() {
  const [niveaux, setNiveaux] = useState<NiveauItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [search, setSearch] = useState("");
  const [selectedCycle, setSelectedCycle] = useState<string>("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingNiveau, setEditingNiveau] = useState<NiveauItem | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<NiveauItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  async function fetchNiveaux() {
    setLoading(true);
    setError(undefined);
    try {
      const data = await listNiveaux();
      setNiveaux(data);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Impossible de charger les niveaux";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    listNiveaux()
      .then((data) => {
        if (!cancelled) {
          setNiveaux(data);
          setError(undefined);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const errorMsg =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            "Impossible de charger les niveaux";
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

  const cycles = useMemo(() => {
    const set = new Set<string>();
    niveaux.forEach((n) => {
      if (n.cycle) set.add(n.cycle);
    });
    return Array.from(set);
  }, [niveaux]);

  const filteredNiveaux = useMemo(() => {
    return niveaux.filter((n) => {
      const matchSearch =
        !search.trim() ||
        n.libelle.toLowerCase().includes(search.toLowerCase()) ||
        n.cycle.toLowerCase().includes(search.toLowerCase());
      const matchCycle = selectedCycle === "all" || n.cycle === selectedCycle;
      return matchSearch && matchCycle;
    });
  }, [niveaux, search, selectedCycle]);

  function openCreate() {
    setEditingNiveau(null);
    setModalOpen(true);
  }

  function openEdit(niveau: NiveauItem) {
    setEditingNiveau(niveau);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingNiveau(null);
  }

  function handleFormSuccess() {
    toast.success(editingNiveau ? "Niveau mis à jour avec succès" : "Nouveau niveau créé avec succès");
    closeModal();
    fetchNiveaux();
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteNiveau(deleteTarget.id);
      setNiveaux((prev) => prev.filter((n) => n.id !== deleteTarget.id));
      toast.success(`Le niveau "${deleteTarget.libelle}" a été supprimé.`);
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

  const initialValues = editingNiveau
    ? {
        libelle: editingNiveau.libelle,
        cycle: editingNiveau.cycle,
        ordre: editingNiveau.ordre,
      }
    : {
        cycle: "Lycée",
        ordre: (niveaux.length + 1) * 10,
      };

  return (
    <div className="space-y-6">
      {/* Entête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Gestion des niveaux</h1>
          <p className="text-sm text-gray-500">
            Configurez les cycles scolaires et niveaux d'études pour la classification des épreuves
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 text-sm font-medium bg-amber-500 text-white rounded-xl px-4 py-2.5 hover:bg-amber-600 shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} />
          Ajouter un niveau
        </button>
      </div>

      {/* Barre d'outils / Recherche & Filtre */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 flex-1 w-full sm:max-w-md">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par libellé..."
            className="bg-transparent text-sm text-gray-800 outline-none w-full placeholder-gray-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={15} className="text-gray-400" />
          <select
            value={selectedCycle}
            onChange={(e) => setSelectedCycle(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 text-gray-700 outline-none focus:ring-2 focus:ring-amber-200"
          >
            <option value="all">Tous les cycles</option>
            {cycles.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:ml-auto text-xs text-gray-500">
          Total : <span className="font-semibold text-gray-800">{filteredNiveaux.length}</span> niveau(x)
        </div>
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="overflow-x-auto border border-gray-100 rounded-2xl bg-white shadow-sm animate-pulse">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/75 text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <th className="px-5 py-3.5">Libellé</th>
                <th className="px-5 py-3.5">Cycle</th>
                <th className="px-5 py-3.5 text-center">Ordre</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-300" />
                      <div className="h-4 w-32 bg-gray-200 rounded" />
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="h-5 w-20 bg-purple-50 rounded-full" />
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <div className="h-5 w-10 bg-gray-100 rounded-md mx-auto" />
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
        <div className="py-16 text-center text-sm text-red-500 bg-red-50 rounded-xl border border-red-100">
          {error}
        </div>
      ) : filteredNiveaux.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-gray-100">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-3">
            <Layers size={22} className="text-amber-500" />
          </div>
          <p className="text-sm text-gray-500 font-medium">Aucun niveau trouvé</p>
          <p className="text-xs text-gray-400 mt-1 max-w-sm">
            {search || selectedCycle !== "all"
              ? "Aucun niveau ne correspond aux critères sélectionnés."
              : "Ajoutez des classes ou niveaux (ex: Seconde, Première, Terminale)."}
          </p>
          {!search && selectedCycle === "all" && (
            <button
              onClick={openCreate}
              className="text-sm font-medium text-amber-600 hover:text-amber-700 mt-3"
            >
              Ajouter un premier niveau
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-100 rounded-2xl bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/75 text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <th className="px-5 py-3.5">Libellé</th>
                <th className="px-5 py-3.5">Cycle</th>
                <th className="px-5 py-3.5 text-center">Ordre</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredNiveaux.map((niveau) => (
                <tr key={niveau.id} className="hover:bg-amber-50/30 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    {niveau.libelle}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        niveau.cycle === "Lycée"
                          ? "bg-purple-50 text-purple-700"
                          : niveau.cycle === "Collège"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {niveau.cycle}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className="px-2.5 py-0.5 text-xs font-mono font-semibold text-gray-600 bg-gray-100 rounded-md">
                      #{niveau.ordre}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEdit(niveau)}
                        title="Modifier"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(niveau)}
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
          schema={niveauSchema}
          resourceId={editingNiveau?.id}
          initialValues={initialValues}
          onSuccess={handleFormSuccess}
          onCancel={closeModal}
        />
      </Modal>

      {/* Modal confirmation suppression */}
      <ConfirmModal
        open={!!deleteTarget}
        title={`Supprimer le niveau "${deleteTarget?.libelle}" ?`}
        description="Cette action est irréversible. Les élèves, cours et exercices rattachés à ce niveau pourraient être impactés."
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

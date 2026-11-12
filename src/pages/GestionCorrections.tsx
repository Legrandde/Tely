import { useEffect, useState, useMemo } from "react";
import { Plus, Pencil, Trash2, CheckCircle2, Search, Eye } from "lucide-react";
import ConfirmModal from "../components/ui/ConfirmModal";
import ResourceForm from "../components/form/ResourceForm";
import Modal from "../components/ui/Modal";
import { correctionSchema } from "../config/resourceSchemas";
import { deleteCorrection, listCorrections } from "../services/resourceService";
import type { CorrectionItem } from "../types/admin";
import { useToast } from "../context/ToastContext";

export default function GestionCorrections() {
  const [corrections, setCorrections] = useState<CorrectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCorrection, setEditingCorrection] = useState<CorrectionItem | null>(null);

  const [previewTarget, setPreviewTarget] = useState<CorrectionItem | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<CorrectionItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  async function fetchCorrections() {
    setLoading(true);
    setError(undefined);
    try {
      const data = await listCorrections();
      setCorrections(data);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Impossible de charger les corrections";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    listCorrections()
      .then((data) => {
        if (!cancelled) {
          setCorrections(data);
          setError(undefined);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const errorMsg =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            "Impossible de charger les corrections";
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

  const filteredCorrections = useMemo(() => {
    if (!search.trim()) return corrections;
    const q = search.toLowerCase();
    return corrections.filter(
      (c) =>
        c.contenu.toLowerCase().includes(q) ||
        (c.explication && c.explication.toLowerCase().includes(q)) ||
        (c.exercice?.titre && c.exercice.titre.toLowerCase().includes(q))
    );
  }, [corrections, search]);

  function openCreate() {
    setEditingCorrection(null);
    setModalOpen(true);
  }

  function openEdit(corr: CorrectionItem) {
    setEditingCorrection(corr);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingCorrection(null);
  }

  function handleFormSuccess() {
    toast.success(editingCorrection ? "Correction mise à jour avec succès" : "Nouvelle correction enregistrée");
    closeModal();
    fetchCorrections();
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCorrection(deleteTarget.id);
      setCorrections((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      toast.success("Correction supprimée avec succès.");
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

  const initialValues = editingCorrection
    ? {
        exercice_id: editingCorrection.exercice?.id ?? editingCorrection.exercice_id,
        contenu: editingCorrection.contenu,
        explication: editingCorrection.explication ?? "",
      }
    : {};

  return (
    <div className="space-y-6">
      {/* Entête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Gestion des corrections</h1>
          <p className="text-sm text-gray-500">
            Fournissez les corrigés officiels et les explications pédagogiques pour chaque exercice
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 text-sm font-medium bg-amber-500 text-white rounded-xl px-4 py-2.5 hover:bg-amber-600 shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} />
          Ajouter une correction
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
            placeholder="Rechercher par exercice ou contenu de la solution..."
            className="bg-transparent text-sm text-gray-800 outline-none w-full placeholder-gray-400"
          />
        </div>
        <div className="text-xs text-gray-500 whitespace-nowrap self-end sm:self-auto">
          Total : <span className="font-semibold text-gray-800">{filteredCorrections.length}</span> correction(s)
        </div>
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="py-20 text-center text-sm text-gray-400">
          Chargement des corrections...
        </div>
      ) : error ? (
        <div className="py-16 text-center text-sm text-red-500 bg-red-50 rounded-xl border border-red-100">
          {error}
        </div>
      ) : filteredCorrections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-gray-100">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-3">
            <CheckCircle2 size={22} className="text-amber-500" />
          </div>
          <p className="text-sm text-gray-500 font-medium">Aucune correction trouvée</p>
          <p className="text-xs text-gray-400 mt-1 max-w-sm">
            {search ? "Aucun résultat ne correspond à votre recherche." : "Ajoutez un corrigé à un exercice existant."}
          </p>
          {!search && (
            <button
              onClick={openCreate}
              className="text-sm font-medium text-amber-600 hover:text-amber-700 mt-3"
            >
              Créer une première correction
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-100 rounded-2xl bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/75 text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <th className="px-5 py-3.5">Exercice</th>
                <th className="px-5 py-3.5">Solution</th>
                <th className="px-5 py-3.5">Explication pédagogique</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCorrections.map((corr) => (
                <tr key={corr.id} className="hover:bg-amber-50/30 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-900 max-w-xs">
                    <div className="truncate font-semibold">
                      {corr.exercice?.titre ?? `Exercice #${corr.exercice_id}`}
                    </div>
                    {corr.exercice?.matiere && (
                      <span className="text-xs text-gray-400">
                        {corr.exercice.matiere.nom} • {corr.exercice.niveau?.libelle}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 max-w-xs truncate">
                    {corr.contenu}
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 max-w-xs truncate">
                    {corr.explication || <span className="text-gray-300 italic">Aucune explication</span>}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setPreviewTarget(corr)}
                        title="Voir la correction"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => openEdit(corr)}
                        title="Modifier"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(corr)}
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
          schema={correctionSchema}
          resourceId={editingCorrection?.id}
          initialValues={initialValues}
          onSuccess={handleFormSuccess}
          onCancel={closeModal}
        />
      </Modal>

      {/* Modal Aperçu de la correction */}
      <Modal open={!!previewTarget} onClose={() => setPreviewTarget(null)}>
        {previewTarget && (
          <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
            <div className="border-b border-gray-100 pb-3">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                Corrigé officiel
              </span>
              <h2 className="text-lg font-bold text-gray-900 mt-2">
                {previewTarget.exercice?.titre ?? `Exercice #${previewTarget.exercice_id}`}
              </h2>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Solution détaillée
              </h3>
              <div className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
                {previewTarget.contenu}
              </div>
            </div>

            {previewTarget.explication && (
              <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100/60">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-700 mb-2">
                  Conseils méthodologiques
                </h3>
                <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                  {previewTarget.explication}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setPreviewTarget(null)}
                className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
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
        title="Supprimer cette correction ?"
        description="Cette action est irréversible. L'exercice associé n'aura plus de corrigé disponible."
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

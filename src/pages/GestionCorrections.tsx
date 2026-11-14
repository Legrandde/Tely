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
          <h1 className="tely-h1">Gestion des corrections</h1>
          <p className="tely-subtitle mt-1">
            Fournissez les corrigés officiels et les explications pédagogiques pour chaque exercice
          </p>
        </div>

        <button
          onClick={openCreate}
          className="tely-btn self-start sm:self-auto"
        >
          <Plus size={16} />
          Ajouter une correction
        </button>
      </div>

      {/* Barre d'outils / Recherche */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 tely-card p-3">
        <div className="relative flex-1 w-full sm:min-w-[260px] sm:max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-900 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par exercice ou contenu de la solution..."
            className="tely-input pl-10"
          />
        </div>
        <div className="tely-label whitespace-nowrap self-end sm:self-auto">
          Total : <span className="font-semibold text-gray-800">{filteredCorrections.length}</span> correction(s)
        </div>
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="overflow-x-auto tely-card animate-pulse">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left tely-overline border-b border-gray-100">
                <th className="px-5 py-3.5">Exercice</th>
                <th className="px-5 py-3.5">Solution</th>
                <th className="px-5 py-3.5">Explication pédagogique</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  <td className="px-5 py-3.5 max-w-xs space-y-1.5">
                    <div className="h-4 w-44 bg-gray-200 rounded" />
                    <div className="h-3 w-32 bg-gray-100 rounded" />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="h-3.5 w-52 bg-gray-100 rounded" />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="h-3.5 w-44 bg-gray-100 rounded" />
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
      ) : filteredCorrections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center tely-card">
          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
            <CheckCircle2 size={22} className="text-gray-900" />
          </div>
          <p className="text-sm text-gray-500 font-medium">Aucune correction trouvée</p>
          <p className="text-xs text-gray-400 mt-1 max-w-sm">
            {search ? "Aucun résultat ne correspond à votre recherche." : "Ajoutez un corrigé à un exercice existant."}
          </p>
          {!search && (
            <button
              onClick={openCreate}
              className="tely-link text-sm mt-3"
            >
              Créer une première correction
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto tely-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left tely-overline border-b border-gray-100">
                <th className="px-5 py-3.5">Exercice</th>
                <th className="px-5 py-3.5">Solution</th>
                <th className="px-5 py-3.5">Explication pédagogique</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCorrections.map((corr) => (
                <tr key={corr.id} className="hover:bg-gray-50 transition-colors">
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
                        className="tely-icon-btn text-gray-900"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => openEdit(corr)}
                        title="Modifier"
                        className="tely-icon-btn text-gray-900"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(corr)}
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
              <span className="tely-overline">
                Corrigé officiel
              </span>
              <h2 className="tely-title text-xl mt-1">
                {previewTarget.exercice?.titre ?? `Exercice #${previewTarget.exercice_id}`}
              </h2>
            </div>

            <div className="bg-gray-50 rounded-[10px] p-4">
              <h3 className="tely-overline mb-2">
                Solution détaillée
              </h3>
              <div className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
                {previewTarget.contenu}
              </div>
            </div>

            {previewTarget.explication && (
              <div className="rounded-[10px] p-4 border border-gray-200">
                <h3 className="tely-overline mb-2">
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
        title="Supprimer cette correction ?"
        description="Cette action est irréversible. L'exercice associé n'aura plus de corrigé disponible."
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

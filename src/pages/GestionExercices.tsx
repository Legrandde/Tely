import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, BookOpen } from "lucide-react";

import ConfirmModal from "../components/ui/ConfirmModal";
import ResourceForm from "../components/form/ResourceForm";
import { exerciceSchema } from "../config/resourceSchemas";

import type { Exercice } from "../types/exercice";
import { deleteExercice, listExercices } from "../services/resourceService";
import Modal from "../components/ui/Modal";

const DIFFICULTE_STYLES: Record<string, string> = {
  facile: "bg-emerald-50 text-emerald-600",
  moyen: "bg-amber-50 text-amber-600",
  difficile: "bg-red-50 text-red-600",
};

const TYPE_LABELS: Record<string, string> = {
  classique: "Classique",
  qcm: "QCM",
  probleme: "Problème",
  sujet_examen: "Sujet d'examen",
};

export default function GestionExercices() {
  const [exercices, setExercices] = useState<Exercice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingExercice, setEditingExercice] = useState<Exercice | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Exercice | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function fetchExercices() {
    setLoading(true);
    setError(undefined);
    try {
      const data = await listExercices();
      setExercices(data);
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Impossible de charger les exercices";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;
    listExercices()
      .then((data) => {
        if (isMounted) {
          setExercices(data);
          setError(undefined);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Impossible de charger les exercices";
          setError(errorMsg);
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  function openCreate() {
    setEditingExercice(null);
    setModalOpen(true);
  }

  function openEdit(exercice: Exercice) {
    setEditingExercice(exercice);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingExercice(null);
  }

  function handleFormSuccess() {
    closeModal();
    fetchExercices();
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteExercice(deleteTarget.id);
      setExercices((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Suppression impossible";
      alert(errorMsg);
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
        matiere_id: editingExercice.matiere?.id,
        niveau_id: editingExercice.niveau?.id,
        categorie_id: editingExercice.categorie?.id,
        professeur_id: editingExercice.professeur?.id,
        est_actif: editingExercice.est_actif,
      }
    : {};

  return (
    <div>
      {/* Entête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Gestion des exercices
          </h1>
          <p className="text-sm text-gray-400">
            Ajoutez, modifiez ou supprimez des exercices
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 text-sm font-medium bg-amber-500 text-white rounded-lg px-4 py-2 hover:bg-amber-600 transition-colors"
        >
          <Plus size={15} />
          Ajouter un exercice
        </button>
      </div>

      {/* Contenu */}
      {loading ? (
        <p className="text-sm text-gray-400 text-center py-16">
          Chargement des exercices...
        </p>
      ) : error ? (
        <p className="text-sm text-red-500 text-center py-16">{error}</p>
      ) : exercices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-3">
            <BookOpen size={20} className="text-amber-500" />
          </div>
          <p className="text-sm text-gray-400">Aucun exercice pour le moment.</p>
          <button
            onClick={openCreate}
            className="text-sm font-medium text-amber-600 hover:text-amber-700 mt-2"
          >
            Créer le premier exercice
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-100 rounded-lg bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                <th className="px-4 py-3">Titre</th>
                <th className="px-4 py-3">Matière</th>
                <th className="px-4 py-3">Niveau</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Difficulté</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {exercices.map((exercice) => (
                <tr
                  key={exercice.id}
                  className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">
                    {exercice.titre}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {exercice.matiere?.nom ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {exercice.niveau?.libelle ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {TYPE_LABELS[exercice.type] ?? exercice.type}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        DIFFICULTE_STYLES[exercice.difficulte] ?? "bg-gray-50 text-gray-600"
                      }`}
                    >
                      {exercice.difficulte}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        exercice.est_actif
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {exercice.est_actif ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(exercice)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(exercice)}
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
          schema={exerciceSchema}
          resourceId={editingExercice?.id}
          initialValues={initialValues}
          onSuccess={handleFormSuccess}
          onCancel={closeModal}
        />
      </Modal>

      {/* Modal confirmation suppression */}
      <ConfirmModal
        open={!!deleteTarget}
        title={`Supprimer "${deleteTarget?.titre}" ?`}
        description="Cette action est irréversible. L'exercice sera définitivement supprimé."
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
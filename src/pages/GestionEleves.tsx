import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Users } from "lucide-react";

import ConfirmModal from "../components/ui/ConfirmModal";
import ResourceForm from "../components/form/ResourceForm";
import Modal from "../components/ui/Modal";
import { eleveSchema } from "../config/resourceSchemas";
import { deleteEleve, listEleves } from "../services/resourceService";

interface Eleve {
  id: string;
  matricule: string;
  classe: string;
  niveau?: { id: string; libelle: string };
  user?: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    avatar?: string | null;
  };
}

export default function GestionEleves() {
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEleve, setEditingEleve] = useState<Eleve | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Eleve | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function fetchEleves() {
    setLoading(true);
    setError(undefined);
    try {
      const data = await listEleves();
      setEleves(data);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Impossible de charger la liste des élèves";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;
    listEleves()
      .then((data) => {
        if (isMounted) {
          setEleves(data);
          setError(undefined);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const errorMsg =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            "Impossible de charger la liste des élèves";
          setError(errorMsg);
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  function openCreate() {
    setEditingEleve(null);
    setModalOpen(true);
  }

  function openEdit(eleve: Eleve) {
    setEditingEleve(eleve);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingEleve(null);
  }

  function handleFormSuccess() {
    closeModal();
    fetchEleves();
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteEleve(deleteTarget.id);
      setEleves((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Suppression impossible";
      alert(errorMsg);
    } finally {
      setDeleting(false);
    }
  }

  const initialValues = editingEleve
    ? {
        matricule: editingEleve.matricule,
        classe: editingEleve.classe,
        niveau_id: editingEleve.niveau?.id,
      }
    : {};

  return (
    <div>
      {/* Entête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Gestion des élèves</h1>
          <p className="text-sm text-gray-400">
            Ajoutez, modifiez ou supprimez des profils élèves
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 text-sm font-medium bg-amber-500 text-white rounded-lg px-4 py-2 hover:bg-amber-600 transition-colors"
        >
          <Plus size={15} />
          Ajouter un élève
        </button>
      </div>

      {/* Contenu */}
      {loading ? (
        <p className="text-sm text-gray-400 text-center py-16">
          Chargement de la liste des élèves...
        </p>
      ) : error ? (
        <p className="text-sm text-red-500 text-center py-16">{error}</p>
      ) : eleves.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-3">
            <Users size={20} className="text-amber-500" />
          </div>
          <p className="text-sm text-gray-400">Aucun élève enregistré.</p>
          <button
            onClick={openCreate}
            className="text-sm font-medium text-amber-600 hover:text-amber-700 mt-2"
          >
            Créer le premier profil élève
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-100 rounded-lg bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                <th className="px-4 py-3">Matricule</th>
                <th className="px-4 py-3">Nom & Prénom</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Classe</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {eleves.map((eleve) => (
                <tr
                  key={eleve.id}
                  className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-700">
                    {eleve.matricule}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {eleve.user ? `${eleve.user.prenom} ${eleve.user.nom}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {eleve.user?.email ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{eleve.classe}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(eleve)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(eleve)}
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
          schema={eleveSchema}
          resourceId={editingEleve?.id}
          initialValues={initialValues}
          onSuccess={handleFormSuccess}
          onCancel={closeModal}
        />
      </Modal>

      {/* Modal confirmation suppression */}
      <ConfirmModal
        open={!!deleteTarget}
        title={`Supprimer l'élève "${deleteTarget?.user ? `${deleteTarget.user.prenom} ${deleteTarget.user.nom}` : deleteTarget?.matricule}" ?`}
        description="Cette action est irréversible."
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

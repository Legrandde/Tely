import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, GraduationCap } from "lucide-react";

import ConfirmModal from "../components/ui/ConfirmModal";
import ResourceForm from "../components/form/ResourceForm";
import Modal from "../components/ui/Modal";
import { professeurSchema } from "../config/resourceSchemas";
import { deleteProfesseur, listProfesseurs } from "../services/resourceService";

interface Professeur {
  id: string;
  specialite?: string;
  user: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    avatar?: string | null;
  };
}

export default function GestionProfesseurs() {
  const [professeurs, setProfesseurs] = useState<Professeur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProfesseur, setEditingProfesseur] = useState<Professeur | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Professeur | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function fetchProfesseurs() {
    setLoading(true);
    setError(undefined);
    try {
      const data = await listProfesseurs();
      setProfesseurs(data);
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Impossible de charger les professeurs";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;
    listProfesseurs()
      .then((data) => {
        if (isMounted) {
          setProfesseurs(data);
          setError(undefined);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Impossible de charger les professeurs";
          setError(errorMsg);
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  function openCreate() {
    setEditingProfesseur(null);
    setModalOpen(true);
  }

  function openEdit(professeur: Professeur) {
    setEditingProfesseur(professeur);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingProfesseur(null);
  }

  function handleFormSuccess() {
    closeModal();
    fetchProfesseurs();
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProfesseur(deleteTarget.id);
      setProfesseurs((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Suppression impossible";
      alert(errorMsg);
    } finally {
      setDeleting(false);
    }
  }

  // en édition, on ne modifie que la spécialité (pas de re-création de compte)
  const initialValues = editingProfesseur
    ? { specialite: editingProfesseur.specialite ?? "" }
    : {};

  return (
    <div>
      {/* Entête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Gestion des professeurs
          </h1>
          <p className="text-sm text-gray-400">
            Ajoutez, modifiez ou supprimez des professeurs
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 text-sm font-medium bg-amber-500 text-white rounded-lg px-4 py-2 hover:bg-amber-600 transition-colors"
        >
          <Plus size={15} />
          Ajouter un professeur
        </button>
      </div>

      {/* Contenu */}
      {loading ? (
        <p className="text-sm text-gray-400 text-center py-16">
          Chargement des professeurs...
        </p>
      ) : error ? (
        <p className="text-sm text-red-500 text-center py-16">{error}</p>
      ) : professeurs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-3">
            <GraduationCap size={20} className="text-amber-500" />
          </div>
          <p className="text-sm text-gray-400">Aucun professeur pour le moment.</p>
          <button
            onClick={openCreate}
            className="text-sm font-medium text-amber-600 hover:text-amber-700 mt-2"
          >
            Ajouter le premier professeur
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-100 rounded-lg bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Spécialité</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {professeurs.map((professeur) => (
                <tr
                  key={professeur.id}
                  className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 flex items-center gap-2">
                    {professeur.user?.avatar ? (
                      <img
                        src={professeur.user.avatar}
                        alt={professeur.user.nom}
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-semibold">
                        {professeur.user?.nom?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-medium text-gray-900">
                      {professeur.user?.prenom} {professeur.user?.nom}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {professeur.user?.email}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {professeur.specialite || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(professeur)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(professeur)}
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
          schema={
            editingProfesseur
              ? { ...professeurSchema, fields: professeurSchema.fields.filter((f) => f.name === "specialite") }
              : professeurSchema
          }
          resourceId={editingProfesseur?.id}
          initialValues={initialValues}
          onSuccess={handleFormSuccess}
          onCancel={closeModal}
        />
      </Modal>

      {/* Modal confirmation suppression */}
      <ConfirmModal
        open={!!deleteTarget}
        title={`Supprimer "${deleteTarget?.user?.prenom} ${deleteTarget?.user?.nom}" ?`}
        description="Cette action est irréversible. Le profil professeur sera définitivement supprimé."
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
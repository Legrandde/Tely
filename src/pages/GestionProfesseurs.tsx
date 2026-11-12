import { useEffect, useState, useMemo } from "react";
import { Plus, Pencil, Trash2, GraduationCap, Search, Eye, BookOpen } from "lucide-react";
import ConfirmModal from "../components/ui/ConfirmModal";
import ResourceForm from "../components/form/ResourceForm";
import Modal from "../components/ui/Modal";
import { professeurSchema } from "../config/resourceSchemas";
import { deleteProfesseur, listProfesseurs } from "../services/resourceService";
import { useToast } from "../context/ToastContext";

interface Professeur {
  id: string | number;
  specialite?: string;
  exercices_count?: number;
  user: {
    id: string | number;
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
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProfesseur, setEditingProfesseur] = useState<Professeur | null>(null);
  const [viewProfesseur, setViewProfesseur] = useState<Professeur | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Professeur | null>(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  async function fetchProfesseurs() {
    setLoading(true);
    setError(undefined);
    try {
      const data = await listProfesseurs();
      setProfesseurs(Array.isArray(data) ? data : data.data ?? []);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Impossible de charger les professeurs";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    listProfesseurs()
      .then((data) => {
        if (!cancelled) {
          setProfesseurs(Array.isArray(data) ? data : data.data ?? []);
          setError(undefined);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const errorMsg =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            "Impossible de charger les professeurs";
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

  const filteredProfesseurs = useMemo(() => {
    if (!search.trim()) return professeurs;
    const q = search.toLowerCase();
    return professeurs.filter((p) => {
      const nomComplet = `${p.user?.prenom ?? ""} ${p.user?.nom ?? ""}`.toLowerCase();
      return (
        nomComplet.includes(q) ||
        (p.user?.email && p.user.email.toLowerCase().includes(q)) ||
        (p.specialite && p.specialite.toLowerCase().includes(q))
      );
    });
  }, [professeurs, search]);

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
    toast.success(editingProfesseur ? "Professeur mis à jour avec succès" : "Nouveau professeur ajouté avec succès");
    closeModal();
    fetchProfesseurs();
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProfesseur(deleteTarget.id);
      setProfesseurs((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      toast.success("Profil professeur supprimé.");
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

  const initialValues = editingProfesseur
    ? { specialite: editingProfesseur.specialite ?? "" }
    : {};

  return (
    <div className="space-y-6">
      {/* Entête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Gestion des professeurs</h1>
          <p className="text-sm text-gray-500">
            Gérez le corps enseignant, leurs spécialités académiques et contenus rédigés
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 text-sm font-medium bg-amber-500 text-white rounded-xl px-4 py-2.5 hover:bg-amber-600 shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} />
          Ajouter un professeur
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
            placeholder="Rechercher par nom, email ou spécialité..."
            className="bg-transparent text-sm text-gray-800 outline-none w-full placeholder-gray-400"
          />
        </div>
        <div className="text-xs text-gray-500 whitespace-nowrap self-end sm:self-auto">
          Total : <span className="font-semibold text-gray-800">{filteredProfesseurs.length}</span> professeur(s)
        </div>
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="py-20 text-center text-sm text-gray-400">
          Chargement des professeurs...
        </div>
      ) : error ? (
        <div className="py-16 text-center text-sm text-red-500 bg-red-50 rounded-xl border border-red-100">
          {error}
        </div>
      ) : filteredProfesseurs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-gray-100">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-3">
            <GraduationCap size={22} className="text-amber-500" />
          </div>
          <p className="text-sm text-gray-500 font-medium">Aucun professeur trouvé</p>
          <p className="text-xs text-gray-400 mt-1 max-w-sm">
            {search
              ? "Aucun enseignant ne correspond à votre recherche."
              : "Ajoutez les membres de l'équipe pédagogique."}
          </p>
          {!search && (
            <button
              onClick={openCreate}
              className="text-sm font-medium text-amber-600 hover:text-amber-700 mt-3"
            >
              Ajouter le premier professeur
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-100 rounded-2xl bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/75 text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <th className="px-5 py-3.5">Professeur</th>
                <th className="px-5 py-3.5">Email professionnel</th>
                <th className="px-5 py-3.5">Spécialité</th>
                <th className="px-5 py-3.5 text-center">Exercices rédigés</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProfesseurs.map((professeur) => {
                const nomComplet = `${professeur.user?.prenom ?? ""} ${professeur.user?.nom ?? ""}`.trim();
                const initials = nomComplet
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();

                return (
                  <tr key={professeur.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0">
                          {professeur.user?.avatar ? (
                            <img
                              src={professeur.user.avatar}
                              alt={nomComplet}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            initials
                          )}
                        </div>
                        <span className="font-semibold text-gray-900">{nomComplet}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {professeur.user?.email ?? "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 font-medium">
                        {professeur.specialite || "Généraliste"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                        {professeur.exercices_count ?? 0}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewProfesseur(professeur)}
                          title="Voir le profil"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => openEdit(professeur)}
                          title="Modifier"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(professeur)}
                          title="Supprimer"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
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

      {/* Modal Ajout / Modification */}
      <Modal open={modalOpen} onClose={closeModal}>
        <ResourceForm
          schema={
            editingProfesseur
              ? {
                  ...professeurSchema,
                  fields: professeurSchema.fields.filter((f) => f.name === "specialite"),
                }
              : professeurSchema
          }
          resourceId={editingProfesseur?.id}
          initialValues={initialValues}
          onSuccess={handleFormSuccess}
          onCancel={closeModal}
        />
      </Modal>

      {/* Modal Visualisation Professeur */}
      <Modal open={!!viewProfesseur} onClose={() => setViewProfesseur(null)}>
        {viewProfesseur && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
              <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-800 font-bold text-lg flex items-center justify-center shrink-0">
                {viewProfesseur.user?.avatar ? (
                  <img
                    src={viewProfesseur.user.avatar}
                    alt="avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  `${viewProfesseur.user?.prenom?.[0] ?? ""}${viewProfesseur.user?.nom?.[0] ?? ""}`.toUpperCase()
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {viewProfesseur.user?.prenom} {viewProfesseur.user?.nom}
                </h2>
                <p className="text-xs text-gray-500">{viewProfesseur.user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-xs text-gray-400 block mb-0.5">Spécialité</span>
                <span className="font-semibold text-gray-800">
                  {viewProfesseur.specialite || "Généraliste"}
                </span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-xs text-gray-400 block mb-0.5">Exercices créés</span>
                <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                  <BookOpen size={14} className="text-amber-500" />
                  {viewProfesseur.exercices_count ?? 0} exercice(s)
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setViewProfesseur(null)}
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
        title={`Supprimer "${deleteTarget?.user?.prenom} ${deleteTarget?.user?.nom}" ?`}
        description="Cette action est irréversible. Le profil professeur sera définitivement supprimé."
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

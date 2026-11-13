import { useEffect, useState, useMemo } from "react";
import { Plus, Pencil, Trash2, Users, Search, Filter, Eye } from "lucide-react";
import ConfirmModal from "../components/ui/ConfirmModal";
import ResourceForm from "../components/form/ResourceForm";
import Modal from "../components/ui/Modal";
import { eleveSchema } from "../config/resourceSchemas";
import { deleteEleve, listEleves, listNiveaux } from "../services/resourceService";
import { useToast } from "../context/ToastContext";

interface Eleve {
  id: string | number;
  matricule: string;
  classe: string;
  niveau?: { id: string | number; libelle: string; cycle?: string };
  user?: {
    id: string | number;
    nom: string;
    prenom: string;
    email: string;
    avatar?: string | null;
  };
}

export default function GestionEleves() {
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [niveaux, setNiveaux] = useState<Array<{ id: string | number; libelle: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const [search, setSearch] = useState("");
  const [filterNiveau, setFilterNiveau] = useState<string>("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEleve, setEditingEleve] = useState<Eleve | null>(null);
  const [viewEleve, setViewEleve] = useState<Eleve | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Eleve | null>(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  async function fetchEleves() {
    setLoading(true);
    setError(undefined);
    try {
      const [data, nivData] = await Promise.all([listEleves(), listNiveaux()]);
      setEleves(Array.isArray(data) ? data : data.data ?? []);
      setNiveaux(nivData);
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
    let cancelled = false;

    Promise.all([listEleves(), listNiveaux()])
      .then(([data, nivData]) => {
        if (!cancelled) {
          setEleves(Array.isArray(data) ? data : data.data ?? []);
          setNiveaux(nivData);
          setError(undefined);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const errorMsg =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            "Impossible de charger la liste des élèves";
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

  const filteredEleves = useMemo(() => {
    return eleves.filter((e) => {
      const nomComplet = `${e.user?.prenom ?? ""} ${e.user?.nom ?? ""}`.toLowerCase();
      const q = search.toLowerCase();
      const matchSearch =
        !search.trim() ||
        nomComplet.includes(q) ||
        (e.matricule && e.matricule.toLowerCase().includes(q)) ||
        (e.classe && e.classe.toLowerCase().includes(q)) ||
        (e.user?.email && e.user.email.toLowerCase().includes(q));

      const matchNiveau =
        filterNiveau === "all" || String(e.niveau?.id) === String(filterNiveau);

      return matchSearch && matchNiveau;
    });
  }, [eleves, search, filterNiveau]);

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
    toast.success(editingEleve ? "Élève mis à jour avec succès" : "Nouvel élève inscrit avec succès");
    closeModal();
    fetchEleves();
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteEleve(deleteTarget.id);
      setEleves((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      toast.success("Profil élève supprimé.");
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

  const initialValues = editingEleve
    ? {
        matricule: editingEleve.matricule,
        classe: editingEleve.classe,
        niveau_id: editingEleve.niveau?.id,
      }
    : {};

  return (
    <div className="space-y-6">
      {/* Entête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Gestion des élèves</h1>
          <p className="text-sm text-gray-500">
            Administrez les inscriptions des apprenants, leurs classes et leurs niveaux
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 text-sm font-medium bg-amber-500 text-white rounded-xl px-4 py-2.5 hover:bg-amber-600 shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} />
          Inscrire un élève
        </button>
      </div>

      {/* Barre d'outils / Recherche & Filtres */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 flex-1 w-full sm:max-w-md">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, matricule ou classe..."
            className="bg-transparent text-sm text-gray-800 outline-none w-full placeholder-gray-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={14} className="text-gray-400" />
          <select
            value={filterNiveau}
            onChange={(e) => setFilterNiveau(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-700 outline-none focus:ring-2 focus:ring-amber-200"
          >
            <option value="all">Tous les niveaux</option>
            {niveaux.map((n) => (
              <option key={n.id} value={String(n.id)}>
                {n.libelle}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:ml-auto text-xs text-gray-500">
          Total : <span className="font-semibold text-gray-800">{filteredEleves.length}</span> élève(s)
        </div>
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="overflow-x-auto border border-gray-100 rounded-2xl bg-white shadow-sm animate-pulse">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/75 text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <th className="px-5 py-3.5">Élève</th>
                <th className="px-5 py-3.5">Matricule</th>
                <th className="px-5 py-3.5">Email</th>
                <th className="px-5 py-3.5">Niveau</th>
                <th className="px-5 py-3.5">Classe</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <tr key={i}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-amber-100 shrink-0" />
                      <div className="h-4 w-36 bg-gray-200 rounded" />
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="h-5 w-20 bg-gray-100 rounded-md" />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="h-3.5 w-44 bg-gray-100 rounded" />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="h-3.5 w-24 bg-gray-200 rounded" />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="h-5 w-16 bg-blue-50 rounded-full" />
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
        <div className="py-16 text-center text-sm text-red-500 bg-red-50 rounded-xl border border-red-100">
          {error}
        </div>
      ) : filteredEleves.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-gray-100">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-3">
            <Users size={22} className="text-amber-500" />
          </div>
          <p className="text-sm text-gray-500 font-medium">Aucun élève trouvé</p>
          <p className="text-xs text-gray-400 mt-1 max-w-sm">
            {search || filterNiveau !== "all"
              ? "Aucun résultat ne correspond aux filtres."
              : "Créez le premier profil élève sur la plateforme."}
          </p>
          {!search && filterNiveau === "all" && (
            <button
              onClick={openCreate}
              className="text-sm font-medium text-amber-600 hover:text-amber-700 mt-3"
            >
              Inscrire un premier élève
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-100 rounded-2xl bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/75 text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <th className="px-5 py-3.5">Élève</th>
                <th className="px-5 py-3.5">Matricule</th>
                <th className="px-5 py-3.5">Email</th>
                <th className="px-5 py-3.5">Niveau</th>
                <th className="px-5 py-3.5">Classe</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEleves.map((eleve) => {
                const nomComplet = eleve.user
                  ? `${eleve.user.prenom} ${eleve.user.nom}`.trim()
                  : "Sans nom";
                const initials = nomComplet
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();

                return (
                  <tr key={eleve.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0">
                          {eleve.user?.avatar ? (
                            <img
                              src={eleve.user.avatar}
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
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs px-2.5 py-1 rounded bg-gray-100 text-gray-700 font-semibold">
                        {eleve.matricule}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {eleve.user?.email ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 text-gray-700">
                      {eleve.niveau?.libelle ?? "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        {eleve.classe}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewEleve(eleve)}
                          title="Voir le profil"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => openEdit(eleve)}
                          title="Modifier"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(eleve)}
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
          schema={eleveSchema}
          resourceId={editingEleve?.id}
          initialValues={initialValues}
          onSuccess={handleFormSuccess}
          onCancel={closeModal}
        />
      </Modal>

      {/* Modal Visualisation Élève */}
      <Modal open={!!viewEleve} onClose={() => setViewEleve(null)}>
        {viewEleve && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
              <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-800 font-bold text-lg flex items-center justify-center shrink-0">
                {viewEleve.user?.avatar ? (
                  <img
                    src={viewEleve.user.avatar}
                    alt="avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  `${viewEleve.user?.prenom?.[0] ?? ""}${viewEleve.user?.nom?.[0] ?? ""}`.toUpperCase()
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {viewEleve.user?.prenom} {viewEleve.user?.nom}
                </h2>
                <p className="text-xs text-gray-500">{viewEleve.user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-xs text-gray-400 block mb-0.5">Matricule</span>
                <span className="font-mono font-bold text-gray-800">{viewEleve.matricule}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-xs text-gray-400 block mb-0.5">Classe</span>
                <span className="font-semibold text-gray-800">{viewEleve.classe}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 col-span-2">
                <span className="text-xs text-gray-400 block mb-0.5">Niveau scolaire</span>
                <span className="font-semibold text-gray-800">
                  {viewEleve.niveau?.libelle ?? "Non défini"}{" "}
                  {viewEleve.niveau?.cycle ? `(${viewEleve.niveau.cycle})` : ""}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setViewEleve(null)}
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
        title={`Supprimer l'élève "${deleteTarget?.user ? `${deleteTarget.user.prenom} ${deleteTarget.user.nom}` : deleteTarget?.matricule}" ?`}
        description="Cette action est irréversible. Le profil de l'élève et son historique seront supprimés."
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

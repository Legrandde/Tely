import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Pencil, Trash2, ClipboardList, Search, Eye, Filter, Calendar } from "lucide-react";
import ConfirmModal from "../components/ui/ConfirmModal";
import ResourceForm from "../components/form/ResourceForm";
import Modal from "../components/ui/Modal";
import { sujetSchema } from "../config/resourceSchemas";
import { deleteSujet, listSujets, getSujetById } from "../services/resourceService";
import type { SujetItem } from "../types/admin";
import { useToast } from "../context/ToastContext";

const TYPE_BADGES: Record<string, { label: string; class: string }> = {
  bac: { label: "Baccalauréat", class: "bg-purple-50 text-purple-700 border-purple-200" },
  brevet: { label: "BFEM / Brevet", class: "bg-blue-50 text-blue-700 border-blue-200" },
  composition: { label: "Composition", class: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  autre: { label: "Autre", class: "bg-gray-100 text-gray-700 border-gray-200" },
};

const SESSION_LABELS: Record<string, string> = {
  juin: "Session Juin",
  septembre: "Session Septembre",
  janvier: "Session Janvier",
};

export default function GestionSujets() {
  const [sujets, setSujets] = useState<SujetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSession, setFilterSession] = useState<string>("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSujet, setEditingSujet] = useState<SujetItem | null>(null);

  const [viewSujet, setViewSujet] = useState<SujetItem | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<SujetItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  async function fetchSujets() {
    setLoading(true);
    setError(undefined);
    try {
      const data = await listSujets();
      setSujets(data);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Impossible de charger les sujets d'examen";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    listSujets()
      .then((data) => {
        if (!cancelled) {
          setSujets(data);
          setError(undefined);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const errorMsg =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            "Impossible de charger les sujets d'examen";
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

  const filteredSujets = useMemo(() => {
    return sujets.filter((s) => {
      const matchSearch =
        !search.trim() ||
        s.titre.toLowerCase().includes(search.toLowerCase()) ||
        (s.matiere?.nom && s.matiere.nom.toLowerCase().includes(search.toLowerCase())) ||
        (s.niveau?.libelle && s.niveau.libelle.toLowerCase().includes(search.toLowerCase())) ||
        ((s.ennonce || s.enonce) && (s.ennonce || s.enonce || "").toLowerCase().includes(search.toLowerCase()));

      const matchType = filterType === "all" || s.type === filterType;
      const matchSession = filterSession === "all" || s.session === filterSession;

      return matchSearch && matchType && matchSession;
    });
  }, [sujets, search, filterType, filterSession]);

  const navigate = useNavigate();
  const location = useLocation();
  const isProfesseur = location.pathname.toLowerCase().includes("professeur");
  const baseRoute = isProfesseur ? "/Dashboard-professeur/sujets" : "/Dashbord-admin/sujets";

  function openCreate() {
    navigate(`${baseRoute}/nouveau`);
  }

  function openEdit(sujet: SujetItem) {
    navigate(`${baseRoute}/${sujet.id}/modifier`);
  }

  async function openView(sujet: SujetItem) {
    setViewSujet(sujet);
    setLoadingDetail(true);
    try {
      const full = await getSujetById(sujet.id);
      setViewSujet(full);
    } catch {
      // Keep basic info
    } finally {
      setLoadingDetail(false);
    }
  }

  function closeModal() {
    setModalOpen(false);
    setEditingSujet(null);
  }

  function handleFormSuccess() {
    toast.success(editingSujet ? "Sujet d'examen mis à jour avec succès" : "Nouveau sujet d'examen créé avec succès");
    closeModal();
    fetchSujets();
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteSujet(deleteTarget.id);
      setSujets((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      toast.success(`Le sujet "${deleteTarget.titre}" a été supprimé.`);
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

  const initialValues = editingSujet
    ? {
        titre: editingSujet.titre,
        annee: editingSujet.annee,
        session: editingSujet.session,
        type: editingSujet.type,
        matiere_id: editingSujet.matiere?.id ?? editingSujet.matiere_id,
        niveau_id: editingSujet.niveau?.id ?? editingSujet.niveau_id,
        ennonce: editingSujet.ennonce,
      }
    : {
        annee: new Date().getFullYear(),
        session: "juin",
        type: "bac",
      };

  return (
    <div className="space-y-6">
      {/* Entête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Gestion des sujets d'examen</h1>
          <p className="text-sm text-gray-500">
            Publiez et organisez les épreuves de concours et examens officiels par session et discipline
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 text-sm font-medium bg-amber-500 text-white rounded-xl px-4 py-2.5 hover:bg-amber-600 shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} />
          Ajouter un sujet
        </button>
      </div>

      {/* Barre d'outils / Recherche & Filtres */}
      <div className="flex flex-col lg:flex-row items-center gap-3 bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm">
        {/* Recherche */}
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 flex-1 w-full lg:max-w-md">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par titre, matière, niveau..."
            className="bg-transparent text-sm text-gray-800 outline-none w-full placeholder-gray-400"
          />
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Filter size={14} /> Type :
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2.5 py-2 bg-gray-50 text-gray-700 outline-none focus:ring-2 focus:ring-amber-200"
          >
            <option value="all">Tous les types</option>
            <option value="bac">Baccalauréat</option>
            <option value="brevet">BFEM / Brevet</option>
            <option value="composition">Composition</option>
            <option value="autre">Autre</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs text-gray-500 ml-2">
            Session :
          </div>
          <select
            value={filterSession}
            onChange={(e) => setFilterSession(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2.5 py-2 bg-gray-50 text-gray-700 outline-none focus:ring-2 focus:ring-amber-200"
          >
            <option value="all">Toutes sessions</option>
            <option value="juin">Juin</option>
            <option value="septembre">Septembre</option>
            <option value="janvier">Janvier</option>
          </select>
        </div>

        <div className="lg:ml-auto text-xs text-gray-500 whitespace-nowrap">
          Total : <span className="font-semibold text-gray-800">{filteredSujets.length}</span> sujet(s)
        </div>
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="py-20 text-center text-sm text-gray-400">
          Chargement des sujets d'examen...
        </div>
      ) : error ? (
        <div className="py-16 text-center text-sm text-red-500 bg-red-50 rounded-xl border border-red-100">
          {error}
        </div>
      ) : filteredSujets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-gray-100">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-3">
            <ClipboardList size={22} className="text-amber-500" />
          </div>
          <p className="text-sm text-gray-500 font-medium">Aucun sujet d'examen trouvé</p>
          <p className="text-xs text-gray-400 mt-1 max-w-sm">
            {search || filterType !== "all" || filterSession !== "all"
              ? "Aucun résultat ne correspond à vos filtres de recherche."
              : "Créez votre première épreuve officielle pour vos élèves."}
          </p>
          {!search && filterType === "all" && filterSession === "all" && (
            <button
              onClick={openCreate}
              className="text-sm font-medium text-amber-600 hover:text-amber-700 mt-3"
            >
              Créer un premier sujet
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-100 rounded-2xl bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/75 text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <th className="px-5 py-3.5">Titre du sujet</th>
                <th className="px-5 py-3.5">Matière</th>
                <th className="px-5 py-3.5">Niveau</th>
                <th className="px-5 py-3.5">Type & Session</th>
                <th className="px-5 py-3.5 text-center">Année</th>
                <th className="px-5 py-3.5 text-center">Exercices</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSujets.map((sujet) => {
                const badgeInfo = TYPE_BADGES[sujet.type] ?? TYPE_BADGES.autre;
                return (
                  <tr key={sujet.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-900 max-w-xs">
                      <div className="truncate font-semibold">{sujet.titre}</div>
                      <div className="text-xs text-gray-400 truncate max-w-sm font-normal">
                        {sujet.ennonce}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-700">
                      {sujet.matiere?.nom ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 text-gray-700">
                      {sujet.niveau?.libelle ?? "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badgeInfo.class}`}
                        >
                          {badgeInfo.label}
                        </span>
                        <span className="text-[11px] text-gray-500">
                          {SESSION_LABELS[sujet.session] ?? sujet.session}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-mono font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md">
                        <Calendar size={12} className="text-gray-400" />
                        {sujet.annee}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-700">
                        {sujet.exercices_count ?? sujet.exercices?.length ?? 0}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openView(sujet)}
                          title="Consulter l'épreuve"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => openEdit(sujet)}
                          title="Modifier"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(sujet)}
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
          schema={sujetSchema}
          resourceId={editingSujet?.id}
          initialValues={initialValues}
          onSuccess={handleFormSuccess}
          onCancel={closeModal}
        />
      </Modal>

      {/* Modal de visualisation détaillée du sujet */}
      <Modal open={!!viewSujet} onClose={() => setViewSujet(null)}>
        {viewSujet && (
          <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
            <div className="border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700">
                  {TYPE_BADGES[viewSujet.type]?.label ?? viewSujet.type}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-600 font-medium font-mono">
                  Année {viewSujet.annee} — {SESSION_LABELS[viewSujet.session] ?? viewSujet.session}
                </span>
              </div>
              <h2 className="text-lg font-bold text-gray-900">{viewSujet.titre}</h2>
              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                <span>Matière : <strong className="text-gray-800">{viewSujet.matiere?.nom ?? "Non définie"}</strong></span>
                <span>Niveau : <strong className="text-gray-800">{viewSujet.niveau?.libelle ?? "Non défini"}</strong></span>
              </div>
            </div>

            {loadingDetail ? (
              <div className="py-8 text-center text-xs text-gray-400">Chargement des détails...</div>
            ) : (
              <>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                    Énoncé / Instructions
                  </h3>
                  <div className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
                    {viewSujet.ennonce}
                  </div>
                </div>

                {viewSujet.exercices && viewSujet.exercices.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2.5">
                      Exercices attachés ({viewSujet.exercices.length})
                    </h3>
                    <div className="space-y-2">
                      {viewSujet.exercices.map((ex, idx) => (
                        <div
                          key={ex.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-white hover:bg-gray-50 text-sm"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center">
                              {ex.pivot?.ordre ?? idx + 1}
                            </span>
                            <span className="font-medium text-gray-800">{ex.titre ?? `Exercice #${ex.id}`}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setViewSujet(null)}
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
        title={`Supprimer le sujet "${deleteTarget?.titre}" ?`}
        description="Cette action est irréversible. L'épreuve sera définitivement supprimée ainsi que les liaisons avec les exercices."
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

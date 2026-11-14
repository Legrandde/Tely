import { useEffect, useState, useMemo } from "react";
import {
  GraduationCap,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  Copy,
  Trash2,
  ExternalLink,
  Clock,
} from "lucide-react";
import {
  listCandidatures,
  approuverCandidature,
  rejeterCandidature,
  deleteCandidature,
  ouvrirCvCandidature,
  type CandidatureItem,
  type CandidatureCounts,
} from "../../services/candidatureService";
import { useToast } from "../../context/ToastContext";
import Modal from "../../components/ui/Modal";
import ConfirmModal from "../../components/ui/ConfirmModal";

export default function GestionCandidatures() {
  const { addToast } = useToast();
  const [candidatures, setCandidatures] = useState<CandidatureItem[]>([]);
  const [counts, setCounts] = useState<CandidatureCounts>({
    total: 0,
    en_attente: 0,
    approuve: 0,
    rejete: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"toutes" | "en_attente" | "approuve" | "rejete">("en_attente");

  // Modals state
  const [detailItem, setDetailItem] = useState<CandidatureItem | null>(null);
  const [approveTarget, setApproveTarget] = useState<CandidatureItem | null>(null);
  const [customPassword, setCustomPassword] = useState("");
  const [approving, setApproving] = useState(false);

  // Rejection modal
  const [rejectTarget, setRejectTarget] = useState<CandidatureItem | null>(null);
  const [motifRejet, setMotifRejet] = useState("");
  const [rejecting, setRejecting] = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<CandidatureItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Success credentials modal
  const [credentialsModal, setCredentialsModal] = useState<{
    open: boolean;
    email: string;
    password: string;
    nom: string;
  } | null>(null);

  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await listCandidatures();
      setCandidatures(res.candidatures.data || []);
      setCounts(res.counts);
    } catch {
      addToast("error", "Impossible de charger les candidatures.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    listCandidatures()
      .then((res) => {
        if (!cancelled) {
          setCandidatures(res.candidatures.data || []);
          setCounts(res.counts);
        }
      })
      .catch(() => {
        if (!cancelled) {
          addToast("error", "Impossible de charger les candidatures.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [addToast]);

  const filteredCandidatures = useMemo(() => {
    return candidatures.filter((c) => {
      const matchTab = activeTab === "toutes" || c.statut === activeTab;
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        c.nom.toLowerCase().includes(q) ||
        c.prenom.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.specialite.toLowerCase().includes(q) ||
        (c.etablissement && c.etablissement.toLowerCase().includes(q));

      return matchTab && matchSearch;
    });
  }, [candidatures, activeTab, search]);

  const handleOpenCv = async (id: number) => {
    try {
      await ouvrirCvCandidature(id);
    } catch {
      addToast("error", "Impossible d'ouvrir le CV de ce candidat.");
    }
  };

  const handleApprove = async () => {
    if (!approveTarget) return;
    setApproving(true);
    try {
      const res = await approuverCandidature(approveTarget.id, customPassword || undefined);

      if (res.generated_password) {
        addToast("success", `Le compte enseignant pour ${approveTarget.nom_complet} a été créé !`);
        setCredentialsModal({
          open: true,
          email: approveTarget.email,
          password: res.generated_password,
          nom: approveTarget.nom_complet,
        });
      } else {
        // Compte déjà existant : promu enseignant, mot de passe inchangé (aucun identifiant à transmettre)
        addToast("success", res.message);
      }

      setApproveTarget(null);
      setCustomPassword("");
      fetchList();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Erreur lors de l'approbation.";
      addToast("error", errorMsg);
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    setRejecting(true);
    try {
      await rejeterCandidature(rejectTarget.id, motifRejet || undefined);
      addToast("info", `La candidature de ${rejectTarget.nom_complet} a été rejetée.`);
      setRejectTarget(null);
      setMotifRejet("");
      fetchList();
    } catch {
      addToast("error", "Erreur lors du rejet de la candidature.");
    } finally {
      setRejecting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCandidature(deleteTarget.id);
      addToast("success", "Candidature supprimée définitivement.");
      setDeleteTarget(null);
      fetchList();
    } catch {
      addToast("error", "Erreur lors de la suppression.");
    } finally {
      setDeleting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast("success", "Identifiants copiés dans le presse-papier !");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* ── En-tête de la page ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 tely-card p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-gray-50 text-gray-900 flex items-center justify-center font-bold">
            <GraduationCap size={22} />
          </div>
          <div>
            <h1 className="tely-h1">Candidatures Enseignants</h1>
            <p className="tely-subtitle mt-1">
              Validez les professeurs postulants et générez leurs accès de connexion au tableau de bord.
            </p>
          </div>
        </div>

        {counts.en_attente > 0 && (
          <div className="tely-chip text-amber-700 px-3 py-1.5 text-xs self-start sm:self-auto">
            <Clock size={15} className="text-gray-900 animate-pulse" />
            {counts.en_attente} candidature(s) en attente d'approbation
          </div>
        )}
      </div>

      {/* ── Barre de filtre d'onglets & Recherche ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 tely-card p-3">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
          {(
            [
              { key: "en_attente", label: "En attente", count: counts.en_attente, color: "bg-gray-100 text-gray-600" },
              { key: "toutes", label: "Toutes", count: counts.total, color: "bg-gray-100 text-gray-600" },
              { key: "approuve", label: "Approuvées", count: counts.approuve, color: "bg-gray-100 text-gray-600" },
              { key: "rejete", label: "Rejetées", count: counts.rejete, color: "bg-gray-100 text-gray-600" },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={`px-3.5 py-2 rounded-[10px] font-semibold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                activeTab === t.key
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <span>{t.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === t.key ? "bg-white/15 text-white" : t.color}`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Recherche */}
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-[10px] px-3 sm:w-72 transition-all duration-200 focus-within:border-gray-900 focus-within:shadow-[0_0_0_3px_rgba(17,17,17,0.06)]">
          <Search size={15} className="text-gray-900 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email, matière..."
            className="flex-1 w-full bg-transparent border-none outline-none text-sm text-gray-900 py-3.5 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* ── Table des Candidatures ── */}
      {loading ? (
        <div className="overflow-x-auto tely-card animate-pulse">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="tely-overline border-b border-gray-100">
                <th className="py-3.5 pl-4">Candidat</th>
                <th className="py-3.5">Discipline</th>
                <th className="py-3.5">Établissement & Diplôme</th>
                <th className="py-3.5">Expérience</th>
                <th className="py-3.5">CV</th>
                <th className="py-3.5">Statut</th>
                <th className="py-3.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  <td className="py-3.5 pl-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gray-100 shrink-0" />
                      <div className="space-y-1.5">
                        <div className="h-3.5 w-32 bg-gray-200 rounded" />
                        <div className="h-2.5 w-40 bg-gray-100 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <div className="h-5 w-28 bg-gray-100 rounded-md" />
                  </td>
                  <td className="py-3.5 space-y-1.5">
                    <div className="h-3.5 w-32 bg-gray-200 rounded" />
                    <div className="h-2.5 w-24 bg-gray-100 rounded" />
                  </td>
                  <td className="py-3.5">
                    <div className="h-3.5 w-14 bg-gray-200 rounded" />
                  </td>
                  <td className="py-3.5">
                    <div className="h-6 w-20 bg-gray-100 rounded-lg" />
                  </td>
                  <td className="py-3.5">
                    <div className="h-5 w-24 bg-gray-100 rounded-full" />
                  </td>
                  <td className="py-3.5 pr-4 text-right">
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
      ) : filteredCandidatures.length === 0 ? (
        <div className="py-16 text-center tely-card space-y-2">
          <div className="w-12 h-12 rounded-full bg-gray-50 text-gray-900 flex items-center justify-center mx-auto">
            <GraduationCap size={24} />
          </div>
          <p className="text-sm font-semibold text-gray-800">Aucune candidature trouvée</p>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            {search ? "Aucune demande ne correspond à votre filtre de recherche." : "Les nouvelles demandes d'enseignants apparaîtront ici dès leur soumission."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto tely-card">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="tely-overline border-b border-gray-100">
                <th className="py-3.5 pl-4">Candidat</th>
                <th className="py-3.5">Discipline</th>
                <th className="py-3.5">Établissement & Diplôme</th>
                <th className="py-3.5">Expérience</th>
                <th className="py-3.5">CV</th>
                <th className="py-3.5">Statut</th>
                <th className="py-3.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCandidatures.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  {/* Candidat */}
                  <td className="py-3.5 pl-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {c.prenom.charAt(0)}{c.nom.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{c.prenom} {c.nom}</div>
                        <div className="text-[11px] text-gray-400">{c.email}</div>
                        {c.telephone && <div className="text-[10px] text-gray-400">{c.telephone}</div>}
                      </div>
                    </div>
                  </td>

                  {/* Discipline */}
                  <td className="py-3.5">
                    <span className="tely-chip">
                      {c.specialite}
                    </span>
                  </td>

                  {/* Établissement & Diplôme */}
                  <td className="py-3.5">
                    <div className="text-gray-800 font-medium">{c.etablissement || "—"}</div>
                    <div className="text-[11px] text-gray-400">{c.diplome || "Non précisé"}</div>
                  </td>

                  {/* Expérience */}
                  <td className="py-3.5 font-medium text-gray-700">
                    {c.experience_annees} an(s)
                  </td>

                  {/* CV */}
                  <td className="py-3.5">
                    {c.cv_path ? (
                      <button
                        type="button"
                        onClick={() => handleOpenCv(c.id)}
                        className="inline-flex items-center gap-1 text-[11px] tely-link"
                      >
                        <FileText size={13} /> Voir CV <ExternalLink size={10} />
                      </button>
                    ) : (
                      <span className="text-[11px] text-gray-400 italic">Aucun</span>
                    )}
                  </td>

                  {/* Statut */}
                  <td className="py-3.5">
                    {c.statut === "en_attente" && (
                      <span className="tely-chip text-amber-700">
                        <Clock size={12} className="text-gray-900" /> En attente
                      </span>
                    )}
                    {c.statut === "approuve" && (
                      <span className="tely-chip text-emerald-700">
                        <CheckCircle size={12} className="text-gray-900" /> Approuvée
                      </span>
                    )}
                    {c.statut === "rejete" && (
                      <span className="tely-chip text-red-600">
                        <XCircle size={12} className="text-gray-900" /> Rejetée
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 pr-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Voir détails */}
                      <button
                        type="button"
                        onClick={() => setDetailItem(c)}
                        title="Consulter le dossier"
                        className="tely-icon-btn text-gray-900"
                      >
                        <Eye size={15} />
                      </button>

                      {/* Approuver si en attente ou rejeté */}
                      {c.statut !== "approuve" && (
                        <button
                          type="button"
                          onClick={() => setApproveTarget(c)}
                          title="Approuver & Créer le compte enseignant"
                          className="tely-btn px-2.5 py-1 text-[11px]"
                        >
                          <CheckCircle size={12} /> Approuver
                        </button>
                      )}

                      {/* Rejeter si en attente */}
                      {c.statut === "en_attente" && (
                        <button
                          type="button"
                          onClick={() => setRejectTarget(c)}
                          title="Rejeter la candidature"
                          className="tely-icon-btn text-gray-900 hover:text-red-500 hover:bg-red-50"
                        >
                          <XCircle size={15} />
                        </button>
                      )}

                      {/* Supprimer */}
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(c)}
                        title="Supprimer la candidature"
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

      {/* ── Modal Détails de la Candidature ── */}
      <Modal open={!!detailItem} onClose={() => setDetailItem(null)}>
        {detailItem && (
          <div className="space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <span className="tely-overline">
                Dossier de candidature
              </span>
              <h2 className="tely-title text-xl mt-0.5">
                {detailItem.prenom} {detailItem.nom}
              </h2>
              <div className="tely-subtitle">
                {detailItem.email} {detailItem.telephone && `• ${detailItem.telephone}`}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-[10px]">
                <span className="tely-overline block">Spécialité</span>
                <span className="font-semibold text-gray-800">{detailItem.specialite}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-[10px]">
                <span className="tely-overline block">Expérience</span>
                <span className="font-semibold text-gray-800">{detailItem.experience_annees} an(s)</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-[10px]">
                <span className="tely-overline block">Établissement</span>
                <span className="font-semibold text-gray-800">{detailItem.etablissement || "Non renseigné"}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-[10px]">
                <span className="tely-overline block">Diplôme</span>
                <span className="font-semibold text-gray-800">{detailItem.diplome || "Non renseigné"}</span>
              </div>
            </div>

            {/* Message de motivation */}
            <div className="p-3.5 bg-gray-50 rounded-[10px] border border-gray-200">
              <span className="tely-label block mb-1">Message de motivation</span>
              <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                {detailItem.message || "Aucun message particulier fourni."}
              </p>
            </div>

            {/* CV link if present */}
            {detailItem.cv_path && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-[10px] border border-gray-200">
                <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <FileText size={16} className="text-gray-900" /> Curriculum Vitae joint
                </span>
                <button
                  type="button"
                  onClick={() => handleOpenCv(detailItem.id)}
                  className="tely-btn px-3 py-1.5 text-xs"
                >
                  Télécharger / Ouvrir <ExternalLink size={12} />
                </button>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setDetailItem(null)}
                className="tely-btn-outline"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Modal Approbation & Définition Mot de passe ── */}
      <Modal open={!!approveTarget} onClose={() => setApproveTarget(null)}>
        {approveTarget && (
          <div className="space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <div className="w-10 h-10 rounded-[10px] bg-gray-50 text-gray-900 flex items-center justify-center font-bold mb-2">
                <CheckCircle size={22} />
              </div>
              <h2 className="tely-title text-xl">
                Approuver {approveTarget.nom_complet}
              </h2>
              <p className="tely-subtitle mt-0.5">
                Un compte enseignant sera créé avec l'adresse <strong>{approveTarget.email}</strong>.
              </p>
            </div>

            <div>
              <label className="block tely-label mb-1.5">
                Mot de passe temporaire (facultatif)
              </label>
              <input
                type="text"
                value={customPassword}
                onChange={(e) => setCustomPassword(e.target.value)}
                placeholder="Laissez vide pour générer un mot de passe automatique"
                className="tely-input font-mono"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                Si vide, un mot de passe sécurisé sera automatiquement généré.
              </span>
            </div>

            <div className="pt-1 text-xs text-gray-500 space-y-1">
              <div className="font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle size={14} className="text-gray-900" /> Accès accordé
              </div>
              <p className="text-[11px]">
                L'enseignant aura accès au Tableau de bord Professeur pour publier des exercices, corrigés et ressources.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setApproveTarget(null)}
                className="tely-btn-outline"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={approving}
                className="tely-btn"
              >
                {approving ? (
                  <span className="inline-block h-3.5 w-28 bg-white/30 rounded animate-pulse" />
                ) : (
                  <>
                    <CheckCircle size={14} /> Confirmer l'approbation
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Modal Identifiants générés (à communiquer) ── */}
      <Modal open={!!credentialsModal?.open} onClose={() => setCredentialsModal(null)}>
        {credentialsModal && (
          <div className="space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-50 text-gray-900 flex items-center justify-center mx-auto">
              <CheckCircle size={28} />
            </div>

            <div>
              <h2 className="tely-title text-xl">Compte Enseignant Créé !</h2>
              <p className="tely-subtitle mt-1">
                Voici les identifiants de connexion générés pour <strong>{credentialsModal.nom}</strong> :
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-[10px] p-4 text-left space-y-3 font-mono text-xs">
              <div>
                <span className="tely-overline block">Email</span>
                <span className="font-bold text-gray-900 select-all">{credentialsModal.email}</span>
              </div>
              <div>
                <span className="tely-overline block">Mot de passe temporaire</span>
                <span className="font-bold text-gray-900 text-sm select-all">{credentialsModal.password}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    `Bonjour ${credentialsModal.nom},\nVotre compte enseignant sur Tely a été activé avec succès !\n\nLien de connexion : https://tely.com/auth/login\nIdentifiant : ${credentialsModal.email}\nMot de passe : ${credentialsModal.password}\n\nÀ très bientôt !`
                  )
                }
                className="tely-btn flex-1"
              >
                <Copy size={14} /> Copier le message d'accès
              </button>
              <button
                type="button"
                onClick={() => setCredentialsModal(null)}
                className="tely-btn-outline"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Modal Rejet ── */}
      <Modal open={!!rejectTarget} onClose={() => setRejectTarget(null)}>
        {rejectTarget && (
          <div className="space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h2 className="tely-title text-xl">
                Rejeter la candidature de {rejectTarget.nom_complet}
              </h2>
              <p className="tely-subtitle mt-0.5">
                Vous pouvez préciser un motif interne ou informatif pour ce rejet.
              </p>
            </div>

            <div>
              <label className="block tely-label mb-1.5">
                Motif du rejet (optionnel)
              </label>
              <textarea
                rows={3}
                value={motifRejet}
                onChange={(e) => setMotifRejet(e.target.value)}
                placeholder="Ex: Profil ne correspondant pas aux besoins actuels ou justificatifs manquants..."
                className="tely-input resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
                className="tely-btn-outline"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={rejecting}
                className="tely-btn-danger"
              >
                {rejecting ? (
                  <span className="inline-block h-3.5 w-28 bg-white/30 rounded animate-pulse" />
                ) : (
                  <>
                    <XCircle size={14} /> Confirmer le rejet
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Modal Confirmation Suppression ── */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Supprimer la candidature"
        description={`Êtes-vous sûr de vouloir supprimer définitivement le dossier de ${deleteTarget?.nom_complet} ?`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

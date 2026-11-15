import { useEffect, useId, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Ban,
  Check,
  Copy,
  Download,
  Loader2,
  RotateCcw,
  Search,
  ShieldCheck,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/authContext";
import {
  ROLE_LABELS,
  createUser,
  deleteUser,
  exportUsersCsv,
  fetchUsers,
  updateUserRole,
  updateUserStatut,
  type AdminUser,
  type CreateUserPayload,
  type StatutFilter,
  type UserCounts,
  type UserRole,
} from "../../services/userService";
import { resolveImageUrl } from "../../utils/imageUrl";
import { dateHeureComplete, messageErreurApi, tempsRelatif } from "../../components/admin/format";

type RoleFilter = "tous" | UserRole;
type StatutChoix = "tous" | StatutFilter;

const FILTRES: { val: RoleFilter; label: string }[] = [
  { val: "tous", label: "Tous" },
  { val: "eleve", label: "Élèves" },
  { val: "professeur", label: "Professeurs" },
  { val: "administrateur", label: "Administrateurs" },
];

const FILTRES_STATUT: { val: StatutChoix; label: string }[] = [
  { val: "tous", label: "Tous les statuts" },
  { val: "actif", label: "Actifs" },
  { val: "suspendu", label: "Suspendus" },
];

const FORM_VIDE: CreateUserPayload = {
  prenom: "",
  nom: "",
  email: "",
  role: "eleve",
  password: "",
  specialite: "",
};

const messageErreur = messageErreurApi;

function estSuspendu(u: AdminUser): boolean {
  return !!(u.est_suspendu ?? u.suspendu_le);
}

function Avatar({ u }: { u: AdminUser }) {
  const url = resolveImageUrl(u.avatar_url);
  return (
    <div className="w-9 h-9 rounded-full bg-gray-900 text-white text-xs font-semibold flex items-center justify-center shrink-0 overflow-hidden">
      {url ? (
        <img src={url} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
      ) : (
        `${u.prenom?.[0] ?? ""}${u.nom?.[0] ?? ""}`.toUpperCase() || "?"
      )}
    </div>
  );
}

function BadgeSuspendu({ u }: { u: AdminUser }) {
  const quand = u.suspendu_le ? dateHeureComplete(u.suspendu_le) : "";
  const infobulle = [
    quand ? `Suspendu le ${quand}` : "Compte suspendu",
    u.motif_suspension ? `Motif : ${u.motif_suspension}` : "Aucun motif renseigné",
  ].join(" — ");
  return (
    <span
      className="tely-chip bg-red-50 text-red-700 cursor-help"
      title={infobulle}
      aria-label={infobulle}
      tabIndex={0}
    >
      <Ban size={11} aria-hidden="true" /> Suspendu
    </span>
  );
}

function DerniereConnexion({ date }: { date?: string | null }) {
  const relatif = tempsRelatif(date);
  if (!relatif) return <span className="text-gray-400">Jamais</span>;
  return (
    <time dateTime={date ?? undefined} title={dateHeureComplete(date)} className="text-gray-600">
      {relatif}
    </time>
  );
}

export default function GestionUtilisateurs() {
  const { addToast } = useToast();
  const { user: moi } = useAuth();
  const uid = useId();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [counts, setCounts] = useState<UserCounts>({ tous: 0, eleve: 0, professeur: 0, administrateur: 0, suspendus: 0 });
  const [filtre, setFiltre] = useState<RoleFilter>("tous");
  // La recherche vit dans l'URL (?search=) : lien direct depuis la recherche globale.
  // ?statut=suspendu|actif est lu au montage (lien « comptes suspendus » de la vue d'ensemble).
  const [searchParams, setSearchParams] = useSearchParams();
  const [statut, setStatut] = useState<StatutChoix>(() => {
    const s = searchParams.get("statut");
    return s === "actif" || s === "suspendu" ? s : "tous";
  });
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [erreurChargement, setErreurChargement] = useState(false);
  const [rechargement, setRechargement] = useState(0);

  const recherche = searchParams.get("search") ?? "";
  const [recherchePrecedente, setRecherchePrecedente] = useState(recherche);
  if (recherche !== recherchePrecedente) {
    setRecherchePrecedente(recherche);
    setPage(1);
  }
  function changerRecherche(valeur: string) {
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        if (valeur) p.set("search", valeur);
        else p.delete("search");
        return p;
      },
      { replace: true }
    );
  }

  // Création
  const [creationOuverte, setCreationOuverte] = useState(false);
  const [form, setForm] = useState<CreateUserPayload>(FORM_VIDE);
  const [enregistrement, setEnregistrement] = useState(false);
  const [identifiants, setIdentifiants] = useState<{ email: string; password: string } | null>(null);
  const [copie, setCopie] = useState(false);

  // Ouverture directe de la création via ?nouveau=1 (raccourcis, palette de commandes)
  const nouveauDemande = searchParams.get("nouveau") === "1";
  const [nouveauTraite, setNouveauTraite] = useState(false);
  if (nouveauDemande && !nouveauTraite) {
    setNouveauTraite(true);
    setCreationOuverte(true);
  } else if (!nouveauDemande && nouveauTraite) {
    setNouveauTraite(false);
  }
  useEffect(() => {
    if (!nouveauDemande) return;
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        p.delete("nouveau");
        return p;
      },
      { replace: true }
    );
  }, [nouveauDemande, setSearchParams]);

  // Changement de rôle (toujours confirmé)
  const [changement, setChangement] = useState<{ user: AdminUser; role: UserRole } | null>(null);
  const [changementEnCours, setChangementEnCours] = useState(false);

  // Suspension / réactivation / suppression / export
  const [suspension, setSuspension] = useState<AdminUser | null>(null);
  const [motif, setMotif] = useState("");
  const [suppression, setSuppression] = useState<AdminUser | null>(null);
  const [actionEnCours, setActionEnCours] = useState<number | null>(null);
  const [exportEnCours, setExportEnCours] = useState(false);

  useEffect(() => {
    let annule = false;
    const t = setTimeout(() => {
      setLoading(true);
      fetchUsers({
        role: filtre === "tous" ? undefined : filtre,
        search: recherche.trim() || undefined,
        statut: statut === "tous" ? undefined : statut,
        page,
      })
        .then((res) => {
          if (annule) return;
          setUsers(res.users.data);
          setLastPage(res.users.last_page);
          setTotal(res.users.total);
          setCounts(res.counts);
          setErreurChargement(false);
        })
        .catch(() => {
          if (annule) return;
          setErreurChargement(true);
          addToast("error", "Impossible de charger les utilisateurs.");
        })
        .finally(() => {
          if (!annule) setLoading(false);
        });
    }, 250);
    return () => {
      annule = true;
      clearTimeout(t);
    };
  }, [filtre, statut, recherche, page, rechargement, addToast]);

  async function soumettreCreation(e: React.FormEvent) {
    e.preventDefault();
    setEnregistrement(true);
    try {
      const payload: CreateUserPayload = {
        prenom: form.prenom.trim(),
        nom: form.nom.trim(),
        email: form.email.trim(),
        role: form.role,
        ...(form.password ? { password: form.password } : {}),
        ...(form.role === "professeur" && form.specialite ? { specialite: form.specialite.trim() } : {}),
      };
      const res = await createUser(payload);
      addToast("success", res.message);
      setCreationOuverte(false);
      setForm(FORM_VIDE);
      if (res.generated_password) {
        setIdentifiants({ email: res.user.email, password: res.generated_password });
        setCopie(false);
      }
      setRechargement((n) => n + 1);
    } catch (err) {
      addToast("error", messageErreur(err, "La création du compte a échoué."));
    } finally {
      setEnregistrement(false);
    }
  }

  async function confirmerChangementRole() {
    if (!changement) return;
    setChangementEnCours(true);
    try {
      const res = await updateUserRole(changement.user.id, changement.role);
      addToast("success", `${changement.user.prenom} ${changement.user.nom} est maintenant ${ROLE_LABELS[changement.role].toLowerCase()}.`);
      setUsers((liste) => liste.map((u) => (u.id === res.user.id ? { ...u, ...res.user } : u)));
      setRechargement((n) => n + 1);
    } catch (err) {
      addToast("error", messageErreur(err, "Le changement de rôle a échoué."));
    } finally {
      setChangementEnCours(false);
      setChangement(null);
    }
  }

  async function confirmerSuspension(e?: React.FormEvent) {
    e?.preventDefault();
    if (!suspension) return;
    const cible = suspension;
    setActionEnCours(cible.id);
    try {
      const res = await updateUserStatut(cible.id, true, motif);
      addToast("success", res.message || `${cible.prenom} ${cible.nom} a été suspendu.`);
      setUsers((liste) => liste.map((u) => (u.id === cible.id ? { ...u, ...res.user } : u)));
      setSuspension(null);
      setMotif("");
      setRechargement((n) => n + 1);
    } catch (err) {
      addToast("error", messageErreur(err, "La suspension du compte a échoué."));
    } finally {
      setActionEnCours(null);
    }
  }

  async function reactiver(u: AdminUser) {
    setActionEnCours(u.id);
    try {
      const res = await updateUserStatut(u.id, false);
      addToast("success", res.message || `${u.prenom} ${u.nom} a été réactivé.`);
      setUsers((liste) => liste.map((x) => (x.id === u.id ? { ...x, ...res.user } : x)));
      setRechargement((n) => n + 1);
    } catch (err) {
      addToast("error", messageErreur(err, "La réactivation du compte a échoué."));
    } finally {
      setActionEnCours(null);
    }
  }

  async function confirmerSuppression() {
    if (!suppression) return;
    const cible = suppression;
    setActionEnCours(cible.id);
    try {
      const res = await deleteUser(cible.id);
      addToast("success", res.message || "Compte supprimé.");
      if (users.length === 1 && page > 1) setPage((p) => p - 1);
      setRechargement((n) => n + 1);
    } catch (err) {
      addToast("error", messageErreur(err, "La suppression du compte a échoué."));
    } finally {
      setSuppression(null);
      setActionEnCours(null);
    }
  }

  async function exporter() {
    setExportEnCours(true);
    try {
      const nom = await exportUsersCsv({
        role: filtre === "tous" ? undefined : filtre,
        search: recherche.trim() || undefined,
        statut: statut === "tous" ? undefined : statut,
      });
      addToast("success", `Export téléchargé : ${nom}`);
    } catch (err) {
      addToast("error", messageErreur(err, "L'export CSV a échoué."));
    } finally {
      setExportEnCours(false);
    }
  }

  async function copierIdentifiants() {
    if (!identifiants) return;
    try {
      await navigator.clipboard.writeText(
        `Votre compte Tely Elearning\nE-mail : ${identifiants.email}\nMot de passe : ${identifiants.password}`
      );
      setCopie(true);
    } catch {
      addToast("error", "Copie impossible : sélectionnez le texte manuellement.");
    }
  }

  const filtresActifs = filtre !== "tous" || statut !== "tous" || !!recherche.trim();

  function reinitialiserFiltres() {
    setFiltre("tous");
    setStatut("tous");
    setPage(1);
    changerRecherche("");
  }

  /** Boutons d'action d'une ligne (suspendre / réactiver / supprimer). */
  function actionsLigne(u: AdminUser) {
    const estMoi = u.id === moi?.id;
    const enCours = actionEnCours === u.id;
    const suspendu = estSuspendu(u);
    const titreMoi = "Action impossible sur votre propre compte";
    return (
      <div className="flex items-center justify-end gap-1">
        {enCours && <Loader2 size={16} className="animate-spin text-gray-400" aria-label="Traitement en cours" />}
        {suspendu ? (
          <button
            type="button"
            onClick={() => reactiver(u)}
            disabled={estMoi || enCours}
            title={estMoi ? titreMoi : "Réactiver le compte"}
            aria-label={`Réactiver le compte de ${u.prenom} ${u.nom}`}
            className="tely-icon-btn disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setMotif("");
              setSuspension(u);
            }}
            disabled={estMoi || enCours}
            title={estMoi ? titreMoi : "Suspendre le compte"}
            aria-label={`Suspendre le compte de ${u.prenom} ${u.nom}`}
            className="tely-icon-btn disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Ban size={16} />
          </button>
        )}
        <button
          type="button"
          onClick={() => setSuppression(u)}
          disabled={estMoi || enCours}
          title={estMoi ? titreMoi : "Supprimer le compte"}
          aria-label={`Supprimer le compte de ${u.prenom} ${u.nom}`}
          className="tely-icon-btn hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Trash2 size={16} />
        </button>
      </div>
    );
  }

  function selectRole(u: AdminUser, className = "") {
    const estMoi = u.id === moi?.id;
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {u.role === "administrateur" && <ShieldCheck size={16} className="text-gray-900 shrink-0" aria-hidden="true" />}
        <select
          value={u.role}
          disabled={estMoi}
          aria-label={`Rôle de ${u.prenom} ${u.nom}`}
          title={estMoi ? "Vous ne pouvez pas modifier votre propre rôle" : "Changer le rôle"}
          onChange={(e) => setChangement({ user: u, role: e.target.value as UserRole })}
          className="tely-input py-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
      </div>
    );
  }

  const etatVide = (
    <div className="px-5 py-14 text-center">
      <p className="tely-title text-lg">Aucun utilisateur trouvé</p>
      <p className="tely-subtitle mt-1">
        {filtresActifs ? "Aucun compte ne correspond à ces critères." : "Aucun compte n'a encore été créé."}
      </p>
      {filtresActifs && (
        <button type="button" onClick={reinitialiserFiltres} className="tely-btn-outline py-2 mt-4">
          Réinitialiser les filtres
        </button>
      )}
    </div>
  );

  const etatErreur = (
    <div className="px-5 py-14 text-center" role="alert">
      <p className="tely-title text-lg">Chargement impossible</p>
      <p className="tely-subtitle mt-1">Vérifiez votre connexion puis réessayez.</p>
      <button type="button" onClick={() => setRechargement((n) => n + 1)} className="tely-btn-outline py-2 mt-4">
        <RotateCcw size={15} /> Réessayer
      </button>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 pb-8 max-w-7xl mx-auto w-full min-w-0">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="tely-h1">Utilisateurs & rôles</h1>
          <p className="tely-subtitle mt-1">
            Créez des comptes, attribuez les rôles, suspendez ou supprimez des accès.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <button
            type="button"
            onClick={exporter}
            disabled={exportEnCours}
            className="tely-btn-outline"
            title="Exporter la liste filtrée au format CSV"
          >
            {exportEnCours ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {exportEnCours ? "Export..." : "Exporter CSV"}
          </button>
          <button type="button" onClick={() => setCreationOuverte(true)} className="tely-btn">
            <UserPlus size={16} /> Ajouter un utilisateur
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="tely-card p-3.5 flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrer par rôle">
            {FILTRES.map((f) => (
              <button
                key={f.val}
                type="button"
                aria-pressed={filtre === f.val}
                onClick={() => {
                  setFiltre(f.val);
                  setPage(1);
                }}
                className={`px-3.5 py-2 rounded-[10px] text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-gray-900 ${
                  filtre === f.val ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {f.label}
                <span
                  className={`text-[11px] px-1.5 rounded-full ${
                    filtre === f.val ? "bg-white/15 text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {counts[f.val]}
                </span>
              </button>
            ))}
          </div>
          <div className="relative flex-1 lg:max-w-sm lg:ml-auto">
            <label htmlFor={`${uid}-recherche`} className="sr-only">
              Rechercher un utilisateur
            </label>
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-900 pointer-events-none" aria-hidden="true" />
            <input
              id={`${uid}-recherche`}
              type="search"
              value={recherche}
              onChange={(e) => changerRecherche(e.target.value)}
              placeholder="Rechercher par nom ou e-mail..."
              className="tely-input pl-10"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 border-t border-gray-100 pt-3" role="group" aria-label="Filtrer par statut">
          <span className="tely-overline mr-1">Statut</span>
          {FILTRES_STATUT.map((f) => (
            <button
              key={f.val}
              type="button"
              aria-pressed={statut === f.val}
              onClick={() => {
                setStatut(f.val);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-[10px] text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 outline-none focus-visible:ring-2 focus-visible:ring-gray-900 ${
                statut === f.val ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {f.label}
              {f.val === "suspendu" && (
                <span
                  className={`text-[11px] px-1.5 rounded-full ${
                    statut === f.val
                      ? "bg-white/15 text-white"
                      : (counts.suspendus ?? 0) > 0
                      ? "bg-red-50 text-red-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {counts.suspendus ?? 0}
                </span>
              )}
            </button>
          ))}
          {filtresActifs && (
            <button type="button" onClick={reinitialiserFiltres} className="tely-link text-xs ml-auto">
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {loading ? "Chargement des utilisateurs" : `${total} utilisateur(s) trouvé(s)`}
      </p>

      {/* Tableau (desktop) */}
      <div className="tely-card overflow-x-auto hidden md:block" aria-busy={loading}>
        <table className="w-full text-sm min-w-[880px]">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              <th scope="col" className="tely-overline px-5 py-4">Utilisateur</th>
              <th scope="col" className="tely-overline px-5 py-4">E-mail</th>
              <th scope="col" className="tely-overline px-5 py-4">Dernière connexion</th>
              <th scope="col" className="tely-overline px-5 py-4">Inscrit le</th>
              <th scope="col" className="tely-overline px-5 py-4 w-52">Rôle</th>
              <th scope="col" className="tely-overline px-5 py-4 text-right">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && users.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-100 animate-pulse">
                  <td className="px-5 py-4" colSpan={6}>
                    <div className="h-4 bg-gray-100 rounded w-2/3" />
                  </td>
                </tr>
              ))
            ) : erreurChargement && users.length === 0 ? (
              <tr>
                <td colSpan={6}>{etatErreur}</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6}>{etatVide}</td>
              </tr>
            ) : (
              users.map((u) => {
                const estMoi = u.id === moi?.id;
                const suspendu = estSuspendu(u);
                return (
                  <tr
                    key={u.id}
                    className={`border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors ${loading ? "opacity-60" : ""} ${
                      suspendu ? "bg-red-50/30" : ""
                    }`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={suspendu ? "opacity-60" : ""}>
                          <Avatar u={u} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate flex items-center gap-1.5 flex-wrap">
                            {u.prenom} {u.nom}
                            {estMoi && <span className="tely-chip">Vous</span>}
                            {suspendu && <BadgeSuspendu u={u} />}
                          </p>
                          {u.role === "professeur" && u.professeur?.specialite && (
                            <p className="text-xs text-gray-400 truncate">{u.professeur.specialite}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 max-w-[240px] truncate" title={u.email}>
                      {u.email}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <DerniereConnexion date={u.derniere_connexion_le} />
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">
                      {new Date(u.created_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-5 py-3.5">{selectRole(u)}</td>
                    <td className="px-5 py-3.5">{actionsLigne(u)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Cartes (mobile) */}
      <div className="md:hidden flex flex-col gap-3" aria-busy={loading}>
        {loading && users.length === 0 ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="tely-card h-36 animate-pulse" />)
        ) : erreurChargement && users.length === 0 ? (
          <div className="tely-card">{etatErreur}</div>
        ) : users.length === 0 ? (
          <div className="tely-card">{etatVide}</div>
        ) : (
          users.map((u) => {
            const estMoi = u.id === moi?.id;
            const suspendu = estSuspendu(u);
            return (
              <article key={u.id} className={`tely-card p-4 flex flex-col gap-3 ${loading ? "opacity-60" : ""}`}>
                <div className="flex items-start gap-3">
                  <div className={suspendu ? "opacity-60" : ""}>
                    <Avatar u={u} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 flex items-center gap-1.5 flex-wrap">
                      <span className="truncate">
                        {u.prenom} {u.nom}
                      </span>
                      {estMoi && <span className="tely-chip">Vous</span>}
                      {suspendu && <BadgeSuspendu u={u} />}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{u.email}</p>
                  </div>
                  {actionsLigne(u)}
                </div>
                <dl className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <dt className="tely-label">Dernière connexion</dt>
                    <dd className="mt-0.5">
                      <DerniereConnexion date={u.derniere_connexion_le} />
                    </dd>
                  </div>
                  <div>
                    <dt className="tely-label">Inscrit le</dt>
                    <dd className="mt-0.5 text-gray-600">{new Date(u.created_at).toLocaleDateString("fr-FR")}</dd>
                  </div>
                </dl>
                {suspendu && u.motif_suspension && (
                  <p className="text-xs rounded-[10px] bg-red-50 text-red-700 px-3 py-2">Motif : {u.motif_suspension}</p>
                )}
                {selectRole(u)}
              </article>
            );
          })
        )}
      </div>

      {lastPage > 1 && (
        <nav className="tely-card flex items-center justify-between gap-3 px-5 py-3.5" aria-label="Pagination">
          <span className="tely-label">
            Page {page} sur {lastPage} · {total} compte{total > 1 ? "s" : ""}
          </span>
          <div className="flex gap-2">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="tely-btn-outline py-2">
              Précédent
            </button>
            <button type="button" disabled={page >= lastPage} onClick={() => setPage((p) => p + 1)} className="tely-btn-outline py-2">
              Suivant
            </button>
          </div>
        </nav>
      )}

      {/* Modale : création */}
      {creationOuverte && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => !enregistrement && setCreationOuverte(false)}>
          <form
            onSubmit={soumettreCreation}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${uid}-titre-creation`}
            className="tely-card tely-animate w-full max-w-lg p-7 flex flex-col gap-3.5 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between gap-3 mb-1">
              <div>
                <h2 id={`${uid}-titre-creation`} className="tely-title text-[28px]">Nouvel utilisateur</h2>
                <p className="tely-subtitle mt-1">Le compte est actif immédiatement.</p>
              </div>
              <button type="button" onClick={() => setCreationOuverte(false)} className="tely-icon-btn" aria-label="Fermer">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <label className="flex flex-col gap-1.5">
                <span className="tely-label">Prénom</span>
                <input required autoFocus value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} className="tely-input" placeholder="Awa" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="tely-label">Nom</span>
                <input required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className="tely-input" placeholder="Diallo" />
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="tely-label">E-mail</span>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="tely-input" placeholder="awa.diallo@gmail.com" />
            </label>

            <div className="flex flex-col gap-1.5">
              <span className="tely-label">Rôle</span>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    aria-pressed={form.role === r}
                    onClick={() => setForm({ ...form, role: r })}
                    className={`rounded-[10px] border px-3 py-3 text-sm font-semibold transition-all cursor-pointer ${
                      form.role === r ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-900 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {ROLE_LABELS[r]}
                  </button>
                ))}
              </div>
              {form.role === "administrateur" && (
                <span className="text-[11px] text-gray-500">Un administrateur a accès à toute la plateforme, y compris à la gestion des comptes.</span>
              )}
            </div>

            {form.role === "professeur" && (
              <label className="flex flex-col gap-1.5">
                <span className="tely-label">Spécialité (facultatif)</span>
                <input value={form.specialite} onChange={(e) => setForm({ ...form, specialite: e.target.value })} className="tely-input" placeholder="Mathématiques" />
              </label>
            )}

            <label className="flex flex-col gap-1.5">
              <span className="tely-label">Mot de passe (facultatif)</span>
              <input
                type="text"
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="tely-input"
                placeholder="Laisser vide pour en générer un"
              />
            </label>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={() => setCreationOuverte(false)} className="tely-btn-outline flex-1">
                Annuler
              </button>
              <button type="submit" disabled={enregistrement} className="tely-btn flex-1">
                {enregistrement ? "Création..." : "Créer le compte"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modale : identifiants générés (affichés une seule fois) */}
      {identifiants && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby={`${uid}-titre-identifiants`} className="tely-card tely-animate w-full max-w-md p-7 flex flex-col gap-4">
            <div>
              <h2 id={`${uid}-titre-identifiants`} className="tely-title text-[28px]">Compte créé</h2>
              <p className="tely-subtitle mt-1">
                Transmettez ces identifiants à l'utilisateur : le mot de passe ne sera plus affiché. Un e-mail de bienvenue lui a aussi été envoyé.
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-[10px] p-4 text-sm flex flex-col gap-1.5">
              <p><span className="tely-label">E-mail :</span> <span className="font-semibold text-gray-900 break-all">{identifiants.email}</span></p>
              <p><span className="tely-label">Mot de passe :</span> <span className="font-mono font-semibold text-gray-900 break-all">{identifiants.password}</span></p>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setIdentifiants(null)} className="tely-btn-outline flex-1">
                Fermer
              </button>
              <button type="button" onClick={copierIdentifiants} className="tely-btn flex-1">
                {copie ? <Check size={16} /> : <Copy size={16} />} {copie ? "Copié" : "Copier"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale : suspension avec motif */}
      {suspension && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => actionEnCours === null && setSuspension(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape" && actionEnCours === null) setSuspension(null);
          }}
        >
          <form
            onSubmit={confirmerSuspension}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${uid}-titre-suspension`}
            aria-describedby={`${uid}-desc-suspension`}
            className="tely-card tely-animate w-full max-w-md p-6 flex flex-col gap-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id={`${uid}-titre-suspension`} className="tely-title text-xl">Suspendre le compte ?</h2>
                <p id={`${uid}-desc-suspension`} className="tely-subtitle mt-1.5 leading-relaxed">
                  {suspension.prenom} {suspension.nom} ({suspension.email}) sera immédiatement déconnecté et ne pourra plus se
                  connecter jusqu'à la réactivation du compte. Ses données sont conservées.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSuspension(null)}
                disabled={actionEnCours !== null}
                className="tely-icon-btn shrink-0"
                aria-label="Fermer"
              >
                <X size={16} />
              </button>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="tely-label">Motif (facultatif, visible des administrateurs)</span>
              <textarea
                autoFocus
                rows={3}
                maxLength={255}
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                className="tely-input resize-none"
                placeholder="Ex. : comportement inapproprié signalé le 12/11"
              />
              <span className="text-[11px] text-gray-400 text-right">{motif.length}/255</span>
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSuspension(null)}
                disabled={actionEnCours !== null}
                className="tely-btn-outline flex-1"
              >
                Annuler
              </button>
              <button type="submit" disabled={actionEnCours !== null} className="tely-btn-danger flex-1">
                {actionEnCours !== null ? "Suspension..." : "Suspendre"}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        open={!!changement}
        title="Changer le rôle ?"
        description={
          changement
            ? `${changement.user.prenom} ${changement.user.nom} passera de « ${ROLE_LABELS[changement.user.role]} » à « ${ROLE_LABELS[changement.role]} ». Ses accès changent immédiatement et il devra se reconnecter.`
            : ""
        }
        confirmLabel="Confirmer"
        loadingLabel="Mise à jour..."
        loading={changementEnCours}
        onConfirm={confirmerChangementRole}
        onCancel={() => setChangement(null)}
      />

      <ConfirmModal
        open={!!suppression}
        title="Supprimer définitivement ce compte ?"
        description={
          suppression
            ? `Le compte de ${suppression.prenom} ${suppression.nom} (${suppression.email}) sera supprimé et ses sessions fermées. Cette action est irréversible : préférez la suspension si vous souhaitez seulement bloquer l'accès.`
            : ""
        }
        confirmLabel="Supprimer"
        loadingLabel="Suppression..."
        variant="danger"
        loading={suppression !== null && actionEnCours === suppression.id}
        onConfirm={confirmerSuppression}
        onCancel={() => setSuppression(null)}
      />
    </div>
  );
}

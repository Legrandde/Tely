import { useEffect, useState } from "react";
import { Check, Copy, Search, ShieldCheck, UserPlus, X } from "lucide-react";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/authContext";
import {
  ROLE_LABELS,
  createUser,
  fetchUsers,
  updateUserRole,
  type AdminUser,
  type CreateUserPayload,
  type UserCounts,
  type UserRole,
} from "../../services/userService";
import { resolveImageUrl } from "../../utils/imageUrl";

type RoleFilter = "tous" | UserRole;

const FILTRES: { val: RoleFilter; label: string }[] = [
  { val: "tous", label: "Tous" },
  { val: "eleve", label: "Élèves" },
  { val: "professeur", label: "Professeurs" },
  { val: "administrateur", label: "Administrateurs" },
];

const FORM_VIDE: CreateUserPayload = {
  prenom: "",
  nom: "",
  email: "",
  role: "eleve",
  password: "",
  specialite: "",
};

function messageErreur(err: unknown, defaut: string): string {
  const data = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })
    ?.response?.data;
  const premiereErreur = data?.errors ? Object.values(data.errors)[0]?.[0] : undefined;
  return premiereErreur ?? data?.message ?? defaut;
}

export default function GestionUtilisateurs() {
  const { addToast } = useToast();
  const { user: moi } = useAuth();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [counts, setCounts] = useState<UserCounts>({ tous: 0, eleve: 0, professeur: 0, administrateur: 0 });
  const [filtre, setFiltre] = useState<RoleFilter>("tous");
  const [recherche, setRecherche] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [rechargement, setRechargement] = useState(0);

  // Création
  const [creationOuverte, setCreationOuverte] = useState(false);
  const [form, setForm] = useState<CreateUserPayload>(FORM_VIDE);
  const [enregistrement, setEnregistrement] = useState(false);
  const [identifiants, setIdentifiants] = useState<{ email: string; password: string } | null>(null);
  const [copie, setCopie] = useState(false);

  // Changement de rôle (toujours confirmé)
  const [changement, setChangement] = useState<{ user: AdminUser; role: UserRole } | null>(null);
  const [changementEnCours, setChangementEnCours] = useState(false);

  useEffect(() => {
    let annule = false;
    const t = setTimeout(() => {
      setLoading(true);
      fetchUsers({
        role: filtre === "tous" ? undefined : filtre,
        search: recherche.trim() || undefined,
        page,
      })
        .then((res) => {
          if (annule) return;
          setUsers(res.users.data);
          setLastPage(res.users.last_page);
          setCounts(res.counts);
        })
        .catch(() => {
          if (!annule) addToast("error", "Impossible de charger les utilisateurs.");
        })
        .finally(() => {
          if (!annule) setLoading(false);
        });
    }, 250);
    return () => {
      annule = true;
      clearTimeout(t);
    };
  }, [filtre, recherche, page, rechargement, addToast]);

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

  async function copierIdentifiants() {
    if (!identifiants) return;
    await navigator.clipboard.writeText(
      `Votre compte Tely Elearning\nE-mail : ${identifiants.email}\nMot de passe : ${identifiants.password}`
    );
    setCopie(true);
  }

  return (
    <div className="flex flex-col gap-6 pb-8 max-w-7xl mx-auto w-full min-w-0">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="tely-h1">Utilisateurs & rôles</h1>
          <p className="tely-subtitle mt-1">
            Créez des comptes et attribuez à chacun son rôle : élève, professeur ou administrateur.
          </p>
        </div>
        <button type="button" onClick={() => setCreationOuverte(true)} className="tely-btn shrink-0">
          <UserPlus size={16} /> Ajouter un utilisateur
        </button>
      </div>

      {/* Filtres */}
      <div className="tely-card p-3.5 flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {FILTRES.map((f) => (
            <button
              key={f.val}
              type="button"
              onClick={() => {
                setFiltre(f.val);
                setPage(1);
              }}
              className={`px-3.5 py-2 rounded-[10px] text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
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
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-900 pointer-events-none" />
          <input
            type="text"
            value={recherche}
            onChange={(e) => {
              setRecherche(e.target.value);
              setPage(1);
            }}
            placeholder="Rechercher par nom ou e-mail..."
            className="tely-input pl-10"
          />
        </div>
      </div>

      {/* Tableau */}
      <div className="tely-card overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              <th className="tely-overline px-5 py-4">Utilisateur</th>
              <th className="tely-overline px-5 py-4">E-mail</th>
              <th className="tely-overline px-5 py-4">Inscrit le</th>
              <th className="tely-overline px-5 py-4 w-56">Rôle</th>
            </tr>
          </thead>
          <tbody>
            {loading && users.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-100 animate-pulse">
                  <td className="px-5 py-4" colSpan={4}>
                    <div className="h-4 bg-gray-100 rounded w-2/3" />
                  </td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-14 text-center">
                  <p className="tely-title text-lg">Aucun utilisateur trouvé</p>
                  <p className="tely-subtitle mt-1">Modifiez la recherche ou le filtre de rôle.</p>
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const estMoi = u.id === moi?.id;
                return (
                  <tr key={u.id} className={`border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors ${loading ? "opacity-60" : ""}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-900 text-white text-xs font-semibold flex items-center justify-center shrink-0 overflow-hidden">
                          {resolveImageUrl(u.avatar_url) ? (
                            <img src={resolveImageUrl(u.avatar_url) ?? undefined} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                          ) : (
                            `${u.prenom?.[0] ?? ""}${u.nom?.[0] ?? ""}`.toUpperCase() || "?"
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {u.prenom} {u.nom} {estMoi && <span className="tely-chip ml-1">Vous</span>}
                          </p>
                          {u.role === "professeur" && u.professeur?.specialite && (
                            <p className="text-xs text-gray-400 truncate">{u.professeur.specialite}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{u.email}</td>
                    <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">
                      {new Date(u.created_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        {u.role === "administrateur" && <ShieldCheck size={16} className="text-gray-900 shrink-0" />}
                        <select
                          value={u.role}
                          disabled={estMoi}
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
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {lastPage > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
            <span className="tely-label">
              Page {page} sur {lastPage}
            </span>
            <div className="flex gap-2">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="tely-btn-outline py-2">
                Précédent
              </button>
              <button type="button" disabled={page >= lastPage} onClick={() => setPage((p) => p + 1)} className="tely-btn-outline py-2">
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modale : création */}
      {creationOuverte && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => !enregistrement && setCreationOuverte(false)}>
          <form
            onSubmit={soumettreCreation}
            onClick={(e) => e.stopPropagation()}
            className="tely-card tely-animate w-full max-w-lg p-7 flex flex-col gap-3.5 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between gap-3 mb-1">
              <div>
                <h2 className="tely-title text-[28px]">Nouvel utilisateur</h2>
                <p className="tely-subtitle mt-1">Le compte est actif immédiatement.</p>
              </div>
              <button type="button" onClick={() => setCreationOuverte(false)} className="tely-icon-btn" aria-label="Fermer">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <label className="flex flex-col gap-1.5">
                <span className="tely-label">Prénom</span>
                <input required value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} className="tely-input" placeholder="Awa" />
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
          <div className="tely-card tely-animate w-full max-w-md p-7 flex flex-col gap-4">
            <div>
              <h2 className="tely-title text-[28px]">Compte créé</h2>
              <p className="tely-subtitle mt-1">
                Transmettez ces identifiants à l'utilisateur : le mot de passe ne sera plus affiché. Un e-mail de bienvenue lui a aussi été envoyé.
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-[10px] p-4 text-sm flex flex-col gap-1.5">
              <p><span className="tely-label">E-mail :</span> <span className="font-semibold text-gray-900">{identifiants.email}</span></p>
              <p><span className="tely-label">Mot de passe :</span> <span className="font-mono font-semibold text-gray-900">{identifiants.password}</span></p>
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
    </div>
  );
}

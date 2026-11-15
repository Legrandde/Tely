import { Fragment, useEffect, useId, useState } from "react";
import { ChevronDown, Filter, RotateCcw, ScrollText, Search, X } from "lucide-react";
import { fetchJournal } from "../../services/backofficeService";
import type { JournalEntree, Pagination } from "../../types/admin";
import { useToast } from "../../context/ToastContext";
import { dateHeureComplete, initialesDe, tempsRelatif } from "../../components/admin/format";

/* ─────────────────────────────────────────────────────────────
   Journal d'audit du back-office
   ───────────────────────────────────────────────────────────── */

const LIBELLES_ACTIONS: Record<string, string> = {
  "page.creee": "Page créée",
  "page.modifiee": "Page modifiée",
  "page.publiee": "Page publiée",
  "page.dupliquee": "Page dupliquée",
  "page.supprimee": "Page supprimée",
  "media.supprime": "Média supprimé",
  "utilisateur.cree": "Compte créé",
  "utilisateur.role": "Rôle modifié",
  "utilisateur.suspendu": "Compte suspendu",
  "utilisateur.reactive": "Compte réactivé",
  "utilisateur.supprime": "Compte supprimé",
  "utilisateurs.export": "Export des comptes",
  "parametres.modifies": "Paramètres modifiés",
  "compte.export": "Export de données perso.",
  "compte.supprime": "Compte auto-supprimé",
};

const LIBELLES_FAMILLES: Record<string, string> = {
  page: "Pages",
  media: "Médias",
  utilisateur: "Utilisateurs",
  utilisateurs: "Exports de comptes",
  parametres: "Paramètres",
  compte: "Comptes (RGPD)",
};

const ROLES: Record<string, string> = {
  eleve: "Élève",
  professeur: "Professeur",
  administrateur: "Admin",
};

function libelleAction(action: string): string {
  return LIBELLES_ACTIONS[action] ?? action;
}

function famille(action: string): string {
  return action.split(".")[0] ?? action;
}

/** Couleur du badge selon la famille ; les actions destructrices ressortent en rouge. */
function classesBadge(action: string): string {
  if (/(supprim|suspendu)/.test(action)) return "bg-red-50 text-red-700 ring-red-200";
  switch (famille(action)) {
    case "page":
      return "bg-amber-50 text-amber-800 ring-amber-200";
    case "media":
      return "bg-gray-100 text-gray-700 ring-gray-200";
    case "utilisateur":
      return "bg-emerald-50 text-emerald-800 ring-emerald-200";
    case "utilisateurs":
    case "compte":
      return "bg-gray-900 text-white ring-gray-900";
    case "parametres":
      return "bg-amber-500 text-gray-900 ring-amber-500";
    default:
      return "bg-gray-100 text-gray-700 ring-gray-200";
  }
}

function BadgeAction({ action }: { action: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset whitespace-nowrap ${classesBadge(action)}`}
      title={action}
    >
      {libelleAction(action)}
    </span>
  );
}

function Acteur({ entree }: { entree: JournalEntree }) {
  const u = entree.user;
  if (!u) {
    return (
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 text-[11px] font-semibold flex items-center justify-center shrink-0" aria-hidden="true">
          —
        </span>
        <span className="text-xs text-gray-400">Système / compte supprimé</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <span
        className="w-8 h-8 rounded-full bg-gray-900 text-white text-[11px] font-semibold flex items-center justify-center shrink-0"
        aria-hidden="true"
      >
        {initialesDe(u.prenom, u.nom)}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate" title={u.email}>
          {u.prenom} {u.nom}
        </p>
        <p className="text-[11px] text-gray-400 truncate">{ROLES[u.role] ?? u.role}</p>
      </div>
    </div>
  );
}

function Horodatage({ date }: { date: string }) {
  const d = new Date(date);
  const valide = !Number.isNaN(d.getTime());
  return (
    <time dateTime={date} title={tempsRelatif(date) ?? undefined} className="flex flex-col leading-tight">
      <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
        {valide ? d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
      </span>
      <span className="text-[11px] text-gray-400 whitespace-nowrap">
        {valide ? d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : ""}
      </span>
    </time>
  );
}

function aDesDetails(e: JournalEntree): boolean {
  if (e.sujet_type || e.sujet_id) return true;
  if (!e.meta) return false;
  return Array.isArray(e.meta) ? e.meta.length > 0 : Object.keys(e.meta).length > 0;
}

function valeurLisible(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

/** Détail `meta` affiché en texte brut (aucune injection HTML). */
function DetailMeta({ entree }: { entree: JournalEntree }) {
  const lignes: Array<[string, unknown]> = [];
  if (entree.sujet_type) {
    lignes.push(["Objet", `${entree.sujet_type.split("\\").pop()}${entree.sujet_id ? ` #${entree.sujet_id}` : ""}`]);
  }
  if (entree.meta && !Array.isArray(entree.meta)) {
    for (const [k, v] of Object.entries(entree.meta)) lignes.push([k, v]);
  } else if (Array.isArray(entree.meta) && entree.meta.length) {
    lignes.push(["meta", entree.meta]);
  }
  if (entree.user?.email) lignes.push(["E-mail de l'acteur", entree.user.email]);
  lignes.push(["Horodatage complet", dateHeureComplete(entree.created_at)]);

  return (
    <dl className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-x-4 gap-y-1.5 text-xs">
      {lignes.map(([k, v]) => (
        <Fragment key={k}>
          <dt className="tely-label pt-0.5">{k}</dt>
          <dd className="text-gray-800 font-mono whitespace-pre-wrap break-all">{valeurLisible(v)}</dd>
        </Fragment>
      ))}
    </dl>
  );
}

function aujourdhui(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function JournalActivite() {
  const { addToast } = useToast();
  const uid = useId();

  const [action, setAction] = useState("");
  const [recherche, setRecherche] = useState("");
  const [du, setDu] = useState("");
  const [au, setAu] = useState("");
  const [page, setPage] = useState(1);

  const [journal, setJournal] = useState<Pagination<JournalEntree> | null>(null);
  const [actions, setActions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(false);
  const [rechargement, setRechargement] = useState(0);
  const [ouverts, setOuverts] = useState<Set<number>>(() => new Set());
  const [filtresMobile, setFiltresMobile] = useState(false);

  const periodeInvalide = !!du && !!au && au < du;

  useEffect(() => {
    if (periodeInvalide) return;
    let annule = false;
    const t = setTimeout(() => {
      setLoading(true);
      fetchJournal({ action: action || undefined, search: recherche, du: du || undefined, au: au || undefined, page })
        .then((res) => {
          if (annule) return;
          setJournal(res.journal);
          setActions(res.actions ?? []);
          setErreur(false);
        })
        .catch(() => {
          if (annule) return;
          setErreur(true);
          addToast("error", "Impossible de charger le journal d'audit.");
        })
        .finally(() => {
          if (!annule) setLoading(false);
        });
    }, 250);
    return () => {
      annule = true;
      clearTimeout(t);
    };
  }, [action, recherche, du, au, page, rechargement, periodeInvalide, addToast]);

  const familles = Array.from(new Set(actions.map(famille))).filter((f) => actions.filter((a) => famille(a) === f).length > 1);
  const filtresActifs = !!(action || recherche.trim() || du || au);
  const entrees = journal?.data ?? [];

  function reinitialiser() {
    setAction("");
    setRecherche("");
    setDu("");
    setAu("");
    setPage(1);
  }

  function basculer(id: number) {
    setOuverts((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });
  }

  const filtres = (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_auto_auto_auto] gap-3 items-end">
      <div className="relative">
        <label htmlFor={`${uid}-q`} className="tely-label block mb-1.5">
          Recherche dans les descriptions
        </label>
        <Search size={16} className="absolute left-3 bottom-[18px] text-gray-900 pointer-events-none" aria-hidden="true" />
        <input
          id={`${uid}-q`}
          type="search"
          value={recherche}
          onChange={(e) => {
            setRecherche(e.target.value);
            setPage(1);
          }}
          placeholder="E-mail, titre de page…"
          className="tely-input pl-10"
        />
      </div>
      <div>
        <label htmlFor={`${uid}-action`} className="tely-label block mb-1.5">
          Action
        </label>
        <select
          id={`${uid}-action`}
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setPage(1);
          }}
          className="tely-input"
        >
          <option value="">Toutes les actions</option>
          {familles.length > 0 && (
            <optgroup label="Familles">
              {familles.map((f) => (
                <option key={`f-${f}`} value={`${f}.`}>
                  {LIBELLES_FAMILLES[f] ?? f} (toutes)
                </option>
              ))}
            </optgroup>
          )}
          <optgroup label="Actions">
            {actions.map((a) => (
              <option key={a} value={a}>
                {libelleAction(a)}
              </option>
            ))}
          </optgroup>
        </select>
      </div>
      <div>
        <label htmlFor={`${uid}-du`} className="tely-label block mb-1.5">
          Du
        </label>
        <input
          id={`${uid}-du`}
          type="date"
          value={du}
          max={au || aujourdhui()}
          onChange={(e) => {
            setDu(e.target.value);
            setPage(1);
          }}
          className="tely-input"
        />
      </div>
      <div>
        <label htmlFor={`${uid}-au`} className="tely-label block mb-1.5">
          Au
        </label>
        <input
          id={`${uid}-au`}
          type="date"
          value={au}
          min={du || undefined}
          max={aujourdhui()}
          onChange={(e) => {
            setAu(e.target.value);
            setPage(1);
          }}
          aria-invalid={periodeInvalide}
          aria-describedby={periodeInvalide ? `${uid}-periode-erreur` : undefined}
          className="tely-input"
        />
      </div>
      <button
        type="button"
        onClick={reinitialiser}
        disabled={!filtresActifs}
        className="tely-btn-outline py-3.5"
      >
        <RotateCcw size={15} /> Réinitialiser
      </button>
      {periodeInvalide && (
        <p id={`${uid}-periode-erreur`} className="tely-error sm:col-span-2 lg:col-span-5" role="alert">
          La date de fin doit être postérieure à la date de début.
        </p>
      )}
    </div>
  );

  const etatVide = (
    <div className="px-5 py-14 text-center">
      <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
        <ScrollText size={22} className="text-gray-900" />
      </div>
      <p className="tely-title text-lg">{filtresActifs ? "Aucune entrée pour ces critères" : "Le journal est vide"}</p>
      <p className="tely-subtitle mt-1">
        {filtresActifs
          ? "Élargissez la période ou modifiez les filtres."
          : "Les actions sensibles (pages, comptes, paramètres…) apparaîtront ici."}
      </p>
      {filtresActifs && (
        <button type="button" onClick={reinitialiser} className="tely-btn-outline py-2 mt-4">
          Réinitialiser les filtres
        </button>
      )}
    </div>
  );

  const etatErreur = (
    <div className="px-5 py-14 text-center" role="alert">
      <p className="tely-title text-lg">Chargement impossible</p>
      <p className="tely-subtitle mt-1">Le journal n'a pas pu être récupéré.</p>
      <button type="button" onClick={() => setRechargement((n) => n + 1)} className="tely-btn-outline py-2 mt-4">
        <RotateCcw size={15} /> Réessayer
      </button>
    </div>
  );

  const premierChargement = loading && !journal;

  return (
    <div className="flex flex-col gap-6 pb-8 max-w-7xl mx-auto w-full min-w-0">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="tely-h1">Journal d'audit</h1>
          <p className="tely-subtitle mt-1">
            Historique des actions sensibles réalisées sur la plateforme : qui, quoi, quand et depuis où.
          </p>
        </div>
        {journal && (
          <span className="tely-chip self-start sm:self-auto">
            {journal.total} entrée{journal.total > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Filtres */}
      <div className="tely-card p-4">
        <button
          type="button"
          onClick={() => setFiltresMobile((o) => !o)}
          aria-expanded={filtresMobile}
          aria-controls={`${uid}-filtres`}
          className="md:hidden w-full flex items-center justify-between text-sm font-semibold text-gray-900 cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Filter size={16} /> Filtres
            {filtresActifs && <span className="tely-chip">actifs</span>}
          </span>
          <ChevronDown size={16} className={`transition-transform ${filtresMobile ? "rotate-180" : ""}`} />
        </button>
        <div id={`${uid}-filtres`} className={`${filtresMobile ? "block mt-4" : "hidden"} md:block md:mt-0`}>
          {filtres}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {loading ? "Chargement du journal" : journal ? `${journal.total} entrée(s)` : ""}
      </p>

      {/* Tableau (desktop) */}
      <div className="tely-card overflow-x-auto hidden md:block" aria-busy={loading}>
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              <th scope="col" className="tely-overline px-5 py-4 w-36">Date / heure</th>
              <th scope="col" className="tely-overline px-5 py-4 w-56">Acteur</th>
              <th scope="col" className="tely-overline px-5 py-4 w-44">Action</th>
              <th scope="col" className="tely-overline px-5 py-4">Description</th>
              <th scope="col" className="tely-overline px-5 py-4 w-32">Adresse IP</th>
              <th scope="col" className="px-3 py-4 w-12">
                <span className="sr-only">Détails</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {premierChargement ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-100 animate-pulse">
                  <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded w-20" /></td>
                  <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded w-32" /></td>
                  <td className="px-5 py-4"><div className="h-5 bg-gray-100 rounded-full w-24" /></td>
                  <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded w-3/4" /></td>
                  <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded w-20" /></td>
                  <td />
                </tr>
              ))
            ) : erreur && entrees.length === 0 ? (
              <tr>
                <td colSpan={6}>{etatErreur}</td>
              </tr>
            ) : entrees.length === 0 ? (
              <tr>
                <td colSpan={6}>{etatVide}</td>
              </tr>
            ) : (
              entrees.map((e) => {
                const ouvert = ouverts.has(e.id);
                const details = aDesDetails(e);
                return (
                  <Fragment key={e.id}>
                    <tr className={`border-b border-gray-100 hover:bg-gray-50 transition-colors align-top ${loading ? "opacity-60" : ""}`}>
                      <td className="px-5 py-3.5"><Horodatage date={e.created_at} /></td>
                      <td className="px-5 py-3.5"><Acteur entree={e} /></td>
                      <td className="px-5 py-3.5"><BadgeAction action={e.action} /></td>
                      <td className="px-5 py-3.5 text-gray-700 break-words">{e.description}</td>
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-500 whitespace-nowrap">{e.ip ?? "—"}</td>
                      <td className="px-3 py-3">
                        {details && (
                          <button
                            type="button"
                            onClick={() => basculer(e.id)}
                            aria-expanded={ouvert}
                            aria-controls={`${uid}-detail-${e.id}`}
                            aria-label={ouvert ? "Masquer les détails" : "Afficher les détails"}
                            className="tely-icon-btn"
                          >
                            <ChevronDown size={16} className={`transition-transform ${ouvert ? "rotate-180" : ""}`} />
                          </button>
                        )}
                      </td>
                    </tr>
                    {details && ouvert && (
                      <tr id={`${uid}-detail-${e.id}`} className="border-b border-gray-100 bg-gray-50/70">
                        <td colSpan={6} className="px-5 py-4">
                          <DetailMeta entree={e} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Cartes (mobile) */}
      <div className="md:hidden flex flex-col gap-3" aria-busy={loading}>
        {premierChargement ? (
          Array.from({ length: 5 }).map((_, i) => <div key={i} className="tely-card h-32 animate-pulse" />)
        ) : erreur && entrees.length === 0 ? (
          <div className="tely-card">{etatErreur}</div>
        ) : entrees.length === 0 ? (
          <div className="tely-card">{etatVide}</div>
        ) : (
          entrees.map((e) => {
            const ouvert = ouverts.has(e.id);
            const details = aDesDetails(e);
            return (
              <article key={e.id} className={`tely-card p-4 flex flex-col gap-3 ${loading ? "opacity-60" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <BadgeAction action={e.action} />
                  <span className="text-[11px] text-gray-400 text-right" title={dateHeureComplete(e.created_at)}>
                    {tempsRelatif(e.created_at)}
                  </span>
                </div>
                <p className="text-sm text-gray-800 break-words">{e.description}</p>
                <div className="flex items-center justify-between gap-3">
                  <Acteur entree={e} />
                  <span className="font-mono text-[11px] text-gray-400 shrink-0">{e.ip ?? ""}</span>
                </div>
                {details && (
                  <>
                    <button
                      type="button"
                      onClick={() => basculer(e.id)}
                      aria-expanded={ouvert}
                      aria-controls={`${uid}-mdetail-${e.id}`}
                      className="tely-link text-xs self-start flex items-center gap-1"
                    >
                      {ouvert ? "Masquer les détails" : "Voir les détails"}
                      <ChevronDown size={14} className={`transition-transform ${ouvert ? "rotate-180" : ""}`} />
                    </button>
                    {ouvert && (
                      <div id={`${uid}-mdetail-${e.id}`} className="rounded-[10px] bg-gray-50 p-3">
                        <DetailMeta entree={e} />
                      </div>
                    )}
                  </>
                )}
              </article>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {journal && journal.last_page > 1 && (
        <nav className="tely-card flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5" aria-label="Pagination du journal">
          <span className="tely-label">
            {journal.from ?? 0}–{journal.to ?? 0} sur {journal.total} · page {journal.current_page}/{journal.last_page}
          </span>
          <div className="flex gap-2">
            <button type="button" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)} className="tely-btn-outline py-2">
              Précédent
            </button>
            <button
              type="button"
              disabled={page >= journal.last_page || loading}
              onClick={() => setPage((p) => p + 1)}
              className="tely-btn-outline py-2"
            >
              Suivant
            </button>
          </div>
        </nav>
      )}

      {erreur && entrees.length > 0 && (
        <div className="tely-card p-3 flex items-center justify-between gap-3 text-xs text-red-700" role="alert">
          La dernière mise à jour a échoué : les données affichées peuvent être obsolètes.
          <button type="button" onClick={() => setRechargement((n) => n + 1)} className="tely-icon-btn" aria-label="Réessayer">
            <RotateCcw size={14} />
          </button>
          <button type="button" onClick={() => setErreur(false)} className="tely-icon-btn" aria-label="Masquer">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

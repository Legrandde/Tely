import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  ClipboardList,
  CornerDownLeft,
  ExternalLink,
  FileText,
  FilePlus2,
  Image,
  Loader2,
  ScrollText,
  Search,
  Settings,
  TrendingUp,
  UserCheck,
  UserPlus,
  X,
  ArrowUp,
  ArrowDown,
  Newspaper,
} from "lucide-react";
import { rechercheGlobale } from "../../services/backofficeService";
import type { RechercheResultats } from "../../types/admin";
import { resolveImageUrl } from "../../utils/imageUrl";

/* ─────────────────────────────────────────────────────────────
   Palette de commandes du back-office (Ctrl/⌘ + K)
   Pattern WAI-ARIA « combobox + listbox » dans une boîte de dialogue.
   ───────────────────────────────────────────────────────────── */

interface Commande {
  id: string;
  groupe: string;
  label: string;
  detail?: string;
  icon: React.ReactNode;
  to: string;
  externe?: boolean;
  motsCles?: string;
}

const ROLE_LABELS: Record<string, string> = {
  eleve: "Élève",
  professeur: "Professeur",
  administrateur: "Administrateur",
};

const ACTIONS_RAPIDES: Commande[] = [
  { id: "a-exercice", groupe: "Actions rapides", label: "Nouvel exercice", icon: <BookOpen size={16} />, to: "/Dashbord-admin/exercices/nouveau", motsCles: "creer ajouter exercice" },
  { id: "a-sujet", groupe: "Actions rapides", label: "Nouveau sujet d'examen", icon: <ClipboardList size={16} />, to: "/Dashbord-admin/sujets/nouveau", motsCles: "creer ajouter sujet examen bac brevet" },
  { id: "a-page", groupe: "Actions rapides", label: "Nouvelle page", icon: <FilePlus2 size={16} />, to: "/Dashbord-admin/pages?nouvelle=1", motsCles: "creer page cms site builder" },
  { id: "a-article", groupe: "Actions rapides", label: "Nouvel article", icon: <Newspaper size={16} />, to: "/Dashbord-admin/blog?nouveau=1", motsCles: "creer ecrire article blog rediger actualite" },
  { id: "a-user", groupe: "Actions rapides", label: "Inviter un utilisateur", icon: <UserPlus size={16} />, to: "/Dashbord-admin/utilisateurs?nouveau=1", motsCles: "creer compte utilisateur ajouter inviter" },
  { id: "a-candidatures", groupe: "Actions rapides", label: "Candidatures enseignants", icon: <UserCheck size={16} />, to: "/Dashbord-admin/candidatures", motsCles: "professeur recrutement" },
  { id: "a-medias", groupe: "Actions rapides", label: "Médiathèque", icon: <Image size={16} />, to: "/Dashbord-admin/medias", motsCles: "images medias fichiers" },
  { id: "a-stats", groupe: "Actions rapides", label: "Statistiques", icon: <TrendingUp size={16} />, to: "/Dashbord-admin/statistiques", motsCles: "trafic audience" },
  { id: "a-journal", groupe: "Actions rapides", label: "Journal d'audit", icon: <ScrollText size={16} />, to: "/Dashbord-admin/journal", motsCles: "historique logs activite" },
  { id: "a-parametres", groupe: "Actions rapides", label: "Paramètres", icon: <Settings size={16} />, to: "/Dashbord-admin/parametres", motsCles: "configuration maintenance annonce reseaux" },
  { id: "a-site", groupe: "Actions rapides", label: "Voir le site", detail: "Nouvel onglet", icon: <ExternalLink size={16} />, to: "/", externe: true, motsCles: "public accueil" },
];

function normaliser(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function initiales(prenom?: string, nom?: string): string {
  return `${prenom?.[0] ?? ""}${nom?.[0] ?? ""}`.toUpperCase() || "?";
}

function commandesDepuisResultats(r: RechercheResultats): Commande[] {
  return [
    ...r.utilisateurs.map<Commande>((u) => {
      const avatar = resolveImageUrl(u.avatar_url || u.avatar);
      return {
        id: `u-${u.id}`,
        groupe: "Utilisateurs",
        label: `${u.prenom} ${u.nom}`.trim() || u.email,
        detail: `${u.email} · ${ROLE_LABELS[u.role] ?? u.role}`,
        icon: avatar ? (
          <img src={avatar} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
        ) : (
          <span className="text-[10px] font-semibold">{initiales(u.prenom, u.nom)}</span>
        ),
        to: `/Dashbord-admin/utilisateurs?search=${encodeURIComponent(u.email)}`,
      };
    }),
    ...r.exercices.map<Commande>((e) => ({
      id: `e-${e.id}`,
      groupe: "Exercices",
      label: e.titre,
      detail: e.est_actif ? undefined : "Désactivé",
      icon: <BookOpen size={16} />,
      to: `/Dashbord-admin/exercices/${e.id}/modifier`,
    })),
    ...r.sujets.map<Commande>((s) => ({
      id: `s-${s.id}`,
      groupe: "Sujets",
      label: s.titre,
      icon: <ClipboardList size={16} />,
      to: `/Dashbord-admin/sujets/${s.id}/modifier`,
    })),
    ...r.pages.map<Commande>((p) => ({
      id: `p-${p.id}`,
      groupe: "Pages",
      label: p.titre,
      detail: `/${p.slug} · ${p.statut === "publie" ? "Publiée" : "Brouillon"}`,
      icon: <FileText size={16} />,
      to: `/page-builder/${p.id}`,
    })),
  ];
}

export default function CommandPalette({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const uid = useId();
  const listboxId = `${uid}-listbox`;
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [reponse, setReponse] = useState<{ q: string; data?: RechercheResultats; erreur?: boolean } | null>(null);

  const terme = query.trim();
  const rechercheActive = terme.length >= 2;

  /* ── Recherche serveur avec debounce 250 ms + annulation ── */
  useEffect(() => {
    if (!rechercheActive) return;
    const controleur = new AbortController();
    const t = setTimeout(() => {
      rechercheGlobale(terme, controleur.signal)
        .then((data) => setReponse({ q: terme, data }))
        .catch((err: unknown) => {
          if ((err as { name?: string })?.name === "CanceledError" || controleur.signal.aborted) return;
          setReponse({ q: terme, erreur: true });
        });
    }, 250);
    return () => {
      clearTimeout(t);
      controleur.abort();
    };
  }, [terme, rechercheActive]);

  /* ── Restaure le focus à la fermeture + bloque le scroll de fond ── */
  useEffect(() => {
    const precedent = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      precedent?.focus?.();
    };
  }, []);

  const chargement = rechercheActive && reponse?.q !== terme;
  const erreur = rechercheActive && reponse?.q === terme && !!reponse.erreur;

  const commandes = useMemo<Commande[]>(() => {
    const n = normaliser(terme);
    const actions = n
      ? ACTIONS_RAPIDES.filter((a) => normaliser(`${a.label} ${a.motsCles ?? ""}`).includes(n))
      : ACTIONS_RAPIDES;
    const resultats = rechercheActive && reponse?.data ? commandesDepuisResultats(reponse.data) : [];
    return [...resultats, ...actions];
  }, [terme, rechercheActive, reponse]);

  const groupes = useMemo(() => {
    const map = new Map<string, Array<{ cmd: Commande; index: number }>>();
    commandes.forEach((cmd, index) => {
      if (!map.has(cmd.groupe)) map.set(cmd.groupe, []);
      map.get(cmd.groupe)!.push({ cmd, index });
    });
    return Array.from(map.entries());
  }, [commandes]);

  const indexCourant = commandes.length === 0 ? -1 : Math.min(activeIndex, commandes.length - 1);
  const optionId = (i: number) => `${uid}-option-${i}`;

  useEffect(() => {
    if (indexCourant < 0) return;
    document.getElementById(`${uid}-option-${indexCourant}`)?.scrollIntoView({ block: "nearest" });
  }, [indexCourant, uid]);

  function executer(cmd: Commande) {
    onClose();
    if (cmd.externe) {
      window.open(cmd.to, "_blank", "noopener,noreferrer");
    } else {
      navigate(cmd.to);
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (commandes.length) setActiveIndex((indexCourant + 1) % commandes.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        if (commandes.length) setActiveIndex((indexCourant - 1 + commandes.length) % commandes.length);
        break;
      case "Home":
        if (commandes.length && e.ctrlKey) {
          e.preventDefault();
          setActiveIndex(0);
        }
        break;
      case "End":
        if (commandes.length && e.ctrlKey) {
          e.preventDefault();
          setActiveIndex(commandes.length - 1);
        }
        break;
      case "Enter":
        if (indexCourant >= 0) {
          e.preventDefault();
          executer(commandes[indexCourant]);
        }
        break;
      case "Escape":
        e.preventDefault();
        e.stopPropagation();
        onClose();
        break;
      case "Tab":
        // Piège de focus : le focus reste dans le champ de recherche
        e.preventDefault();
        inputRef.current?.focus();
        break;
    }
  }

  const aucunResultat = rechercheActive && !chargement && !erreur && commandes.length === 0;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center bg-black/40 backdrop-blur-[2px] px-3 pt-[10vh] sm:pt-[14vh]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Recherche globale et commandes"
        onKeyDown={onKeyDown}
        className="tely-card tely-animate w-full max-w-xl overflow-hidden flex flex-col max-h-[75vh]"
        style={{ animationDuration: "0.18s" }}
      >
        {/* Champ de recherche */}
        <div className="flex items-center gap-3 px-4 border-b border-gray-100">
          {chargement ? (
            <Loader2 size={18} className="text-gray-400 shrink-0 animate-spin" aria-hidden="true" />
          ) : (
            <Search size={18} className="text-gray-900 shrink-0" aria-hidden="true" />
          )}
          <input
            ref={inputRef}
            autoFocus
            type="text"
            role="combobox"
            aria-expanded={commandes.length > 0}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={indexCourant >= 0 ? optionId(indexCourant) : undefined}
            aria-label="Rechercher un utilisateur, un exercice, un sujet, une page ou une action"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            placeholder="Rechercher utilisateurs, exercices, sujets, pages…"
            className="flex-1 min-w-0 bg-transparent py-4 text-sm text-gray-900 outline-none placeholder:text-gray-400"
            spellCheck={false}
            autoComplete="off"
          />
          <button type="button" onClick={onClose} className="tely-icon-btn shrink-0" aria-label="Fermer la recherche">
            <X size={16} />
          </button>
        </div>

        {/* Résultats */}
        <div className="flex-1 overflow-y-auto p-2">
          <p className="sr-only" aria-live="polite">
            {chargement
              ? "Recherche en cours"
              : erreur
              ? "La recherche a échoué"
              : rechercheActive
              ? `${commandes.length} résultat(s)`
              : ""}
          </p>

          {terme.length === 1 && (
            <p className="px-3 py-2 text-xs text-gray-400">Saisissez au moins 2 caractères pour rechercher dans les contenus.</p>
          )}

          {erreur && (
            <p className="mx-1 my-1 rounded-[10px] bg-red-50 px-3 py-2.5 text-xs text-red-700" role="alert">
              La recherche est momentanément indisponible. Les actions rapides restent accessibles.
            </p>
          )}

          {chargement && !reponse?.data && (
            <div className="flex flex-col gap-1.5 p-1" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-11 rounded-[10px] bg-gray-50 animate-pulse" />
              ))}
            </div>
          )}

          {aucunResultat ? (
            <div className="px-3 py-10 text-center">
              <p className="tely-title text-base">Aucun résultat pour « {terme} »</p>
              <p className="tely-subtitle mt-1">Essayez un nom, une adresse e-mail ou un titre.</p>
            </div>
          ) : (
            <div id={listboxId} role="listbox" aria-label="Résultats" className={chargement ? "opacity-70" : ""}>
              {groupes.map(([groupe, items]) => {
                const titreId = `${uid}-groupe-${normaliser(groupe).replace(/[^a-z]/g, "")}`;
                return (
                  <div key={groupe} role="group" aria-labelledby={titreId} className="mb-1.5">
                    <p id={titreId} className="tely-overline px-3 pt-2 pb-1">
                      {groupe}
                    </p>
                    {items.map(({ cmd, index }) => {
                      const actif = index === indexCourant;
                      const estUtilisateur = cmd.groupe === "Utilisateurs";
                      return (
                        <div
                          key={cmd.id}
                          id={optionId(index)}
                          role="option"
                          aria-selected={actif}
                          onMouseMove={() => {
                            if (!actif) setActiveIndex(index);
                          }}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => executer(cmd)}
                          className={`flex items-center gap-3 rounded-[10px] px-3 py-2.5 cursor-pointer select-none ${
                            actif ? "bg-gray-900 text-white" : "text-gray-900"
                          }`}
                        >
                          <span
                            className={`w-8 h-8 shrink-0 flex items-center justify-center overflow-hidden ${
                              estUtilisateur ? "rounded-full" : "rounded-[8px]"
                            } ${actif ? "bg-white/15 text-white" : estUtilisateur ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}
                          >
                            {cmd.icon}
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className="block text-sm font-semibold truncate">{cmd.label}</span>
                            {cmd.detail && (
                              <span className={`block text-xs truncate ${actif ? "text-gray-300" : "text-gray-400"}`}>
                                {cmd.detail}
                              </span>
                            )}
                          </span>
                          {actif && <CornerDownLeft size={14} className="shrink-0 opacity-70" aria-hidden="true" />}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pied : aide clavier */}
        <div className="hidden sm:flex items-center gap-4 border-t border-gray-100 px-4 py-2.5 text-[11px] text-gray-400" aria-hidden="true">
          <span className="flex items-center gap-1">
            <kbd className="inline-flex items-center rounded border border-gray-200 bg-gray-50 px-1 py-0.5"><ArrowUp size={10} /></kbd>
            <kbd className="inline-flex items-center rounded border border-gray-200 bg-gray-50 px-1 py-0.5"><ArrowDown size={10} /></kbd>
            naviguer
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 font-sans">Entrée</kbd> ouvrir
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 font-sans">Échap</kbd> fermer
          </span>
        </div>
      </div>
    </div>
  );
}

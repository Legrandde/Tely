import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  CheckCircle2,
  Heart,
  Flame,
  ArrowRight,
  Compass,
  Sparkles,
  RefreshCw,
  Settings2,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "../../context/authContext";
import { getTableauDeBord, messageErreur } from "../../services/eleveService";
import type { TableauDeBordEleve } from "../../types/eleve";
import ActiviteChart from "../../components/eleve/ActiviteChart";
import ExerciceMiniCard, { ExerciceMiniCardSkeleton } from "../../components/eleve/ExerciceMiniCard";
import OnboardingModal from "../../components/eleve/OnboardingModal";
import { tempsRelatif } from "../../components/eleve/dates";

const CLE_PLUS_TARD = "tely_onboarding_plus_tard";

function onboardingRepousse(userId?: number): boolean {
  try {
    return sessionStorage.getItem(CLE_PLUS_TARD) === String(userId);
  } catch {
    return false;
  }
}

function salutation(prenom?: string) {
  const h = new Date().getHours();
  const mot = h < 5 || h >= 18 ? "Bonsoir" : "Bonjour";
  return prenom ? `${mot}, ${prenom} 👋` : `${mot} 👋`;
}

function messageSerie(serie: number) {
  if (serie <= 0) return "Révisez aujourd'hui pour lancer votre série !";
  if (serie === 1) return "Belle reprise ! Revenez demain pour faire grimper votre série.";
  if (serie < 7) return `${serie} jours d'affilée, continuez sur cette lancée !`;
  return `${serie} jours d'affilée, impressionnant 🔥`;
}

// ── Sous-composants ──────────────────────────────────────────────────────

interface TuileStatProps {
  icone: LucideIcon;
  label: string;
  valeur: number;
  suffixe?: string;
  accent?: boolean;
}

function TuileStat({ icone: Icone, label, valeur, suffixe, accent }: TuileStatProps) {
  return (
    <div className={`tely-card tely-animate p-4 sm:p-5 min-w-0 ${accent ? "ring-1 ring-amber-200" : ""}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="tely-label truncate">{label}</p>
        <span
          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            accent ? "bg-amber-50 text-amber-500" : "bg-gray-50 text-gray-900"
          }`}
          aria-hidden="true"
        >
          <Icone size={16} />
        </span>
      </div>
      <p className="tely-title text-3xl mt-2">
        {valeur.toLocaleString("fr-FR")}
        {suffixe && <span className="text-sm font-semibold text-gray-400 ml-1">{suffixe}</span>}
      </p>
    </div>
  );
}

function TuileStatSkeleton() {
  return (
    <div className="tely-card p-4 sm:p-5 animate-pulse" aria-hidden="true">
      <div className="flex justify-between">
        <div className="h-3 w-24 bg-gray-100 rounded" />
        <div className="w-8 h-8 bg-gray-100 rounded-lg" />
      </div>
      <div className="h-8 w-14 bg-gray-200 rounded mt-3" />
    </div>
  );
}

function EnTeteSection({ titre, sousTitre, lien }: { titre: string; sousTitre?: string; lien?: { to: string; label: string } }) {
  return (
    <div className="flex items-end justify-between gap-3 mb-4">
      <div className="min-w-0">
        <h2 className="tely-title text-lg">{titre}</h2>
        {sousTitre && <p className="tely-subtitle mt-0.5">{sousTitre}</p>}
      </div>
      {lien && (
        <Link to={lien.to} className="text-sm font-semibold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1 shrink-0">
          {lien.label} <ArrowRight size={14} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────

export default function EleveDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<TableauDeBordEleve | null>(null);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const [onboardingFerme, setOnboardingFerme] = useState(() => onboardingRepousse(user?.id));

  useEffect(() => {
    let annule = false;
    getTableauDeBord()
      .then((res) => {
        if (annule) return;
        setData(res);
        setErreur(null);
      })
      .catch((err) => {
        if (!annule) setErreur(messageErreur(err, "Impossible de charger votre tableau de bord."));
      })
      .finally(() => {
        if (!annule) setLoading(false);
      });
    return () => {
      annule = true;
    };
  }, [version]);

  const recharger = useCallback(() => {
    setLoading(true);
    setVersion((v) => v + 1);
  }, []);

  const userId = user?.id;
  const repousserOnboarding = useCallback(() => {
    try {
      sessionStorage.setItem(CLE_PLUS_TARD, String(userId));
    } catch {
      // stockage indisponible : la modale reste simplement fermée pour cette page
    }
    setOnboardingFerme(true);
  }, [userId]);

  const terminerOnboarding = useCallback(() => {
    setOnboardingFerme(true);
    recharger();
  }, [recharger]);

  const afficherOnboarding = !!data && !data.onboarding_fait && !onboardingFerme;

  const stats = data?.stats;
  const estNouveau =
    !!data && data.stats.exercices_consultes === 0 && data.stats.corrections_vues === 0 && data.recents.length === 0;
  const maxMatiere = Math.max(1, ...(data?.matieres.map((m) => m.total) ?? [1]));
  const niveau = data?.eleve.niveau?.libelle ?? user?.eleve?.niveau?.libelle;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-8">
      {/* ── Salutation ── */}
      <section className="tely-card tely-animate p-5 sm:p-7 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-dots opacity-70 pointer-events-none" aria-hidden="true" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="tely-h1 text-2xl sm:text-[28px]">{salutation(user?.prenom)}</h1>
            <p className="text-sm text-gray-500 mt-1.5">
              {loading && !data ? (
                <span className="inline-block h-4 w-64 max-w-full bg-gray-100 rounded animate-pulse align-middle" />
              ) : stats ? (
                messageSerie(stats.serie_jours)
              ) : (
                "Prêt(e) pour une nouvelle séance de révision ?"
              )}
            </p>
            {niveau && <span className="tely-chip mt-3">Niveau : {niveau}</span>}
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            {data && !data.onboarding_fait && onboardingFerme && (
              <button type="button" onClick={() => setOnboardingFerme(false)} className="tely-btn-outline">
                <Settings2 size={16} aria-hidden="true" /> Personnaliser
              </button>
            )}
            <Link to="/exercices" className="tely-btn">
              <Compass size={16} aria-hidden="true" /> Explorer les exercices
            </Link>
          </div>
        </div>
      </section>

      {erreur && !data ? (
        <section className="tely-card p-8 text-center" role="alert">
          <p className="text-sm text-gray-600">{erreur}</p>
          <button type="button" onClick={recharger} className="tely-btn-outline mt-4">
            <RefreshCw size={16} aria-hidden="true" /> Réessayer
          </button>
        </section>
      ) : (
        <>
          {/* ── Statistiques ── */}
          <section aria-label="Mes statistiques" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {!stats ? (
              Array.from({ length: 4 }).map((_, i) => <TuileStatSkeleton key={i} />)
            ) : (
              <>
                <TuileStat icone={BookOpen} label="Exercices consultés" valeur={stats.exercices_consultes} />
                <TuileStat icone={CheckCircle2} label="Corrigés vus" valeur={stats.corrections_vues} />
                <TuileStat icone={Heart} label="Favoris" valeur={stats.favoris} />
                <TuileStat
                  icone={Flame}
                  label="Série en cours 🔥"
                  valeur={stats.serie_jours}
                  suffixe={stats.serie_jours > 1 ? "jours" : "jour"}
                  accent
                />
              </>
            )}
          </section>

          {/* ── Nouvel élève : état vide engageant ── */}
          {estNouveau && (
            <section className="rounded-lg bg-gray-900 text-white p-6 sm:p-8 relative overflow-hidden tely-animate">
              <div className="absolute inset-0 bg-grid-pattern-dark pointer-events-none" aria-hidden="true" />
              <div className="relative flex flex-col sm:flex-row sm:items-center gap-5 justify-between">
                <div className="max-w-lg">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 uppercase tracking-wide">
                    <Sparkles size={14} aria-hidden="true" /> Premier pas
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold mt-2 leading-tight">
                    Votre espace est prêt. Lancez votre premier exercice !
                  </h2>
                  <p className="text-sm text-gray-300 mt-2">
                    Chaque exercice consulté et chaque corrigé vu nourrit votre progression, vos statistiques et votre série de jours.
                  </p>
                </div>
                <Link
                  to="/exercices"
                  className="inline-flex items-center justify-center gap-2 rounded-[10px] px-5 py-3.5 text-sm font-semibold bg-amber-500 text-gray-900 hover:bg-amber-400 transition-colors shrink-0"
                >
                  Commencer maintenant <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </section>
          )}

          {/* ── Activité + matières ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <section className="tely-card p-5 sm:p-6 lg:col-span-2 min-w-0">
              <EnTeteSection titre="Mon activité" sousTitre="Exercices consultés et corrigés vus, 14 derniers jours" />
              {!data ? (
                <div className="h-48 sm:h-56 bg-gray-50 rounded-lg animate-pulse" aria-hidden="true" />
              ) : (
                <ActiviteChart data={data.activite} />
              )}
            </section>

            <section className="tely-card p-5 sm:p-6 min-w-0">
              <EnTeteSection titre="Matières travaillées" />
              {!data ? (
                <div className="space-y-4 animate-pulse" aria-hidden="true">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i}>
                      <div className="h-3 w-24 bg-gray-100 rounded mb-2" />
                      <div className="h-2 w-full bg-gray-100 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : data.matieres.length === 0 ? (
                <div className="text-center py-6">
                  <BookOpen size={26} className="mx-auto text-amber-500 mb-2" aria-hidden="true" />
                  <p className="text-sm text-gray-500">Vos matières apparaîtront ici dès votre premier exercice.</p>
                </div>
              ) : (
                <ul className="space-y-3.5">
                  {data.matieres.map((m) => (
                    <li key={m.id}>
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <Link to={`/exercices?matiere_id=${m.id}`} className="font-medium text-gray-800 truncate hover:underline">
                          {m.nom}
                        </Link>
                        <span className="text-xs text-gray-400 shrink-0 ml-2">{m.total}</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 overflow-hidden" aria-hidden="true">
                        <div className="h-full rounded-full bg-amber-500" style={{ width: `${(m.total / maxMatiere) * 100}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* ── Reprendre ── */}
          {(!data || data.recents.length > 0) && (
            <section>
              <EnTeteSection
                titre="Reprendre où vous en étiez"
                lien={{ to: "/espace/historique", label: "Tout l'historique" }}
              />
              <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {!data
                  ? Array.from({ length: 3 }).map((_, i) => <ExerciceMiniCardSkeleton key={i} />)
                  : data.recents.slice(0, 6).map((r) =>
                      r.exercice ? (
                        <ExerciceMiniCard
                          key={r.id}
                          exercice={r.exercice}
                          meta={`${r.action === "correction_vue" ? "Corrigé vu" : "Consulté"} ${tempsRelatif(r.date_consultation)}`}
                        />
                      ) : null
                    )}
              </div>
            </section>
          )}

          {/* ── Recommandations ── */}
          <section>
            <EnTeteSection
              titre="Recommandés pour vous"
              sousTitre={niveau ? `Sélectionnés pour votre niveau (${niveau}) et vos matières` : "Sélectionnés selon vos préférences"}
              lien={{ to: "/exercices", label: "Voir tout" }}
            />
            {!data ? (
              <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <ExerciceMiniCardSkeleton key={i} />
                ))}
              </div>
            ) : data.recommandations.length === 0 ? (
              <div className="tely-card p-6 text-center">
                <p className="text-sm text-gray-500">
                  Vous avez déjà parcouru tous nos exercices récents, bravo ! De nouveaux contenus arrivent régulièrement.
                </p>
                <Link to="/sujets" className="tely-btn-outline mt-4">
                  Voir les sujets d'examen
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {data.recommandations.map((ex) => (
                  <ExerciceMiniCard key={ex.id} exercice={ex} />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {afficherOnboarding && (
        <OnboardingModal
          open
          eleve={data?.eleve}
          onPlusTard={repousserOnboarding}
          onTermine={terminerOnboarding}
        />
      )}
    </div>
  );
}

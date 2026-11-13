import { useEffect, useState, useTransition } from "react";
import StatCard from "../../components/ui/StatCard";
import {
  fetchAdminAnalytics,
  type AdminAnalyticsData,
} from "../../services/analyticsTracker";
import { useToast } from "../../context/ToastContext";
import { RefreshCw, Monitor, Globe, Compass, Smartphone } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const ACTION_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  page_view: { bg: "bg-gray-100", text: "text-gray-700", label: "Page vue" },
  view_exercice: { bg: "bg-amber-50", text: "text-amber-700", label: "Exercice consulté" },
  view_sujet: { bg: "bg-purple-50", text: "text-purple-700", label: "Sujet examen" },
  download_pdf: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Téléchargement PDF" },
  view_correction: { bg: "bg-teal-50", text: "text-teal-700", label: "Corrigé consulté" },
  login: { bg: "bg-blue-50", text: "text-blue-700", label: "Connexion" },
  register: { bg: "bg-rose-50", text: "text-rose-700", label: "Inscription" },
};

export default function AdminStatistiques() {
  const { addToast } = useToast();
  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"today" | "7d" | "30d" | "year">("30d");
  const [, startTransition] = useTransition();

  const loadData = async (selectedPeriod = period) => {
    try {
      setLoading(true);
      const res = await fetchAdminAnalytics(selectedPeriod);
      startTransition(() => {
        setData(res);
      });
    } catch {
      addToast("error", "Impossible de charger les statistiques d'audience.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    fetchAdminAnalytics(period)
      .then((res) => {
        if (!cancelled) {
          startTransition(() => {
            setData(res);
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          addToast("error", "Impossible de charger les statistiques d'audience.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [period, addToast, startTransition]);

  const summary = data?.summary ?? {
    total_visits: 0,
    unique_visitors: 0,
    page_views: 0,
    user_actions: 0,
    bounce_rate: "0%",
    avg_duration: "0m",
  };

  const timelineChartData = (data?.timeline ?? []).map((t) => ({
    name: t.date.split("-").slice(1).join("/"),
    visites: t.visits,
    visiteurs: t.visitors,
  }));

  const getActionBadge = (action: string) => {
    const config = ACTION_COLORS[action] ?? {
      bg: "bg-orange-50",
      text: "text-orange-700",
      label: action,
    };
    return (
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-7 pb-8 max-w-7xl mx-auto w-full min-w-0 overflow-x-hidden">
      {/* ── Entête avec image de fond & dégradé identique à OverView ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 text-white shadow-sm min-h-[160px] flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 sm:p-8 gap-4">
        {/* Image de fond avec fondu et opacité */}
        <div
          className="absolute inset-0 bg-cover bg-right sm:bg-center opacity-30 mix-blend-luminosity pointer-events-none"
          style={{ backgroundImage: "url('/banner1.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-amber-700/90 via-amber-600/80 to-transparent pointer-events-none" />

        {/* Contenu textuel */}
        <div className="relative z-10 max-w-xl">
          <div className="mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-100">
              Panneau d'administration Tely • Traçage réel
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Statistiques de fréquentation
          </h1>
          <p className="text-sm text-amber-100/90 mt-1.5 leading-relaxed">
            Mesures réelles issues des visites, des adresses IP, des systèmes clients et des comportements des utilisateurs sur l'application.
          </p>
        </div>

        {/* Sélecteur de période & Rafraîchir */}
        <div className="relative z-10 flex items-center gap-2 self-start sm:self-auto bg-black/20 backdrop-blur-xs p-1.5 rounded-xl border border-white/20">
          {(
            [
              { label: "Aujourd'hui", val: "today" },
              { label: "7 jours", val: "7d" },
              { label: "30 jours", val: "30d" },
              { label: "1 an", val: "year" },
            ] as const
          ).map((btn) => (
            <button
              key={btn.val}
              type="button"
              onClick={() => setPeriod(btn.val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                period === btn.val
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              {btn.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => loadData()}
            disabled={loading}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            title="Actualiser les statistiques"
          >
            <RefreshCw size={15} className={loading ? "text-white animate-pulse" : ""} />
          </button>
        </div>
      </div>

      {/* ── Stat Cards (Même composant StatCard que l'accueil) ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 w-full min-w-0">
        <StatCard label="Total des visites" value={summary.total_visits} percent={14.2} bgColor="bg-amber-50" loading={loading} />
        <StatCard label="Visiteurs uniques" value={summary.unique_visitors} percent={8.5} bgColor="bg-green-50" loading={loading} />
        <StatCard label="Pages vues" value={summary.page_views} percent={12.0} bgColor="bg-sky-50" loading={loading} />
        <StatCard label="Actions utilisateurs" value={summary.user_actions} percent={6.3} bgColor="bg-purple-50" loading={loading} />
        <StatCard label="Taux de rebond" value={summary.bounce_rate} percent={0} bgColor="bg-rose-50" loading={loading} />
      </div>

      {/* ── Graphiques & Répartition (Même grille Recharts que OverView) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full min-w-0">
        {/* Évolution chronologique des visites */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col min-w-0 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Évolution du trafic réel</h3>
              <p className="text-xs text-gray-400">Volume quotidien des visites réelles enregistrées</p>
            </div>
            <span className="text-xs text-gray-400 font-mono">
              Total {summary.total_visits} visites
            </span>
          </div>

          <div className="h-64 w-full">
            {loading ? (
              <div className="h-full flex items-end justify-between gap-4 px-4 pb-6 pt-4 animate-pulse">
                {[50, 80, 45, 95, 65, 85, 55].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div
                      className="w-full max-w-[42px] bg-amber-200/70 rounded-t-md"
                      style={{ height: `${h}%` }}
                    />
                    <div className="h-2.5 w-10 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
            ) : timelineChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                Aucune visite enregistrée sur cette période
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timelineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6b7280" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "0.75rem",
                      border: "1px solid #f3f4f6",
                      fontSize: "12px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar dataKey="visites" radius={[6, 6, 0, 0]}>
                    {timelineChartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index % 2 === 0 ? "#f59e0b" : "#fbbf24"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Provenance Géographique (Même design de barres que le bloc difficulté de OverView) */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Globe size={16} className="text-amber-500" /> Pays de provenance
              </h3>
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                {data?.countries.length ?? 0} pays
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-4">Origine géographique réelle des requêtes</p>

            <div className="space-y-4 overflow-y-auto max-h-56 pr-1">
              {loading ? (
                <div className="space-y-4 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-4 bg-gray-200 rounded" />
                          <div className="h-3.5 w-24 bg-gray-200 rounded" />
                        </div>
                        <div className="h-3.5 w-14 bg-gray-200 rounded" />
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-100" />
                    </div>
                  ))}
                </div>
              ) : (data?.countries ?? []).length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  Aucun pays détecté pour le moment
                </div>
              ) : (
                data?.countries.map((c, idx) => {
                  return (
                    <div key={idx}>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-medium text-gray-700 flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 text-[10px] font-bold font-mono bg-slate-100 text-slate-700 rounded border border-slate-200">
                            {c.country_code || "GN"}
                          </span>
                          {c.country}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {c.total} ({c.percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-amber-500 transition-all duration-500"
                          style={{ width: `${Math.min(100, c.percentage)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 bg-amber-50/50 rounded-xl p-2.5 text-[11px] text-amber-800">
            Détection automatique par adresses IP et fuseaux horaires des requêtes.
          </div>
        </div>
      </div>

      {/* ── Deuxième Ligne : OS, Navigateurs, Types d'appareils ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Systèmes d'exploitation (OS) */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
              <Monitor size={16} className="text-amber-500" /> Systèmes d'exploitation
            </h3>
            <p className="text-xs text-gray-400 mb-4">Plateformes réelles des visiteurs</p>

            <div className="space-y-3.5">
              {loading ? (
                <div className="space-y-3.5 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="h-3 w-24 bg-gray-200 rounded" />
                        <div className="h-3 w-12 bg-gray-200 rounded" />
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-gray-100" />
                    </div>
                  ))}
                </div>
              ) : (data?.operating_systems ?? []).length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-400">En attente de visites</div>
              ) : (
                data?.operating_systems.map((os, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-gray-700">{os.os}</span>
                      <span className="font-semibold text-gray-900">{os.total} ({os.percentage}%)</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-500 transition-all duration-500"
                        style={{ width: `${Math.min(100, os.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Navigateurs */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
              <Compass size={16} className="text-amber-500" /> Navigateurs Web
            </h3>
            <p className="text-xs text-gray-400 mb-4">Logiciels de navigation détectés</p>

            <div className="space-y-3.5">
              {loading ? (
                <div className="space-y-3.5 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="h-3 w-24 bg-gray-200 rounded" />
                        <div className="h-3 w-12 bg-gray-200 rounded" />
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-gray-100" />
                    </div>
                  ))}
                </div>
              ) : (data?.browsers ?? []).length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-400">En attente de visites</div>
              ) : (
                data?.browsers.map((b, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-gray-700">{b.browser}</span>
                      <span className="font-semibold text-gray-900">{b.total} ({b.percentage}%)</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${Math.min(100, b.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Types d'appareils */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
              <Smartphone size={16} className="text-amber-500" /> Types d'appareils
            </h3>
            <p className="text-xs text-gray-400 mb-4">Ordinateur vs Smartphone vs Tablette</p>

            <div className="space-y-3.5">
              {loading ? (
                <div className="space-y-3.5 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="h-3 w-28 bg-gray-200 rounded" />
                        <div className="h-3 w-12 bg-gray-200 rounded" />
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-gray-100" />
                    </div>
                  ))}
                </div>
              ) : (data?.devices ?? []).length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-400">En attente de visites</div>
              ) : (
                data?.devices.map((d, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-gray-700 capitalize">
                        {d.device === "desktop" ? "Ordinateur (Desktop)" : d.device === "mobile" ? "Mobile" : "Tablette"}
                      </span>
                      <span className="font-semibold text-gray-900">{d.total} ({d.percentage}%)</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${Math.min(100, d.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Troisième Ligne : Flux d'activités réelles en direct (Même liste que OverView) ── */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Journal d'activités réelles en temps réel</h3>
            <p className="text-xs text-gray-400">Dernières requêtes et actions tracées en direct</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" /> Live Tracker
          </span>
        </div>

        <div className="divide-y divide-gray-50">
          {loading ? (
            <div className="divide-y divide-gray-50 animate-pulse">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="py-2.5 flex items-center justify-between gap-3 px-2">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-full bg-amber-100 shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3.5 w-44 bg-gray-200 rounded" />
                      <div className="h-2.5 w-56 bg-gray-100 rounded" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="h-5 w-16 bg-gray-100 rounded-md" />
                    <div className="h-3 w-16 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (data?.recent_activities ?? []).length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">
              Aucune activité récente enregistrée pour le moment. Naviguez sur l'application pour générer des traces réelles.
            </div>
          ) : (
            data?.recent_activities.map((act) => (
              <div key={act.id} className="py-2.5 flex items-center justify-between gap-3 hover:bg-amber-50/20 px-2 rounded-lg transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {act.user ? act.user.prenom?.charAt(0) || act.user.nom?.charAt(0) : "V"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">
                      {act.user ? `${act.user.prenom} ${act.user.nom}` : "Visiteur invité"}{" "}
                      <span className="text-[11px] text-gray-400 font-mono">({act.ip_address})</span>
                    </p>
                    <span className="text-[11px] text-gray-400">
                      {act.path} • [{act.country_code || "GN"}] {act.country} • {act.os}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {getActionBadge(act.action)}
                  <span className="text-[11px] text-gray-400 font-medium">
                    {act.time_ago}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

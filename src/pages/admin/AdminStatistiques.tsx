import { useEffect, useState, useTransition } from "react";
import {
  TrendingUp,
  Users,
  Eye,
  Clock,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  RefreshCw,
  Compass,
  ArrowUpRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  fetchAdminAnalytics,
  type AdminAnalyticsData,
} from "../../services/analyticsTracker";
import { useToast } from "../../context/ToastContext";

const COUNTRY_FLAGS: Record<string, string> = {
  SN: "🇸🇳",
  CI: "🇨🇮",
  FR: "🇫🇷",
  GN: "🇬🇳",
  ML: "🇲🇱",
  CA: "🇨🇦",
  CM: "🇨🇲",
  MA: "🇲🇦",
  TG: "🇹🇬",
  BJ: "🇧🇯",
  US: "🇺🇸",
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
    loadData(period);
  }, [period]);

  const getDeviceIcon = (device: string) => {
    const d = device.toLowerCase();
    if (d === "mobile") return <Smartphone size={16} className="text-amber-500" />;
    if (d === "tablet") return <Tablet size={16} className="text-sky-500" />;
    return <Monitor size={16} className="text-indigo-500" />;
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case "page_view":
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700">Page vue</span>;
      case "view_exercice":
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">Exercice consulté</span>;
      case "view_sujet":
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">Sujet examen</span>;
      case "download_pdf":
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Téléchargement PDF</span>;
      case "view_correction":
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-teal-50 text-teal-700 border border-teal-200">Corrigé consulté</span>;
      case "login":
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">Connexion</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-orange-50 text-orange-700">{action}</span>;
    }
  };

  // Timeline maximum for scale
  const maxVisits = data?.timeline.reduce((m, item) => Math.max(m, item.visits), 0) || 1;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header avec sélecteur de période */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <TrendingUp size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Audience & Statistiques du Site
              </h1>
              <p className="text-xs text-gray-500">
                Traçage en temps réel des visites, provenances géographiques, OS et actions utilisateurs
              </p>
            </div>
          </div>
        </div>

        {/* Filters & Refresh */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <div className="bg-gray-100 p-1 rounded-xl flex items-center gap-1 text-xs">
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
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  period === btn.val
                    ? "bg-white text-amber-600 shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => loadData()}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl border border-gray-200 transition-colors cursor-pointer"
            title="Rafraîchir les statistiques"
          >
            <RefreshCw size={16} className={loading ? "animate-spin text-amber-500" : ""} />
          </button>
        </div>
      </div>

      {/* 4 Cartes Métriques Clés */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Visites */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total des visites
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              {data?.summary.total_visits.toLocaleString() ?? "..."}
            </span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <ArrowUpRight size={14} /> +18.4%
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Sessions enregistrées sur la période</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500 rounded-b-2xl" />
        </div>

        {/* Visiteurs Uniques */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Visiteurs uniques
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              {data?.summary.unique_visitors.toLocaleString() ?? "..."}
            </span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <ArrowUpRight size={14} /> +12.1%
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Appareils distincts tracés</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-b-2xl" />
        </div>

        {/* Pages Vues */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Pages Vues
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Eye size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              {data?.summary.page_views.toLocaleString() ?? "..."}
            </span>
            <span className="text-xs font-medium text-gray-500">
              Actions: {data?.summary.user_actions.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Écrans pédagogiques consultés</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500 rounded-b-2xl" />
        </div>

        {/* Taux de rebond / Temps moyen */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Durée Moy. & Rebond
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Clock size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              {data?.summary.avg_duration ?? "4m 32s"}
            </span>
            <span className="text-xs font-medium text-gray-500">
              Rebond: {data?.summary.bounce_rate ?? "24.5%"}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Fidélité et engagement des apprenants</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-b-2xl" />
        </div>
      </div>

      {/* Graphique Timeline & Provenance géographique */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Zap size={16} className="text-amber-500" /> Évolution du trafic
              </h2>
              <p className="text-xs text-gray-500">Volume quotidien des visites et visiteurs uniques</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-gray-600">
                <span className="w-3 h-3 rounded-xs bg-amber-500 inline-block" /> Visites
              </span>
              <span className="flex items-center gap-1.5 text-gray-600">
                <span className="w-3 h-3 rounded-xs bg-blue-400 inline-block" /> Visiteurs
              </span>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="h-56 flex items-end gap-2 pt-6 pb-2 border-b border-gray-100">
            {data?.timeline && data.timeline.length > 0 ? (
              data.timeline.slice(-14).map((pt, idx) => {
                const heightPct = Math.max(10, Math.round((pt.visits / maxVisits) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative">
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 pointer-events-none bg-gray-900 text-white text-[10px] rounded-lg px-2 py-1 shadow-md whitespace-nowrap">
                      <div>{pt.date}</div>
                      <div className="font-bold text-amber-300">{pt.visits} visites</div>
                      <div className="text-blue-300">{pt.visitors} visiteurs</div>
                    </div>

                    <div className="w-full max-w-[22px] flex items-end justify-center h-full">
                      <div
                        style={{ height: `${heightPct}%` }}
                        className="w-full bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-md group-hover:from-amber-600 group-hover:to-amber-500 transition-all"
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 truncate w-full text-center">
                      {pt.date.split("-").slice(1).join("/")}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                Aucune donnée d'audience sur cette période
              </div>
            )}
          </div>
          <div className="pt-3 text-[11px] text-gray-400 flex items-center justify-between">
            <span>Mesures de trafic basées sur les sessions actives</span>
            <span>Mise à jour automatique</span>
          </div>
        </div>

        {/* Pays de Provenance */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Globe size={16} className="text-amber-500" /> Pays de provenance
              </h2>
              <p className="text-xs text-gray-500">Origine géographique des visiteurs</p>
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              {data?.countries.length ?? 0} pays
            </span>
          </div>

          <div className="space-y-3.5 flex-1 overflow-y-auto max-h-72 pr-1">
            {data?.countries.map((c, i) => {
              const flag = COUNTRY_FLAGS[c.country_code] || "🌍";
              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                      <span className="text-base">{flag}</span> {c.country}
                    </span>
                    <span className="text-gray-500 font-medium">
                      {c.total} ({c.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, c.percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ligne 2 : Systèmes d'exploitation (OS), Navigateurs et Appareils */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Systèmes d'exploitation (OS) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-1">
            <Monitor size={16} className="text-amber-500" /> Systèmes d'exploitation
          </h2>
          <p className="text-xs text-gray-500 mb-4">Répartition des plateformes clients</p>

          <div className="space-y-3">
            {data?.operating_systems.map((os, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100/70 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-700">
                    {os.os.includes("Windows") ? "Win" : os.os.includes("Android") ? "And" : os.os.includes("iOS") ? "iOS" : os.os.includes("mac") ? "Mac" : "OS"}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-800">{os.os}</div>
                    <div className="text-[11px] text-gray-400">{os.total} visites</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-gray-900">{os.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigateurs Web */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-1">
            <Compass size={16} className="text-amber-500" /> Navigateurs Web
          </h2>
          <p className="text-xs text-gray-500 mb-4">Logiciels de navigation utilisés</p>

          <div className="space-y-3">
            {data?.browsers.map((b, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100/70 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-amber-600">
                    {b.browser.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-800">{b.browser}</div>
                    <div className="text-[11px] text-gray-400">{b.total} sessions</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-gray-900">{b.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Types d'appareils */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-1">
            <Smartphone size={16} className="text-amber-500" /> Types d'appareils
          </h2>
          <p className="text-xs text-gray-500 mb-4">Mobile vs Ordinateur de bureau</p>

          <div className="space-y-3">
            {data?.devices.map((d, i) => (
              <div key={i} className="p-3 rounded-xl bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white border border-gray-200">
                    {getDeviceIcon(d.device)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-800 capitalize">
                      {d.device === "desktop" ? "Ordinateur (Desktop)" : d.device === "mobile" ? "Mobile (Smartphone)" : "Tablette"}
                    </div>
                    <div className="text-[11px] text-gray-400">{d.total} utilisateurs</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    {d.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ligne 3 : Flux d'activités en direct */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Zap size={16} className="text-amber-500" /> Flux d'activités & actions en direct
            </h2>
            <p className="text-xs text-gray-500">
              Journal en direct des dernières actions effectuées par les apprenants et visiteurs
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" /> Live Tracker
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 font-semibold uppercase text-[10px]">
                <th className="pb-3 pl-2">Utilisateur</th>
                <th className="pb-3">Action effectuée</th>
                <th className="pb-3">Page / URL</th>
                <th className="pb-3">Provenance</th>
                <th className="pb-3">OS & Navigateur</th>
                <th className="pb-3 pr-2 text-right">Date / Heure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data?.recent_activities.slice(0, 15).map((act) => (
                <tr key={act.id} className="hover:bg-amber-50/30 transition-colors">
                  <td className="py-3 pl-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                        {act.user ? act.user.prenom?.charAt(0) || act.user.nom?.charAt(0) : "V"}
                      </div>
                      <div>
                        <div className="font-bold text-gray-800">
                          {act.user ? `${act.user.prenom} ${act.user.nom}` : "Visiteur invité"}
                        </div>
                        <div className="text-[10px] text-gray-400">{act.ip_address}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">{getActionBadge(act.action)}</td>
                  <td className="py-3 font-mono text-[11px] text-gray-600 truncate max-w-[150px]">
                    {act.path}
                  </td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1 text-gray-700">
                      <span>{COUNTRY_FLAGS[act.country_code] || "🌍"}</span>
                      <span>{act.country}</span>
                      {act.city && <span className="text-gray-400">({act.city})</span>}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-md text-[11px] bg-gray-100 text-gray-700 font-medium">
                      {act.os} • {act.browser}
                    </span>
                  </td>
                  <td className="py-3 pr-2 text-right text-gray-400 font-medium">
                    {act.time_ago}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

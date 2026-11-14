import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  /**
   * Évolution réelle vs période précédente.
   * Absente ou null → aucune tendance affichée (on n'affiche jamais de chiffre inventé).
   */
  percent?: number | null;
  /** Unité de la tendance : "%" (défaut) ou "pts" pour un écart de taux */
  percentUnit?: string;
  /** true quand une baisse est une bonne nouvelle (ex. taux de rebond) */
  lowerIsBetter?: boolean;
  /** Conservé pour compatibilité : les cartes suivent désormais le style de la page de connexion */
  bgColor?: string;
  loading?: boolean;
}

export default function StatCard({
  label,
  value,
  percent = null,
  percentUnit = "%",
  lowerIsBetter = false,
  loading = false,
}: StatCardProps) {
  const hasTrend = typeof percent === "number" && Number.isFinite(percent);
  const isUp = hasTrend && percent >= 0;
  const isGood = hasTrend && (lowerIsBetter ? percent <= 0 : percent >= 0);

  if (loading) {
    return (
      <div className="tely-card shadow-xl p-4 sm:p-5 w-full min-w-0 flex flex-col justify-between animate-pulse">
        <div className="h-3.5 w-24 bg-gray-900/10 rounded mb-2.5" />
        <div className="flex items-center justify-between gap-1.5">
          <div className="h-7 w-16 bg-gray-900/15 rounded-lg" />
          <div className="h-4 w-12 bg-gray-900/10 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="tely-card tely-animate shadow-xl p-4 sm:p-5 w-full min-w-0 flex flex-col justify-between">
      <p className="tely-label mb-2 truncate">{label}</p>
      <div className="flex items-center justify-between gap-1.5 flex-wrap">
        <span className="tely-title text-3xl truncate">
          {typeof value === "number" ? value.toLocaleString("fr-FR") : value}
        </span>
        {hasTrend && (
          <div
            className={`flex items-center gap-1 text-xs font-semibold shrink-0 ${isGood ? "text-emerald-600" : "text-red-500"}`}
            title="Évolution par rapport à la période précédente"
          >
            <span>
              {isUp ? "+" : ""}
              {percent}
              {percentUnit === "%" ? "%" : ` ${percentUnit}`}
            </span>
            {isUp ? (
              <TrendingUp size={14} className="text-gray-900" />
            ) : (
              <TrendingDown size={14} className="text-gray-900" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

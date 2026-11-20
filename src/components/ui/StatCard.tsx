import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

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
  /** Conservé pour compatibilité */
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
      <Card className="p-5 gap-3 w-full min-w-0">
        <Skeleton className="h-3.5 w-24" />
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-4 w-12" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5 gap-2.5 w-full min-w-0 transition-shadow hover:shadow-sm">
      <p className="text-xs font-medium text-muted-foreground truncate">{label}</p>
      <div className="flex items-baseline justify-between gap-2 flex-wrap">
        <span className="tely-title text-2xl sm:text-3xl tracking-tight truncate">
          {typeof value === "number" ? value.toLocaleString("fr-FR") : value}
        </span>
        {hasTrend && (
          <div
            className={cn(
              "inline-flex items-center gap-1 text-xs font-semibold shrink-0",
              isGood ? "text-emerald-600" : "text-destructive"
            )}
            title="Évolution par rapport à la période précédente"
          >
            <span>
              {isUp ? "+" : ""}
              {percent}
              {percentUnit === "%" ? "%" : ` ${percentUnit}`}
            </span>
            {isUp ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
          </div>
        )}
      </div>
    </Card>
  );
}

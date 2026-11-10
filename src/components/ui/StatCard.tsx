import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  percent: number;
  bgColor?: string;
}

export default function StatCard({
  label,
  value,
  percent,
  bgColor = "bg-indigo-50",
}: StatCardProps) {
  const isPositive = percent >= 0;

  return (
    <div className={`${bgColor} rounded-2xl p-4 sm:p-5 w-full min-w-0 shadow-xs flex flex-col justify-between`}>
      <p className="text-xs sm:text-sm text-gray-500 mb-1.5 truncate">{label}</p>
      <div className="flex items-center justify-between gap-1.5 flex-wrap">
        <span className="text-2xl sm:text-3xl font-bold text-gray-800 truncate">
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>
        <div className={`flex items-center gap-0.5 text-xs font-semibold shrink-0 ${isPositive ? "text-green-500" : "text-red-500"}`}>
          <span>{isPositive ? "+" : ""}{percent}%</span>
          {isPositive
            ? <TrendingUp size={14} />
            : <TrendingDown size={14} />
          }
        </div>
      </div>
    </div>
  );
}

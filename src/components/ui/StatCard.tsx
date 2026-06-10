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
    <div className={`${bgColor} rounded-2xl p-5 w-52 shadow-sm`}>
      <p className="text-sm text-gray-500 mb-2">{label}</p>
      <div className="flex items-center gap-2">
        <span className="text-3xl font-bold text-gray-800">
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>
        <div className={`flex items-center gap-0.5 text-xs font-semibold ${isPositive ? "text-green-500" : "text-red-500"}`}>
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
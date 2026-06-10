"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ─── Data ──────────────────────────────────────────────────────────
const chartData = [
  { month: "Jan", thisYear: 12000, lastYear: 7000  },
  { month: "Feb", thisYear: 10000, lastYear: 13000 },
  { month: "Mar", thisYear: 15000, lastYear: 11000 },
  { month: "Apr", thisYear: 24000, lastYear: 20000 },
  { month: "May", thisYear: 28000, lastYear: 16000 },
  { month: "Jun", thisYear: 22000, lastYear: 18000 },
  { month: "Jul", thisYear: 25000, lastYear: 30000 },
];

const trafficSources = [
  { name: "Google",    solid: true,  color: "#1a1a1a" },
  { name: "YouTube",   solid: true,  color: "#1a1a1a" },
  { name: "Instagram", solid: false, color: "#1a1a1a" },
  { name: "Pinterest", solid: true,  color: "#1a1a1a" },
  { name: "Facebook",  solid: false, color: "#1a1a1a" },
  { name: "Twitter",   solid: true,  color: "#1a1a1a" },
];

const tabs = ["Total Users", "Total Projects", "Operating Status"];

// ─── TrafficItem ───────────────────────────────────────────────────
function TrafficItem({ name, solid }: { name: string; solid: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-600">{name}</span>
      <div className="flex items-center gap-0.5">
        {/* Ligne dash style */}
        {[...Array(4)].map((_, i) => (
          <span
            key={i}
            className={`h-0.5 rounded-full ${solid ? "w-4 bg-gray-800" : "w-2 bg-gray-400"}`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── ChartSection ──────────────────────────────────────────────────
export default function ChartSection() {
  return (
    <div className="flex mt-7 gap-4 w-full">

      {/* ── Graphique principal ── */}
      <div className="flex-1 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">

        {/* Tabs + légende */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {tabs.map((tab, i) => (
              <button
                key={tab}
                className={`text-sm font-medium transition-colors ${
                  i === 0
                    ? "text-gray-800 font-semibold"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab}
              </button>
            ))}
            <div className="w-px h-4 bg-gray-200 mx-1" />
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-gray-800 inline-block" />
                This year
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-300 inline-block" />
                Last year
              </span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="thisYearGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#1a1a1a" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#1a1a1a" stopOpacity={0}    />
              </linearGradient>
              <linearGradient id="lastYearGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#818cf8" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0}   />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#9ca3af" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              tickFormatter={(v) => `${v / 1000}K`}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "10px",
                border: "none",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                fontSize: "12px",
              }}
              formatter={(value: number) => [value.toLocaleString(), ""]}
            />

            {/* Last year — pointillés bleus */}
            <Area
              type="monotone"
              dataKey="lastYear"
              stroke="#818cf8"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              fill="url(#lastYearGrad)"
              dot={false}
            />

            {/* This year — trait plein noir */}
            <Area
              type="monotone"
              dataKey="thisYear"
              stroke="#1a1a1a"
              strokeWidth={2}
              fill="url(#thisYearGrad)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Traffic by Website ── */}
      <div className="w-56 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Traffic by Website</h3>
        <div className="flex flex-col">
          {trafficSources.map((source) => (
            <TrafficItem key={source.name} name={source.name} solid={source.solid} />
          ))}
        </div>
      </div>

    </div>
  );
}
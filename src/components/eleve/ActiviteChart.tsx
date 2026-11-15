import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ActiviteJour } from "../../types/eleve";

function libelleJour(date: string, long = false) {
  const d = new Date(`${date}T00:00:00`);
  return d.toLocaleDateString("fr-FR", long ? { weekday: "long", day: "numeric", month: "long" } : { day: "numeric", month: "short" });
}

interface InfoBulleProps {
  active?: boolean;
  payload?: Array<{ payload: ActiviteJour }>;
}

function InfoBulle({ active, payload }: InfoBulleProps) {
  if (!active || !payload?.length) return null;
  const { date, total } = payload[0].payload;
  return (
    <div className="bg-white rounded-lg shadow-xl border border-gray-100 px-3 py-2 text-xs">
      <p className="text-gray-400 capitalize">{libelleJour(date, true)}</p>
      <p className="font-semibold text-gray-900 mt-0.5">
        {total} activité{total > 1 ? "s" : ""}
      </p>
    </div>
  );
}

/** Histogramme d'activité sur 14 jours (une seule série : pas de légende, le titre la nomme). */
export default function ActiviteChart({ data }: { data: ActiviteJour[] }) {
  const total = data.reduce((s, d) => s + d.total, 0);

  return (
    <figure className="m-0">
      <div className="h-48 sm:h-56 w-full" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 4, left: -28, bottom: 0 }} barCategoryGap={4}>
            <CartesianGrid vertical={false} stroke="#f3f4f6" />
            <XAxis
              dataKey="date"
              tickFormatter={(v: string) => libelleJour(v)}
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={16}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
            <Tooltip content={<InfoBulle />} cursor={{ fill: "rgba(245, 158, 11, 0.08)" }} />
            <Bar dataKey="total" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={22} minPointSize={2} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Version textuelle pour les lecteurs d'écran */}
      <figcaption className="sr-only">
        {total} activités sur les 14 derniers jours.
        <table>
          <tbody>
            {data.map((d) => (
              <tr key={d.date}>
                <td>{libelleJour(d.date, true)}</td>
                <td>{d.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figcaption>
    </figure>
  );
}

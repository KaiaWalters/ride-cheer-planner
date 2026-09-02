import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import type { CheckInWithNames } from "@/lib/api/checkins";

const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

export function EnergyChart({ rows }: { rows: CheckInWithNames[] }) {
  const riders = [...new Set(rows.map((r) => r.user_id))];
  const nameOf = (id: string) =>
    rows.find((r) => r.user_id === id)?.profiles?.display_name || "Rider";

  const points = rows.map((row) => ({
    label: new Date(row.arrived_at).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    time: new Date(row.arrived_at).getTime(),
    [row.user_id]: row.energy_level,
  }));

  const merged = Object.values(
    points.reduce<Record<string, Record<string, unknown>>>((acc, p) => {
      const key = String(p.time);
      acc[key] = { ...(acc[key] ?? {}), ...p };
      return acc;
    }, {}),
  ).sort((a, b) => Number(a.time) - Number(b.time));

  if (!rows.length) {
    return (
      <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
        No check-ins yet.
      </p>
    );
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={merged} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
          <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
          <Tooltip
            contentStyle={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: 12,
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {riders.map((id, i) => (
            <Line
              key={id}
              type="monotone"
              dataKey={id}
              name={nameOf(id)}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

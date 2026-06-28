import type { Lead } from "@/lib/supabase";

type Props = {
  leads: Lead[];
};

export default function StatsBar({ leads }: Props) {
  const hot = leads.filter((l) => l.score >= 7).length;
  const warm = leads.filter((l) => l.score >= 4 && l.score <= 6).length;
  const cold = leads.filter((l) => l.score <= 3).length;
  const total = leads.length;

  // Average score, rounded to 1 decimal place
  const avg =
    total > 0
      ? (leads.reduce((sum, l) => sum + l.score, 0) / total).toFixed(1)
      : "—";

  const stats = [
    {
      label: "Total Leads",
      value: total,
      color: "text-white",
      bg: "bg-[#1E1E2A]",
    },
    {
      label: "🔥 Hot",
      value: hot,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "⚡ Warm",
      value: warm,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      label: "❄️ Cold",
      value: cold,
      color: "text-red-400",
      bg: "bg-red-500/10",
    },
    {
      label: "Avg Score",
      value: avg,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`${stat.bg} rounded-xl p-4 border border-[#2A2A3A]`}
        >
          <p className={`text-2xl font-bold font-mono ${stat.color}`}>
            {stat.value}
          </p>
          <p className="text-gray-500 text-xs mt-0.5">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

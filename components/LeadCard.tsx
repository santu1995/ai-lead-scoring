import type { Lead } from "@/lib/supabase";
import NotifyButton from "@/app/dashboard/NotifyButton";

type Props = {
  lead: Lead;
};

// Returns Tailwind classes for score coloring
function getScoreStyles(score: number): {
  badge: string;
  bar: string;
  dot: string;
  label: string;
} {
  if (score >= 7) {
    return {
      badge: "badge-hot",
      bar: "bg-emerald-400",
      dot: "bg-emerald-400",
      label: "🔥 Hot",
    };
  }
  if (score >= 4) {
    return {
      badge: "badge-warm",
      bar: "bg-amber-400",
      dot: "bg-amber-400",
      label: "⚡ Warm",
    };
  }
  return {
    badge: "badge-cold",
    bar: "bg-red-400",
    dot: "bg-red-400",
    label: "❄️ Cold",
  };
}

function getSourceStyles(source: string): string {
  if (source === "Website") return "bg-blue-500/10 text-blue-300";
  if (source === "Facebook Ad") return "bg-indigo-500/10 text-indigo-300";
  if (source === "Google Form") return "bg-emerald-500/10 text-emerald-300";
  return "bg-gray-500/10 text-gray-300";
}

// Formats a date string to "Jun 26, 2026 · 2:30 PM"
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function LeadCard({ lead }: Props) {
  const styles = getScoreStyles(lead.score);
  // Score bar width as a percentage of the card
  const barWidth = `${lead.score * 10}%`;

  return (
    <div className="card hover:border-[#3A3A4A] transition-colors duration-200">
      {/* Top row: name + score badge */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${styles.dot}`} />
            <h3 className="font-semibold text-white truncate">{lead.name}</h3>
          </div>
          <p className="text-gray-400 text-sm truncate">
            {lead.role} · {lead.company}
          </p>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md inline-block mt-1 ${getSourceStyles(lead.source)}`}>
            {lead.source}
          </span>
        </div>
        <div
          className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold flex-shrink-0 ${styles.badge}`}
        >
          {lead.score}/10 · {styles.label}
        </div>
      </div>

      {/* Score progress bar */}
      <div className="w-full h-1 bg-[#2A2A3A] rounded-full mb-4 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${styles.bar}`}
          style={{ width: barWidth }}
        />
      </div>

      {/* Budget + Timeline tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="bg-[#1E1E2A] text-gray-300 text-xs px-2.5 py-1 rounded-md font-mono">
          💰 {lead.budget}
        </span>
        <span className="bg-[#1E1E2A] text-gray-300 text-xs px-2.5 py-1 rounded-md font-mono">
          ⏱ {lead.timeline}
        </span>
      </div>

      {/* AI Reason */}
      <div className="mb-3">
        <p className="text-xs text-gray-500 font-mono mb-1">AI REASONING</p>
        <p className="text-gray-300 text-sm leading-relaxed line-clamp-2">
          {lead.reason}
        </p>
      </div>

      {/* Recommended Action */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 font-mono mb-1">NEXT ACTION</p>
        <p className="text-violet-300 text-sm font-medium">{lead.action}</p>
      </div>

      {/* Footer: email + date */}
      <div className="flex items-center justify-between border-t border-[#2A2A3A] pt-3 mt-auto">
        <a
          href={`mailto:${lead.email}`}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors font-mono truncate"
        >
          {lead.email}
        </a>
        <span className="text-xs text-gray-600 font-mono flex-shrink-0 ml-2">
          {formatDate(lead.created_at)}
        </span>
      </div>

      {/* WhatsApp notify button */}
      <div className="mt-3">
        <NotifyButton
          leadId={lead.id}
          score={lead.score}
          notifiedAt={lead.notified_at}
        />
      </div>
    </div>
  );
}

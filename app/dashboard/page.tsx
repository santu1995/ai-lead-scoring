import Link from "next/link";
import { supabase } from "@/lib/supabase";
import LeadCard from "@/components/LeadCard";
import StatsBar from "@/components/StatsBar";

// This is a Server Component — data fetching happens on the server
// No useEffect needed. Supabase is called directly here.
export const revalidate = 0; // Always fetch fresh data on each request

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { filter?: string };
}) {
  // Active filter from URL query param (?filter=hot / warm / cold)
  const activeFilter = searchParams.filter || "all";

  // Fetch all leads, newest first
  const { data: allLeads, error } = await supabase
    .from("leads_p1")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen px-4 py-12 max-w-6xl mx-auto">
        <div className="card text-red-400">
          Error loading leads: {error.message}
        </div>
      </main>
    );
  }

  const leads = allLeads || [];

  // Filter leads based on active filter
  const filteredLeads = leads.filter((lead) => {
    if (activeFilter === "hot") return lead.score >= 7;
    if (activeFilter === "warm") return lead.score >= 4 && lead.score <= 6;
    if (activeFilter === "cold") return lead.score <= 3;
    return true; // "all"
  });

  const filterTabs = [
    { key: "all", label: "All" },
    { key: "hot", label: "🔥 Hot (7–10)" },
    { key: "warm", label: "⚡ Warm (4–6)" },
    { key: "cold", label: "❄️ Cold (1–3)" },
  ];

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header row */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/"
              className="text-gray-500 hover:text-gray-300 text-sm transition-colors mb-3 inline-flex items-center gap-1"
            >
              ← Back to home
            </Link>
            <h1 className="text-3xl font-bold mt-2">Lead Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">
              All leads scored and ranked by Claude AI
            </p>
          </div>
          <Link
            href="/submit"
            className="btn-primary hidden sm:inline-flex items-center gap-1.5"
          >
            + Submit lead
          </Link>
        </div>

        {/* Stats summary */}
        <StatsBar leads={leads} />

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {filterTabs.map((tab) => (
            <Link
              key={tab.key}
              href={tab.key === "all" ? "/dashboard" : `/dashboard?filter=${tab.key}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                activeFilter === tab.key
                  ? "bg-violet-600 text-white"
                  : "bg-[#1E1E2A] text-gray-400 hover:text-white border border-[#2A2A3A]"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Lead count for current filter */}
        <p className="text-gray-500 text-sm mb-6 font-mono">
          {filteredLeads.length} lead{filteredLeads.length !== 1 ? "s" : ""}{" "}
          {activeFilter !== "all" ? `matching "${activeFilter}"` : "total"}
        </p>

        {/* Empty state */}
        {filteredLeads.length === 0 && (
          <div className="card text-center py-16">
            <p className="text-4xl mb-4">📭</p>
            <p className="text-gray-300 font-semibold mb-1">No leads yet</p>
            <p className="text-gray-500 text-sm mb-6">
              {activeFilter !== "all"
                ? `No ${activeFilter} leads found. Try a different filter.`
                : "Submit your first lead to see it scored here."}
            </p>
            <Link href="/submit" className="btn-primary inline-block">
              Submit a lead
            </Link>
          </div>
        )}

        {/* Lead cards grid */}
        {filteredLeads.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredLeads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        )}

        {/* Mobile CTA */}
        <div className="mt-8 sm:hidden">
          <Link href="/submit" className="btn-primary w-full block text-center">
            + Submit a new lead
          </Link>
        </div>
      </div>
    </main>
  );
}

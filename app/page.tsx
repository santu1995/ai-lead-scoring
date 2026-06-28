import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 text-violet-400 text-xs font-mono mb-6">
          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
          POWERED BY SANTU ADHIKARY AUTOMATION
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-4">
          AI Lead Scoring
        </h1>
        <p className="text-gray-400 text-lg max-w-md mx-auto leading-relaxed">
          Submit a lead. OPEN AI  scores it 1–10 with a reason and next action.
          View all leads in your dashboard.
        </p>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
        <Link href="/submit" className="group card hover:border-violet-500/50 transition-all duration-200 cursor-pointer">
          <div className="text-3xl mb-3">📋</div>
          <h2 className="text-lg font-semibold mb-1">Submit a Lead</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Fill in lead details. Claude AI scores and saves it instantly.
          </p>
          <div className="mt-4 text-violet-400 text-sm font-medium group-hover:text-violet-300 transition-colors">
            Open form →
          </div>
        </Link>

        <Link href="/dashboard" className="group card hover:border-violet-500/50 transition-all duration-200 cursor-pointer">
          <div className="text-3xl mb-3">📊</div>
          <h2 className="text-lg font-semibold mb-1">View Dashboard</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            See all scored leads with color-coded priority rankings.
          </p>
          <div className="mt-4 text-violet-400 text-sm font-medium group-hover:text-violet-300 transition-colors">
            Open dashboard →
          </div>
        </Link>
      </div>

      {/* Score legend */}
      <div className="mt-12 flex items-center gap-6 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-gray-400">Hot (7–10)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-gray-400">Warm (4–6)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          <span className="text-gray-400">Cold (1–3)</span>
        </div>
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import type { Lead } from "@/lib/supabase";

// Initial blank form state
const emptyForm = {
  name: "",
  email: "",
  company: "",
  role: "",
  budget: "",
  timeline: "",
  message: "",
};

export default function SubmitPage() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Lead | null>(null);

  // Update a single field in the form state
  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // Submit form → call API → show result
  async function handleSubmit(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/score-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Scoring failed.");
      }

      setResult(data.lead);
      setForm(emptyForm); // Clear form after success
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  // Determine badge style based on score
  function getScoreBadge(score: number) {
    if (score >= 7) return "badge-hot";
    if (score >= 4) return "badge-warm";
    return "badge-cold";
  }

  function getScoreLabel(score: number) {
    if (score >= 7) return "🔥 Hot Lead";
    if (score >= 4) return "⚡ Warm Lead";
    return "❄️ Cold Lead";
  }

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Back link */}
        <Link
          href="/"
          className="text-gray-500 hover:text-gray-300 text-sm transition-colors mb-8 inline-flex items-center gap-1"
        >
          ← Back to home
        </Link>

        {/* Page header */}
        <div className="mb-8 mt-4">
          <h1 className="text-3xl font-bold mb-2">Submit a Lead</h1>
          <p className="text-gray-400 text-sm">
            santu adhikary automation will score this lead 1–10 and suggest a next action.
          </p>
        </div>

        {/* Success Result Card — shown after scoring */}
        {result && (
          <div className="card mb-8 border-violet-500/30">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-gray-500 font-mono mb-1">
                  LEAD SCORED
                </p>
                <h2 className="text-xl font-bold">{result.name}</h2>
                <p className="text-gray-400 text-sm">
                  {result.role} at {result.company}
                </p>
              </div>
              <div
                className={`px-3 py-1.5 rounded-lg text-sm font-mono font-semibold ${getScoreBadge(result.score)}`}
              >
                {result.score}/10 · {getScoreLabel(result.score)}
              </div>
            </div>

            <div className="space-y-3 border-t border-[#2A2A3A] pt-4">
              <div>
                <p className="text-xs text-gray-500 font-mono mb-1">
                  AI REASONING
                </p>
                <p className="text-gray-200 text-sm leading-relaxed">
                  {result.reason}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-mono mb-1">
                  RECOMMENDED ACTION
                </p>
                <p className="text-violet-300 text-sm font-medium">
                  {result.action}
                </p>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setResult(null)}
                className="btn-primary text-xs px-4 py-2"
              >
                Score another lead
              </button>
              <Link
                href="/dashboard"
                className="text-sm text-gray-400 hover:text-white transition-colors self-center"
              >
                View dashboard →
              </Link>
            </div>
          </div>
        )}

        {/* Lead Form */}
        {!result && (
          <div className="card">
            <div className="space-y-5">
              {/* Row 1: Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 font-mono mb-1.5">
                    FULL NAME *
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="John Smith"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 font-mono mb-1.5">
                    EMAIL *
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="john@company.com"
                    className="input-field"
                  />
                </div>
              </div>

              {/* Row 2: Company + Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 font-mono mb-1.5">
                    COMPANY *
                  </label>
                  <input
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="Acme Inc"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 font-mono mb-1.5">
                    JOB TITLE *
                  </label>
                  <input
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    placeholder="VP of Engineering"
                    className="input-field"
                  />
                </div>
              </div>

              {/* Row 3: Budget + Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 font-mono mb-1.5">
                    BUDGET *
                  </label>
                  <select
                    name="budget"
                    value={form.budget}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">Select budget range</option>
                    <option value="Under $5k">Under $5k</option>
                    <option value="$5k - $15k">$5k – $15k</option>
                    <option value="$15k - $50k">$15k – $50k</option>
                    <option value="$50k - $100k">$50k – $100k</option>
                    <option value="$100k+">$100k+</option>
                    <option value="Not sure yet">Not sure yet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 font-mono mb-1.5">
                    TIMELINE *
                  </label>
                  <select
                    name="timeline"
                    value={form.timeline}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">Select timeline</option>
                    <option value="ASAP / Within 2 weeks">
                      ASAP / Within 2 weeks
                    </option>
                    <option value="1 month">1 month</option>
                    <option value="1-3 months">1–3 months</option>
                    <option value="3-6 months">3–6 months</option>
                    <option value="Just exploring">Just exploring</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs text-gray-400 font-mono mb-1.5">
                  MESSAGE / PROJECT DETAILS *
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe what they're looking to build or automate..."
                  className="input-field resize-none"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Claude is scoring this lead...
                  </>
                ) : (
                  "Score this lead with AI →"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

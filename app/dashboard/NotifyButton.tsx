"use client";

import { useState } from "react";

interface Props {
  leadId: string;
  score: number;
  notifiedAt: string | null;
}

export default function NotifyButton({ leadId, score, notifiedAt }: Props) {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [msg, setMsg] = useState("");

  if (notifiedAt) {
    return (
      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
        ✅ Notified
      </span>
    );
  }

  async function handleClick() {
    setStatus("loading");
    setMsg("");

    const res = await fetch("/api/notify-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId }),
    });

    const data = await res.json();

    if (data.success) {
      setStatus("success");
      setMsg("Sent!");
    } else {
      setStatus("error");
      setMsg(data.message || "Failed");
      setTimeout(() => setStatus("idle"), 4000);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleClick}
        disabled={status === "loading" || status === "success"}
        className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
          status === "success"
            ? "bg-green-100 text-green-700"
            : status === "error"
              ? "bg-red-100 text-red-600"
              : "bg-green-600 hover:bg-green-700 text-white"
        }`}
      >
        {status === "loading"
          ? "Sending..."
          : status === "success"
            ? "✅ Sent!"
            : status === "error"
              ? "❌ Failed"
              : "📲 Notify Team"}
      </button>
      {msg && status === "error" && (
        <p className="text-xs text-red-500">{msg}</p>
      )}
    </div>
  );
}

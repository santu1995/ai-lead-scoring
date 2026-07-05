import { NextRequest, NextResponse } from "next/server";
import { processLead } from "@/lib/lead-processor";
import { normalizeGoogleFormLead } from "@/lib/normalize-lead";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const normalized = normalizeGoogleFormLead(body);
    const data = await processLead(normalized, "Google Form");
    return NextResponse.json({ lead: data }, { status: 201 });
  } catch (error) {
    console.error("Google Form webhook error:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

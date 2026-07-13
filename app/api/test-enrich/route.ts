import { NextResponse } from "next/server";
import { enrichLead } from "@/lib/enrich-lead";

export async function GET() {
  const result = await enrichLead("test@apollo.io");
  return NextResponse.json({ result });
}
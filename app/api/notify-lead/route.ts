import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { buildWhatsAppMessage } from "@/lib/ai-message";
import { sendToSalesTeam } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  try {
    const { leadId } = await req.json();

    if (!leadId) {
      return NextResponse.json(
        { success: false, message: "leadId is required" },
        { status: 400 },
      );
    }

    // 1. Fetch lead from Supabase
    const { data: lead, error } = await supabaseAdmin
      .from("leads_p1")
      .select("*")
      .eq("id", leadId)
      .single();

    if (error || !lead) {
      return NextResponse.json(
        { success: false, message: "Lead not found" },
        { status: 404 },
      );
    }

    // 3. Build AI message
    const message = await buildWhatsAppMessage(lead);

    // 4. Send to sales team
    const { successCount, failCount } = await sendToSalesTeam(message);

    if (successCount === 0) {
      return NextResponse.json(
        { success: false, message: "WhatsApp send failed for all recipients" },
        { status: 500 },
      );
    }

    // 5. Mark as notified
    await supabaseAdmin
      .from("leads_p1")
      .update({ notified_at: new Date().toISOString() })
      .eq("id", leadId);

    return NextResponse.json({
      success: true,
      message: `Sent to ${successCount} recipient(s).${failCount > 0 ? ` ${failCount} failed.` : ""}`,
    });
  } catch (error) {
    console.error("notify-lead error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Server error",
      },
      { status: 500 },
    );
  }
}

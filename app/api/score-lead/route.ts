import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { supabaseAdmin } from "@/lib/supabase";
import { buildWhatsAppMessage } from "@/lib/ai-message";
import { sendToSalesTeam } from "@/lib/whatsapp";

// Initialize OpenAI client
// OPENAI_API_KEY is read automatically from environment
const openai = new OpenAI();

export async function POST(request: NextRequest) {
  try {
    // 1. Parse incoming lead data from the form
    const body = await request.json();
    const { name, email, company, role, budget, timeline, message } = body;

    // 2. Basic validation — all fields are required
    if (!name || !email || !company || !role || !budget || !timeline || !message) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    // 3. Build the prompt for OpenAI
    const prompt = `You are a B2B sales qualification expert. Score this inbound lead for a US software agency.

LEAD DETAILS:
- Name: ${name}
- Email: ${email}
- Company: ${company}
- Role/Title: ${role}
- Budget mentioned: ${budget}
- Timeline: ${timeline}
- Message: ${message}

SCORING CRITERIA:
- Budget fit (bigger budget = higher score)
- Timeline urgency (sooner = higher score)
- Role seniority (decision-maker = higher score)
- Message clarity and intent (specific request = higher score)
- Company size signals in the message

Return ONLY a JSON object with exactly these fields, no extra text, no markdown:
{
  "score": <integer 1-10>,
  "reason": "<2-3 sentence explanation of why this score>",
  "action": "<specific next step the sales team should take>"
}`;

    // 4. Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",   // Fast and cheap — perfect for scoring tasks
      max_tokens: 400,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // 5. Extract the text from OpenAI's response
    const responseText = completion.choices[0].message.content || "";

    // 6. Parse the JSON OpenAI returned
    // Strip any accidental markdown fences if present
    const cleanJson = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const scoring = JSON.parse(cleanJson);

    // 7. Validate the score is actually 1-10
    if (
      typeof scoring.score !== "number" ||
      scoring.score < 1 ||
      scoring.score > 10
    ) {
      throw new Error("OpenAI returned an invalid score range.");
    }

    // 8. Save the complete lead + score to Supabase
    const { data, error: dbError } = await supabaseAdmin
      .from("leads_p1")
      .insert([
        {
          name,
          email,
          company,
          role,
          budget,
          timeline,
          message,
          score: scoring.score,
          reason: scoring.reason,
          action: scoring.action,
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error("Supabase insert error:", dbError);
      throw new Error("Failed to save lead to database.");
    }

    // 9. Auto-notify sales team via WhatsApp for hot leads (score >= 7)
    if (scoring.score >= 7) {
      try {
        const waMessage = await buildWhatsAppMessage(data);
        const { successCount } = await sendToSalesTeam(waMessage);
        if (successCount > 0) {
          await supabaseAdmin
            .from("leads_p1")
            .update({ notified_at: new Date().toISOString() })
            .eq("id", data.id);
        }
      } catch (waError) {
        console.error("WhatsApp notify error:", waError);
      }
    }

    // 10. Return the saved lead (includes the auto-generated id and created_at)
    return NextResponse.json({ lead: data }, { status: 201 });
  } catch (error) {
    console.error("Score lead error:", error);

    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

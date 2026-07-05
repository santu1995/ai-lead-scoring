import OpenAI from "openai";
import { supabaseAdmin } from "./supabase";
import { buildWhatsAppMessage } from "./ai-message";
import { sendToSalesTeam } from "./whatsapp";
import { NormalizedLead } from "./normalize-lead";

const openai = new OpenAI();

export async function processLead(
  lead: NormalizedLead,
  source: "Website" | "Facebook Ad" | "Google Form",
) {
  const { name, email, company, role, budget, timeline, message } = lead;

  // Same required-field check your original route.ts enforced
  if (
    !name ||
    !email ||
    !company ||
    !role ||
    !budget ||
    !timeline ||
    !message
  ) {
    throw new Error("All fields are required.");
  }

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

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 400,
    messages: [{ role: "user", content: prompt }],
  });

  const responseText = completion.choices[0].message.content || "";
  const cleanJson = responseText
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
  const scoring = JSON.parse(cleanJson);

  if (
    typeof scoring.score !== "number" ||
    scoring.score < 1 ||
    scoring.score > 10
  ) {
    throw new Error("OpenAI returned an invalid score range.");
  }

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
        source,
      },
    ])
    .select()
    .single();

  if (dbError) {
    console.error("Supabase insert error:", dbError);
    throw new Error("Failed to save lead to database.");
  }

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

  return data;
}

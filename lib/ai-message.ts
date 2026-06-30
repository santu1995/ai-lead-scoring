import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  role?: string | null;
  budget?: string | null;
  timeline?: string | null;
  score: number;
  reason?: string | null;
  action?: string | null;
}

export async function buildWhatsAppMessage(lead: Lead): Promise<string> {
  const prompt = `
You are a sales notification assistant. Create a concise WhatsApp message for a sales team.

Lead details:
- Name: ${lead.name}
- Email: ${lead.email}
- Company: ${lead.company}
- Role: ${lead.role || 'Not provided'}
- Budget: ${lead.budget || 'Not provided'}
- Timeline: ${lead.timeline || 'Not provided'}
- Lead Score: ${lead.score}/10
- Score Reason: ${lead.reason || 'Not provided'}
- Recommended Action: ${lead.action || 'Follow up promptly'}

Rules:
1. Start with 🔥 HOT LEAD ALERT
2. Use line breaks between each field
3. Include all fields with a relevant emoji per line
4. End with "✅ AI Lead Scoring System"
5. Keep it short and scannable
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 400,
    temperature: 0.3,
  });

  const message = response.choices[0]?.message?.content;
  if (!message) throw new Error('OpenAI returned empty message');

  return message.trim();
}

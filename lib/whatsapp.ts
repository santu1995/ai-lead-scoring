interface WhatsAppSendResult {
  phoneNumber: string;
  messageId: string | null;
  success: boolean;
  error?: string;
}

export async function sendWhatsAppMessage(
  phoneNumber: string,
  message: string
): Promise<WhatsAppSendResult> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID!;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN!;
  const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: phoneNumber,
        type: 'text',
        text: {
          preview_url: false,
          body: message,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        phoneNumber,
        messageId: null,
        success: false,
        error: data.error?.message || 'WhatsApp API failed',
      };
    }

    return {
      phoneNumber,
      messageId: data.messages?.[0]?.id || null,
      success: true,
    };
  } catch (error) {
    return {
      phoneNumber,
      messageId: null,
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

export async function sendToSalesTeam(message: string): Promise<{
  results: WhatsAppSendResult[];
  successCount: number;
  failCount: number;
}> {
  const numbersEnv = process.env.SALES_TEAM_NUMBERS || '';
  const numbers = numbersEnv
    .split(',')
    .map((n) => n.trim())
    .filter((n) => n.length > 0);

  if (numbers.length === 0) {
    throw new Error('No sales team numbers configured in SALES_TEAM_NUMBERS');
  }

  const results = await Promise.all(
    numbers.map((number) => sendWhatsAppMessage(number, message))
  );

  return {
    results,
    successCount: results.filter((r) => r.success).length,
    failCount: results.filter((r) => !r.success).length,
  };
}

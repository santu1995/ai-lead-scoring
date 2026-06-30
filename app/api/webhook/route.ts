import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { buildWhatsAppMessage } from '@/lib/ai-message';
import { sendToSalesTeam } from '@/lib/whatsapp';

export async function POST(req: NextRequest) {
  try {
    // 1. Verify secret header
    const secret = req.headers.get('x-webhook-secret');
    if (secret !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse Supabase webhook payload
    const { type, record } = await req.json();

    if (!['INSERT', 'UPDATE'].includes(type)) {
      return NextResponse.json({ message: 'Event ignored' });
    }

    // 3. Score gate
    if (!record || record.score < 7) {
      return NextResponse.json({ message: 'Score below threshold' });
    }

    // 4. Skip if already notified
    if (record.notified_at) {
      return NextResponse.json({ message: 'Already notified' });
    }

    // 5. Build and send
    const message = await buildWhatsAppMessage(record);
    const { successCount } = await sendToSalesTeam(message);

    // 6. Mark as notified
    if (successCount > 0) {
      await supabaseAdmin
        .from('leads_p1')
        .update({ notified_at: new Date().toISOString() })
        .eq('id', record.id);
    }

    return NextResponse.json({ success: true, sent: successCount });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}

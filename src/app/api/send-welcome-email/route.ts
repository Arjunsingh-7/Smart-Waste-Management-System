import { NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, organizationName } = body as { email?: string; organizationName?: string };

    if (!email || !organizationName) {
      console.error('[api/send-welcome-email] Missing email or organizationName', body);
      return NextResponse.json({ error: 'Missing email or organizationName' }, { status: 400 });
    }

    console.log('[api/send-welcome-email] Received request for', email, organizationName);

    await sendWelcomeEmail(email, organizationName);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error('[api/send-welcome-email] Error sending email', err);
    return NextResponse.json({ error: String(err) || 'Email sending failed' }, { status: 500 });
  }
}

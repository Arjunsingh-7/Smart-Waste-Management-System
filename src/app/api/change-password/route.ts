import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { account } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const MIN_PASSWORD_LEN = 8;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, currentPassword, newPassword } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'email is required' }, { status: 400 });
    }

    if (!currentPassword || typeof currentPassword !== 'string') {
      return NextResponse.json({ error: 'currentPassword is required' }, { status: 400 });
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < MIN_PASSWORD_LEN) {
      return NextResponse.json({ error: `newPassword is required and must be at least ${MIN_PASSWORD_LEN} characters` }, { status: 400 });
    }

    // Find the account for this email (providerId: 'email' / accountId: email)
    const results = await db.select().from(account).where(eq(account.accountId, email)).limit(1);
    if (!results || results.length === 0) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const acct = results[0];
    const storedHash = acct.password;
    if (!storedHash) {
      return NextResponse.json({ error: 'Password not set for this account' }, { status: 400 });
    }

    const match = await bcrypt.compare(currentPassword, storedHash);
    if (!match) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 403 });
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    const updated = await db.update(account).set({ password: newHash, updatedAt: new Date().toISOString() }).where(eq(account.id, acct.id)).returning();

    return NextResponse.json({ ok: true, updated: Boolean(updated && updated.length) }, { status: 200 });
  } catch (err) {
    console.error('[change-password] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

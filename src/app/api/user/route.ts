import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, name } = body;
    if (!user_id || typeof user_id !== 'string' || user_id.trim() === '') {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    const res = await db.update(user).set({ name: name.trim() }).where(eq(user.id, user_id.trim())).returning();
    if (!res || res.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(res[0], { status: 200 });
  } catch (error) {
    console.error('[user] PUT error:', error);
    return NextResponse.json({ error: 'Internal server error: ' + (error as Error).message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userProfile } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

const VALID_PLANS = ['free', 'standard', 'enterprise'] as const;
type Plan = typeof VALID_PLANS[number];

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { plan } = body;

    if (!plan || !VALID_PLANS.includes(plan as Plan)) {
      return NextResponse.json(
        { error: `plan must be one of: ${VALID_PLANS.join(', ')}`, code: 'INVALID_PLAN' },
        { status: 400 }
      );
    }

    // Check profile exists
    const existing = await db
      .select()
      .from(userProfile)
      .where(eq(userProfile.userId, user.id))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'User profile not found. Please complete registration.', code: 'PROFILE_NOT_FOUND' },
        { status: 404 }
      );
    }

    const updated = await db
      .update(userProfile)
      .set({ plan: plan as Plan, updatedAt: new Date().toISOString() })
      .where(eq(userProfile.userId, user.id))
      .returning();

    return NextResponse.json(
      { message: 'Plan updated successfully', plan: updated[0].plan },
      { status: 200 }
    );
  } catch (error) {
    console.error('select-plan error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const profile = await db
      .select({ plan: userProfile.plan })
      .from(userProfile)
      .where(eq(userProfile.userId, user.id))
      .limit(1);

    const plan = profile[0]?.plan ?? 'free';
    return NextResponse.json({ plan }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

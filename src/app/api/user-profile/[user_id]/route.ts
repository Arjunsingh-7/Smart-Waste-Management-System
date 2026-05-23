import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userProfile } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ user_id: string }> }
) {
  try {
    const { user_id } = await params;

    // Validate user_id is provided and non-empty
    if (!user_id || user_id.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Valid user_id is required',
          code: 'INVALID_USER_ID' 
        },
        { status: 400 }
      );
    }

    // Query user profile by userId
    const profile = await db.select()
      .from(userProfile)
      .where(eq(userProfile.userId, user_id))
      .limit(1);

    // Check if profile exists
    if (profile.length === 0) {
      return NextResponse.json(
        { 
          error: 'User profile not found',
          code: 'PROFILE_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    // Return the profile object directly
    return NextResponse.json(profile[0], { status: 200 });

  } catch (error) {
    console.error('GET user profile error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'SERVER_ERROR' 
      },
      { status: 500 }
    );
  }
}
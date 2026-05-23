import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { dustbins } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Validate ID is a valid integer
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const dustbinId = parseInt(id);

    // Fetch dustbin by ID and userId (user-scoped query)
    const dustbin = await db
      .select()
      .from(dustbins)
      .where(and(eq(dustbins.id, dustbinId), eq(dustbins.userId, user.id)))
      .limit(1);

    // Check if dustbin exists and belongs to the authenticated user
    if (dustbin.length === 0) {
      return NextResponse.json(
        { error: 'Dustbin not found', code: 'DUSTBIN_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Return the dustbin object
    return NextResponse.json(dustbin[0], { status: 200 });
  } catch (error) {
    console.error('GET dustbin error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}
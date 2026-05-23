import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { collections } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Valid ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    const collection = await db
      .select()
      .from(collections)
      .where(
        and(
          eq(collections.id, parseInt(id)),
          eq(collections.userId, user.id)
        )
      )
      .limit(1);

    if (collection.length === 0) {
      return NextResponse.json(
        {
          error: 'Collection not found',
          code: 'COLLECTION_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    return NextResponse.json(collection[0], { status: 200 });
  } catch (error) {
    console.error('GET collection error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message
      },
      { status: 500 }
    );
  }
}
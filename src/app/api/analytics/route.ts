import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { analytics, dustbins } from '@/db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const dustbinId = searchParams.get('dustbin_id');

    // Build query conditions
    const conditions = [eq(analytics.userId, user.id)];

    if (dateFrom) {
      conditions.push(gte(analytics.date, dateFrom));
    }

    if (dateTo) {
      conditions.push(lte(analytics.date, dateTo));
    }

    if (dustbinId) {
      const parsedDustbinId = parseInt(dustbinId);
      if (isNaN(parsedDustbinId)) {
        return NextResponse.json(
          { error: 'Invalid dustbin_id parameter', code: 'INVALID_DUSTBIN_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(analytics.dustbinId, parsedDustbinId));
    }

    const results = await db
      .select()
      .from(analytics)
      .where(and(...conditions))
      .orderBy(desc(analytics.date));

    // Enrich analytics with latest dustbin wet/dry values when available
    const enriched = await Promise.all(results.map(async (row: any) => {
      try {
        const dbDustbin = await db.select().from(dustbins).where(eq(dustbins.id, row.dustbinId)).limit(1);
        const d = dbDustbin?.[0];
        return { ...row, currentWetLevel: d?.wetLevel ?? null, currentDryLevel: d?.dryLevel ?? null };
      } catch (e) {
        return { ...row };
      }
    }));

    return NextResponse.json(enriched, { status: 200 });
  } catch (error) {
    console.error('GET analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

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

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    const {
      dustbin_id,
      date,
      waste_collected_kg,
      fill_level_avg,
      collections_count,
    } = body;

    // Validate required fields
    if (!dustbin_id) {
      return NextResponse.json(
        { error: 'dustbin_id is required', code: 'MISSING_DUSTBIN_ID' },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        { error: 'date is required', code: 'MISSING_DATE' },
        { status: 400 }
      );
    }

    if (waste_collected_kg === undefined || waste_collected_kg === null) {
      return NextResponse.json(
        {
          error: 'waste_collected_kg is required',
          code: 'MISSING_WASTE_COLLECTED_KG',
        },
        { status: 400 }
      );
    }

    if (fill_level_avg === undefined || fill_level_avg === null) {
      return NextResponse.json(
        { error: 'fill_level_avg is required', code: 'MISSING_FILL_LEVEL_AVG' },
        { status: 400 }
      );
    }

    if (collections_count === undefined || collections_count === null) {
      return NextResponse.json(
        {
          error: 'collections_count is required',
          code: 'MISSING_COLLECTIONS_COUNT',
        },
        { status: 400 }
      );
    }

    // Validate dustbin_id is a valid integer
    const parsedDustbinId = parseInt(dustbin_id);
    if (isNaN(parsedDustbinId)) {
      return NextResponse.json(
        { error: 'dustbin_id must be a valid integer', code: 'INVALID_DUSTBIN_ID' },
        { status: 400 }
      );
    }

    // Validate waste_collected_kg is a positive number
    const parsedWasteCollected = parseFloat(waste_collected_kg);
    if (isNaN(parsedWasteCollected) || parsedWasteCollected < 0) {
      return NextResponse.json(
        {
          error: 'waste_collected_kg must be a positive number',
          code: 'INVALID_WASTE_COLLECTED_KG',
        },
        { status: 400 }
      );
    }

    // Validate fill_level_avg is an integer
    const parsedFillLevelAvg = parseInt(fill_level_avg);
    if (isNaN(parsedFillLevelAvg)) {
      return NextResponse.json(
        {
          error: 'fill_level_avg must be a valid integer',
          code: 'INVALID_FILL_LEVEL_AVG',
        },
        { status: 400 }
      );
    }

    // Validate collections_count is an integer
    const parsedCollectionsCount = parseInt(collections_count);
    if (isNaN(parsedCollectionsCount)) {
      return NextResponse.json(
        {
          error: 'collections_count must be a valid integer',
          code: 'INVALID_COLLECTIONS_COUNT',
        },
        { status: 400 }
      );
    }

    // Validate date format (ISO date YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        {
          error: 'date must be in ISO format (YYYY-MM-DD)',
          code: 'INVALID_DATE_FORMAT',
        },
        { status: 400 }
      );
    }

    // Verify dustbin exists and belongs to user
    const dustbin = await db
      .select()
      .from(dustbins)
      .where(and(eq(dustbins.id, parsedDustbinId), eq(dustbins.userId, user.id)))
      .limit(1);

    if (dustbin.length === 0) {
      return NextResponse.json(
        {
          error: 'Dustbin not found or does not belong to user',
          code: 'DUSTBIN_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Insert analytics record
    const newAnalytics = await db
      .insert(analytics)
      .values({
        userId: user.id,
        dustbinId: parsedDustbinId,
        date: date,
        wasteCollectedKg: parsedWasteCollected.toString(),
        fillLevelAvg: parsedFillLevelAvg,
        collectionsCount: parsedCollectionsCount,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newAnalytics[0], { status: 201 });
  } catch (error) {
    console.error('POST analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
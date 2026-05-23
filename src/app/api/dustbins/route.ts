import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { dustbins } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const isActive = searchParams.get('is_active');
    const search = searchParams.get('search');

    let conditions = [eq(dustbins.userId, user.id)];

    if (status) {
      conditions.push(eq(dustbins.status, status));
    }

    if (type) {
      conditions.push(eq(dustbins.type, type));
    }

    if (isActive !== null && isActive !== undefined) {
      const isActiveBoolean = isActive === '1' || isActive === 'true';
      conditions.push(eq(dustbins.isActive, isActiveBoolean));
    }

    if (search) {
      const searchCondition = or(
        like(dustbins.name, `%${search}%`),
        like(dustbins.locationName, `%${search}%`)
      ) as any;
      conditions.push(searchCondition);
    }

    const results = await db
      .select()
      .from(dustbins)
      .where(and(...conditions))
      .orderBy(desc(dustbins.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
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
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    const { name, type, locationName, latitude, longitude } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Name is required and must be a non-empty string', code: 'MISSING_NAME' },
        { status: 400 }
      );
    }

    if (!type || (type !== 'wet' && type !== 'dry')) {
      return NextResponse.json(
        { error: 'Type is required and must be either "wet" or "dry"', code: 'INVALID_TYPE' },
        { status: 400 }
      );
    }

    if (!locationName || typeof locationName !== 'string' || locationName.trim() === '') {
      return NextResponse.json(
        {
          error: 'Location name is required and must be a non-empty string',
          code: 'MISSING_LOCATION_NAME',
        },
        { status: 400 }
      );
    }

    if (!latitude || typeof latitude !== 'string' || latitude.trim() === '') {
      return NextResponse.json(
        { error: 'Latitude is required and must be a string', code: 'MISSING_LATITUDE' },
        { status: 400 }
      );
    }

    if (!longitude || typeof longitude !== 'string' || longitude.trim() === '') {
      return NextResponse.json(
        { error: 'Longitude is required and must be a string', code: 'MISSING_LONGITUDE' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const newDustbin = await db
      .insert(dustbins)
      .values({
        userId: user.id,
        name: name.trim(),
        type: type,
        locationName: locationName.trim(),
        latitude: latitude.trim(),
        longitude: longitude.trim(),
        fillLevel: 0,
        status: 'empty',
        isActive: true,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(newDustbin[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    const existingRecord = await db
      .select()
      .from(dustbins)
      .where(and(eq(dustbins.id, parseInt(id)), eq(dustbins.userId, user.id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json(
        { error: 'Dustbin not found', code: 'DUSTBIN_NOT_FOUND' },
        { status: 404 }
      );
    }

    const {
      fillLevel,
      status,
      name,
      locationName,
      latitude,
      longitude,
      lastCollectionDate,
      nextCollectionDate,
      isActive,
    } = body;

    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    if (fillLevel !== undefined) {
      if (typeof fillLevel !== 'number' || fillLevel < 0 || fillLevel > 100) {
        return NextResponse.json(
          { error: 'Fill level must be a number between 0 and 100', code: 'INVALID_FILL_LEVEL' },
          { status: 400 }
        );
      }
      updates.fillLevel = fillLevel;
    }

    if (status !== undefined) {
      if (!['empty', '25', '50', '75', 'full'].includes(status)) {
        return NextResponse.json(
          {
            error: 'Status must be one of: empty, 25, 50, 75, full',
            code: 'INVALID_STATUS',
          },
          { status: 400 }
        );
      }
      updates.status = status;
    }

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return NextResponse.json(
          { error: 'Name must be a non-empty string', code: 'INVALID_NAME' },
          { status: 400 }
        );
      }
      updates.name = name.trim();
    }

    if (locationName !== undefined) {
      if (typeof locationName !== 'string' || locationName.trim() === '') {
        return NextResponse.json(
          { error: 'Location name must be a non-empty string', code: 'INVALID_LOCATION_NAME' },
          { status: 400 }
        );
      }
      updates.locationName = locationName.trim();
    }

    if (latitude !== undefined) {
      if (typeof latitude !== 'string' || latitude.trim() === '') {
        return NextResponse.json(
          { error: 'Latitude must be a non-empty string', code: 'INVALID_LATITUDE' },
          { status: 400 }
        );
      }
      updates.latitude = latitude.trim();
    }

    if (longitude !== undefined) {
      if (typeof longitude !== 'string' || longitude.trim() === '') {
        return NextResponse.json(
          { error: 'Longitude must be a non-empty string', code: 'INVALID_LONGITUDE' },
          { status: 400 }
        );
      }
      updates.longitude = longitude.trim();
    }

    if (lastCollectionDate !== undefined) {
      updates.lastCollectionDate = lastCollectionDate;
    }

    if (nextCollectionDate !== undefined) {
      updates.nextCollectionDate = nextCollectionDate;
    }

    if (isActive !== undefined) {
      if (typeof isActive !== 'boolean' && isActive !== 0 && isActive !== 1) {
        return NextResponse.json(
          { error: 'isActive must be a boolean or 0/1', code: 'INVALID_IS_ACTIVE' },
          { status: 400 }
        );
      }
      updates.isActive = Boolean(isActive);
    }

    const updated = await db
      .update(dustbins)
      .set(updates)
      .where(and(eq(dustbins.id, parseInt(id)), eq(dustbins.userId, user.id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Dustbin not found', code: 'DUSTBIN_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existingRecord = await db
      .select()
      .from(dustbins)
      .where(and(eq(dustbins.id, parseInt(id)), eq(dustbins.userId, user.id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json(
        { error: 'Dustbin not found', code: 'DUSTBIN_NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .update(dustbins)
      .set({
        isActive: false,
        updatedAt: new Date().toISOString(),
      })
      .where(and(eq(dustbins.id, parseInt(id)), eq(dustbins.userId, user.id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Dustbin not found', code: 'DUSTBIN_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Dustbin soft deleted successfully',
        dustbin: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
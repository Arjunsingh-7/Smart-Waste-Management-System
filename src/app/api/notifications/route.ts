import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { notifications, dustbins } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED' 
      }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const isReadParam = searchParams.get('is_read');

    const conditions = [eq(notifications.userId, user.id)];
    if (isReadParam !== null) {
      conditions.push(eq(notifications.isRead, isReadParam === '1'));
    }

    const results = await db.select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt));

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED' 
      }, { status: 401 });
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { message, type, dustbin_id } = body;

    if (!message) {
      return NextResponse.json({ 
        error: "Message is required",
        code: "MISSING_MESSAGE" 
      }, { status: 400 });
    }

    if (!type) {
      return NextResponse.json({ 
        error: "Type is required",
        code: "MISSING_TYPE" 
      }, { status: 400 });
    }

    const validTypes = ['info', 'warning', 'alert'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ 
        error: "Type must be one of: info, warning, alert",
        code: "INVALID_TYPE" 
      }, { status: 400 });
    }

    if (dustbin_id !== undefined && dustbin_id !== null) {
      const dustbinExists = await db.select()
        .from(dustbins)
        .where(
          and(
            eq(dustbins.id, parseInt(dustbin_id)),
            eq(dustbins.userId, user.id)
          )
        )
        .limit(1);

      if (dustbinExists.length === 0) {
        return NextResponse.json({ 
          error: "Dustbin not found or does not belong to user",
          code: "INVALID_DUSTBIN" 
        }, { status: 400 });
      }
    }

    const newNotification = await db.insert(notifications)
      .values({
        userId: user.id,
        dustbinId: dustbin_id ? parseInt(dustbin_id) : null,
        message: message.trim(),
        type,
        isRead: false,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newNotification[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED' 
      }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const existing = await db.select()
      .from(notifications)
      .where(
        and(
          eq(notifications.id, parseInt(id)),
          eq(notifications.userId, user.id)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Notification not found',
        code: 'NOTIFICATION_NOT_FOUND' 
      }, { status: 404 });
    }

    const { message, type, is_read, dustbin_id } = body;

    if (type && !['info', 'warning', 'alert'].includes(type)) {
      return NextResponse.json({ 
        error: "Type must be one of: info, warning, alert",
        code: "INVALID_TYPE" 
      }, { status: 400 });
    }

    if (dustbin_id !== undefined && dustbin_id !== null) {
      const dustbinExists = await db.select()
        .from(dustbins)
        .where(
          and(
            eq(dustbins.id, parseInt(dustbin_id)),
            eq(dustbins.userId, user.id)
          )
        )
        .limit(1);

      if (dustbinExists.length === 0) {
        return NextResponse.json({ 
          error: "Dustbin not found or does not belong to user",
          code: "INVALID_DUSTBIN" 
        }, { status: 400 });
      }
    }

    const updates: any = {};
    if (message !== undefined) updates.message = message.trim();
    if (type !== undefined) updates.type = type;
    if (is_read !== undefined) updates.isRead = is_read === 1 || is_read === true;
    if (dustbin_id !== undefined) updates.dustbinId = dustbin_id ? parseInt(dustbin_id) : null;

    const updated = await db.update(notifications)
      .set(updates)
      .where(
        and(
          eq(notifications.id, parseInt(id)),
          eq(notifications.userId, user.id)
        )
      )
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ 
        error: 'Notification not found',
        code: 'NOTIFICATION_NOT_FOUND' 
      }, { status: 404 });
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED' 
      }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const existing = await db.select()
      .from(notifications)
      .where(
        and(
          eq(notifications.id, parseInt(id)),
          eq(notifications.userId, user.id)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Notification not found',
        code: 'NOTIFICATION_NOT_FOUND' 
      }, { status: 404 });
    }

    const deleted = await db.delete(notifications)
      .where(
        and(
          eq(notifications.id, parseInt(id)),
          eq(notifications.userId, user.id)
        )
      )
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ 
        error: 'Notification not found',
        code: 'NOTIFICATION_NOT_FOUND' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Notification deleted successfully',
      notification: deleted[0]
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}
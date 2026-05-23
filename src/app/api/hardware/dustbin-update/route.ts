import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { dustbins, notifications, user as users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { sendEmail, createWelcomeEmailTemplate } from '@/lib/email';

/**
 * Hardware API Endpoint - No Authentication Required
 * This endpoint receives data from Arduino/IoT devices
 * 
 * Expected Request:
 * POST /api/hardware/dustbin-update
 * Headers: X-API-Key: your-secret-key
 * Body: { dustbinId: number, fillLevel: number }
 */

export async function POST(request: NextRequest) {
  try {
    // Validate API Key
    const apiKey = request.headers.get('X-API-Key');
    const expectedKey = process.env.HARDWARE_API_KEY || 'default-hardware-key-123';
    
    if (!apiKey || apiKey !== expectedKey) {
      return NextResponse.json(
        { error: 'Invalid or missing API key', code: 'INVALID_API_KEY' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { dustbinId, wetLevel, dryLevel } = body;

    // Validate input
    if (!dustbinId || typeof dustbinId !== 'number') {
      return NextResponse.json(
        { error: 'Valid dustbinId is required', code: 'MISSING_DUSTBIN_ID' },
        { status: 400 }
      );
    }

    // Validate wet/dry levels
    if (wetLevel === undefined || typeof wetLevel !== 'number' || wetLevel < 0 || wetLevel > 100) {
      return NextResponse.json(
        { error: 'Wet level must be a number between 0 and 100', code: 'INVALID_WET_LEVEL' },
        { status: 400 }
      );
    }

    if (dryLevel === undefined || typeof dryLevel !== 'number' || dryLevel < 0 || dryLevel > 100) {
      return NextResponse.json(
        { error: 'Dry level must be a number between 0 and 100', code: 'INVALID_DRY_LEVEL' },
        { status: 400 }
      );
    }

    // Check if dustbin exists
    const existingDustbin = await db
      .select()
      .from(dustbins)
      .where(eq(dustbins.id, dustbinId))
      .limit(1);

    if (existingDustbin.length === 0) {
      return NextResponse.json(
        { error: 'Dustbin not found', code: 'DUSTBIN_NOT_FOUND' },
        { status: 404 }
      );
    }

    const dustbin = existingDustbin[0];

    // Map level to status string
    const mapStatus = (lvl: number) => {
      if (lvl >= 75) return 'full';
      if (lvl >= 50) return 'medium';
      if (lvl >= 25) return 'low';
      return 'empty';
    };

    const wetStatus = mapStatus(wetLevel);
    const dryStatus = mapStatus(dryLevel);

    // Keep legacy fillLevel/status as the max of the two compartments for backward compatibility
    const maxLevel = Math.max(wetLevel, dryLevel);
    const legacyStatus = maxLevel >= 75 ? 'full' : maxLevel >= 50 ? '75' : maxLevel >= 25 ? '50' : 'empty';

    const now = new Date().toISOString();
    const updated = await db
      .update(dustbins)
      .set({
        wetLevel,
        dryLevel,
        wetStatus,
        dryStatus,
        fillLevel: maxLevel,
        status: legacyStatus,
        updatedAt: now,
      })
      .where(eq(dustbins.id, dustbinId))
      .returning();

    // Notifications & emails for each compartment when threshold crossed (>=75)
    const checks = [
      { level: wetLevel, status: wetStatus, label: 'Wet', key: 'wet' },
      { level: dryLevel, status: dryStatus, label: 'Dry', key: 'dry' },
    ];

    for (const c of checks) {
      if (c.level >= 75 && dustbin.userId) {
        // Check for an existing unread alert for this dustbin and compartment
        const existing = await db
          .select()
          .from(notifications)
          .where(and(eq(notifications.dustbinId, dustbinId), eq(notifications.userId, dustbin.userId)))
          .orderBy(notifications.id, 'desc')
          .limit(5);

        const alreadyAlerted = existing.some((n) => n.message?.includes(`${c.label} waste`));

        if (!alreadyAlerted) {
          const message = `${dustbin.name} ${c.label} compartment is ${c.level}% full and requires immediate attention.`;
          await db.insert(notifications).values({
            userId: dustbin.userId,
            dustbinId: dustbinId,
            type: 'alert',
            message,
            isRead: false,
            createdAt: now,
          });

          // Send email alert to the user
          try {
            const u = await db.select().from(users).where(eq(users.id, dustbin.userId)).limit(1);
            const userRow = u?.[0];
            if (userRow?.email) {
              const subject = `⚠ Waste Wizard Alert – ${c.label} Compartment Requires Immediate Attention`;
              const html = `
                <div style="font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; max-width:600px; margin:0 auto; background:#fff; padding:24px">
                  <h2 style="color:#0f172a">⚠ ${c.label} Waste Alert</h2>
                  <p>Dear ${userRow.name || 'User'},</p>
                  <p>Your <strong>${c.label}</strong> waste compartment for <strong>${dustbin.locationName}</strong> has exceeded 75% capacity.</p>
                  <p><strong>Current Fill Level:</strong> ${c.level}%</p>
                  <p>Please empty the dustbin immediately to avoid overflow and related issues.</p>
                  <p>Regards,<br/>Waste Wizard Team</p>
                </div>
              `;

              // fire-and-forget email
              sendEmail({ to: userRow.email, subject, html }).catch((err) => console.error('Email send failed', err));
            }
          } catch (emailErr) {
            console.error('Failed to send alert email:', emailErr);
          }
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Dustbin updated successfully',
        data: {
          id: updated[0].id,
          wetLevel: updated[0].wetLevel,
          dryLevel: updated[0].dryLevel,
          wetStatus: updated[0].wetStatus,
          dryStatus: updated[0].dryStatus,
          fillLevel: updated[0].fillLevel,
          status: updated[0].status,
          updatedAt: updated[0].updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Hardware API error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json(
    {
      status: 'healthy',
      endpoint: 'hardware-dustbin-update',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userProfile, user } from '@/db/schema';
import { eq } from 'drizzle-orm';

const VALID_CATEGORIES = [
  'College',
  'Hospital',
  'Cafe',
  'Airport',
  'Municipal',
  'School',
  'Office',
  'Restaurant',
  'Others',
] as const;

function validateMobileNumber(mobile: string): boolean {
  const phoneRegex = /^\+?[\d\s-]{10,15}$/;
  return phoneRegex.test(mobile.trim());
}

/* ─── Welcome Email HTML ─────────────────────────────────────────────── */
function buildWelcomeEmail(orgName: string, dashboardLink: string): string {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Waste Wizard</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

          <!-- Header Bar -->
          <tr>
            <td style="background-color:#16C47F;padding:28px 40px;text-align:center;">
              <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:rgba(0,0,0,0.5);">Smart Waste Management</p>
              <h1 style="margin:8px 0 0;font-size:26px;font-weight:800;color:#0a0a0a;letter-spacing:-0.5px;">Waste Wizard</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;">Welcome aboard, ${orgName}! 🎉</h2>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#475569;">
                Thank you for registering with <strong style="color:#0f172a;">Waste Wizard</strong>. Your organization account is now active. You can start monitoring your smart dustbins, track real-time waste levels, and manage collections — all from your dashboard.
              </p>

              <!-- Feature Highlights -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td width="50%" style="padding-right:8px;padding-bottom:12px;vertical-align:top;">
                    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;">
                      <p style="margin:0 0 4px;font-size:18px;">📊</p>
                      <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#0f172a;">Real-time Dashboard</p>
                      <p style="margin:0;font-size:12px;color:#64748b;line-height:1.5;">Monitor bin levels and get instant alerts.</p>
                    </div>
                  </td>
                  <td width="50%" style="padding-left:8px;padding-bottom:12px;vertical-align:top;">
                    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;">
                      <p style="margin:0 0 4px;font-size:18px;">🔔</p>
                      <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#0f172a;">Smart Alerts</p>
                      <p style="margin:0;font-size:12px;color:#64748b;line-height:1.5;">Automated notifications when bins are full.</p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="padding-right:8px;vertical-align:top;">
                    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;">
                      <p style="margin:0 0 4px;font-size:18px;">🗺️</p>
                      <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#0f172a;">Map Tracking</p>
                      <p style="margin:0;font-size:12px;color:#64748b;line-height:1.5;">Visualize all your bins on an interactive map.</p>
                    </div>
                  </td>
                  <td width="50%" style="padding-left:8px;vertical-align:top;">
                    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;">
                      <p style="margin:0 0 4px;font-size:18px;">📈</p>
                      <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#0f172a;">Analytics</p>
                      <p style="margin:0;font-size:12px;color:#64748b;line-height:1.5;">Track collection history and waste trends.</p>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <div style="text-align:center;margin-bottom:32px;">
                <a href="${dashboardLink}"
                   style="display:inline-block;background-color:#16C47F;color:#ffffff;text-decoration:none;padding:14px 36px;font-size:15px;font-weight:700;border-radius:10px;letter-spacing:0.2px;">
                  Go to Dashboard →
                </a>
              </div>

              <!-- Support Note -->
              <p style="margin:0;font-size:13px;line-height:1.7;color:#64748b;border-top:1px solid #f1f5f9;padding-top:24px;">
                Need help getting started? Our support team is here for you.<br/>
                Email us at <a href="mailto:wastewizard24@gmail.com" style="color:#16C47F;text-decoration:none;font-weight:600;">wastewizard24@gmail.com</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
              <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#0f172a;">Waste Wizard</p>
              <p style="margin:0 0 12px;font-size:11px;color:#94a3b8;">Smart Waste Management Platform</p>
              <p style="margin:0;font-size:11px;color:#cbd5e1;">&copy; ${year} Waste Wizard. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/* Removed Super Admin alert email templates and notifications. */

/* ─── POST /api/user-profile ─────────────────────────────────────────── */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, organization_name, category, mobile_number } = body;

    // ── Validate required fields ──────────────────────────────────────
    if (!user_id || typeof user_id !== 'string' || user_id.trim() === '') {
      return NextResponse.json(
        { error: 'user_id is required and must be a non-empty string', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    if (!organization_name || typeof organization_name !== 'string' || organization_name.trim() === '') {
      return NextResponse.json(
        { error: 'organization_name is required and must be a non-empty string', code: 'MISSING_ORGANIZATION_NAME' },
        { status: 400 }
      );
    }

    if (!category || typeof category !== 'string' || category.trim() === '') {
      return NextResponse.json(
        { error: 'category is required and must be a non-empty string', code: 'MISSING_CATEGORY' },
        { status: 400 }
      );
    }

    if (!VALID_CATEGORIES.includes(category as typeof VALID_CATEGORIES[number])) {
      return NextResponse.json(
        {
          error: `category must be one of: ${VALID_CATEGORIES.join(', ')}`,
          code: 'INVALID_CATEGORY',
        },
        { status: 400 }
      );
    }

    if (!mobile_number || typeof mobile_number !== 'string' || mobile_number.trim() === '') {
      return NextResponse.json(
        { error: 'mobile_number is required and must be a non-empty string', code: 'MISSING_MOBILE_NUMBER' },
        { status: 400 }
      );
    }

    if (!validateMobileNumber(mobile_number)) {
      return NextResponse.json(
        { error: 'mobile_number must be a valid phone number (10-15 digits)', code: 'INVALID_MOBILE_NUMBER' },
        { status: 400 }
      );
    }

    // ── Check for duplicate profile ──────────────────────────────────
    const existingProfile = await db
      .select()
      .from(userProfile)
      .where(eq(userProfile.userId, user_id.trim()))
      .limit(1);

    if (existingProfile.length > 0) {
      return NextResponse.json(
        { error: 'Profile already exists for this user', code: 'PROFILE_EXISTS' },
        { status: 400 }
      );
    }

    // ── Create profile ────────────────────────────────────────────────
    const timestamp = new Date().toISOString();
    const newProfile = await db
      .insert(userProfile)
      .values({
        userId: user_id.trim(),
        organizationName: organization_name.trim(),
        category: category,
        mobileNumber: mobile_number.trim(),
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      .returning();

    // ── Fire-and-forget emails ────────────────────────────────────────
    // Registration is always successful regardless of email outcome.
    try {
      const registeringUser = await db
        .select({ email: user.email })
        .from(user)
        .where(eq(user.id, user_id.trim()))
        .limit(1);

      const userEmail = registeringUser[0]?.email;

      if (userEmail) {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const { sendEmail } = await import('@/lib/email');

        // Welcome email to the new organization
        sendEmail({
          to: userEmail,
          subject: `Welcome to Waste Wizard 🚀`,
          html: buildWelcomeEmail(organization_name.trim(), `${baseUrl}/dashboard`),
        }).catch((e) => console.error('[email] Welcome email failed:', e));

        // No super-admin alerts: system is organization-only.
      }
    } catch (emailErr) {
      // Email failure must never break registration
      console.error('[email] Email workflow error:', emailErr);
    }

    return NextResponse.json(newProfile[0], { status: 201 });
  } catch (error) {
    console.error('[user-profile] POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

/* ─── PUT /api/user-profile ────────────────────────────────────────── */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, organization_name, category, mobile_number } = body;

    if (!user_id || typeof user_id !== 'string' || user_id.trim() === '') {
      return NextResponse.json({ error: 'user_id is required', code: 'MISSING_USER_ID' }, { status: 400 });
    }

    // Fetch existing profile
    const existing = await db.select().from(userProfile).where(eq(userProfile.userId, user_id.trim())).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Profile not found', code: 'PROFILE_NOT_FOUND' }, { status: 404 });
    }

    const updates: any = {};
    if (organization_name && typeof organization_name === 'string') updates.organizationName = organization_name.trim();
    if (category && typeof category === 'string') updates.category = category;
    if (mobile_number && typeof mobile_number === 'string') updates.mobileNumber = mobile_number.trim();

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updatable fields provided' }, { status: 400 });
    }

    updates.updatedAt = new Date().toISOString();

    const result = await db.update(userProfile).set(updates).where(eq(userProfile.userId, user_id.trim())).returning();

    return NextResponse.json(result[0], { status: 200 });
  } catch (error) {
    console.error('[user-profile] PUT error:', error);
    return NextResponse.json({ error: 'Internal server error: ' + (error as Error).message }, { status: 500 });
  }
}

/* ─── GET /api/user-profile?user_id=… ───────────────────────────────── */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId || userId.trim() === '') {
      return NextResponse.json(
        { error: 'user_id query parameter is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    const profile = await db
      .select()
      .from(userProfile)
      .where(eq(userProfile.userId, userId.trim()))
      .limit(1);

    if (profile.length === 0) {
      return NextResponse.json(
        { error: 'Profile not found for the specified user_id', code: 'PROFILE_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(profile[0], { status: 200 });
  } catch (error) {
    console.error('[user-profile] GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
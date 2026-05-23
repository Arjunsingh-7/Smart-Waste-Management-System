import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, createWelcomeEmailTemplate } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { organizationName, email } = await request.json();

    if (!organizationName || !email) {
      return NextResponse.json(
        { error: 'Organization name and email are required' },
        { status: 400 }
      );
    }

    // Create professional welcome email
    const emailHtml = createWelcomeEmailTemplate(organizationName, email);
    
    const result = await sendEmail({
      to: email,
      subject: 'Welcome to Waste Wizard 🚀',
      html: emailHtml,
    });

    if (!result.success) {
      console.error('[welcome-email] Failed to send welcome email:', result.error);
      // Don't fail the registration if email fails
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Welcome email sent successfully',
      emailId: result.data?.id 
    });

  } catch (error) {
    console.error('[welcome-email] API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
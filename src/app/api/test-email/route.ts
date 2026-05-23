import { NextRequest, NextResponse } from 'next/server';
import { sendTestEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log("[test-email] Testing email to:", email);

    const result = await sendTestEmail(email);

    if (!result.success) {
      console.error('[test-email] Failed to send test email:', result.error);
      return NextResponse.json(
        { 
          success: false, 
          error: result.error,
          message: 'Failed to send test email'
        },
        { status: 500 }
      );
    }

    console.log('[test-email] Test email sent successfully:', result.data?.id);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test email sent successfully',
      emailId: result.data?.id 
    });

  } catch (error) {
    console.error('[test-email] API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}
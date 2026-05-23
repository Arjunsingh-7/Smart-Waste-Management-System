import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log("=== EMAIL DEBUG INFO ===");
    console.log("RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY);
    console.log("RESEND_API_KEY length:", process.env.RESEND_API_KEY?.length || 0);
    console.log("EMAIL_FROM:", process.env.EMAIL_FROM);
    console.log("NEXT_PUBLIC_SITE_URL:", process.env.NEXT_PUBLIC_SITE_URL);
    
    // Test Resend API directly
    const apiKey = process.env.RESEND_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({
        error: "RESEND_API_KEY not found in environment variables",
        debug: {
          hasApiKey: false,
          emailFrom: process.env.EMAIL_FROM,
          siteUrl: process.env.NEXT_PUBLIC_SITE_URL
        }
      }, { status: 500 });
    }

    // Test API key validity by making a simple request
    const testResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "onboarding@resend.dev",
        to: "test@example.com", // This will fail but test API key validity
        subject: "Test",
        html: "<p>Test</p>",
      }),
    });

    const testResult = await testResponse.text();
    console.log("Resend API test response:", testResponse.status, testResult);

    return NextResponse.json({
      success: true,
      debug: {
        hasApiKey: true,
        apiKeyLength: apiKey.length,
        emailFrom: process.env.EMAIL_FROM,
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
        resendApiStatus: testResponse.status,
        resendApiResponse: testResult
      }
    });

  } catch (error) {
    console.error("Email debug error:", error);
    return NextResponse.json({
      error: "Debug failed",
      details: error
    }, { status: 500 });
  }
}
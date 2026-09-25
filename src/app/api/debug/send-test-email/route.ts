import { sendTestEmail } from "@/lib/email";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const to = body?.to || process.env.EMAIL_FROM || process.env.RESEND_TEST_TO;
    if (!to) {
      return NextResponse.json({ success: false, error: "No recipient specified" }, { status: 400 });
    }

    console.log("[debug] Sending test email to:", to);
    const result = await sendTestEmail(to);
    if (!result.success) {
      console.error("[debug] sendTestEmail failed:", result.error);
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("[debug] Error in /api/debug/send-test-email:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

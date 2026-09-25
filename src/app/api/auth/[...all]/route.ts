import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";

const handler = toNextJsHandler(auth);

export async function GET(request: NextRequest) {
  try {
    return await handler.GET(request);
  } catch (error) {
    console.error("[Auth API Error - GET]:", error);
    return NextResponse.json(
      { error: "Internal Auth Error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    return await handler.POST(request);
  } catch (error) {
    console.error("[Auth API Error - POST]:", error);
    return NextResponse.json(
      { error: "Internal Auth Error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
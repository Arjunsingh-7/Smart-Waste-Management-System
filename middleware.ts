import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.clone().pathname;

  // Allow dev and static assets, images, and _next
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Allow all API routes to proceed (they handle their own auth checks)
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Public pages that don't require auth
  const PUBLIC_PAGES = ["/", "/login", "/register", "/pricing", "/privacy", "/terms"];
  if (PUBLIC_PAGES.includes(pathname)) {
    return NextResponse.next();
  }

  // Protect dashboard routes: require an active session
  const protectedRoutes = ["/dashboard", "/analytics", "/collections", "/devices", "/myaccount", "/notifications"];
  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));

  if (isProtected) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/analytics/:path*",
    "/collections/:path*",
    "/devices/:path*",
    "/myaccount/:path*",
    "/notifications/:path*",
  ],
};
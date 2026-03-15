import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/", "/api/auth"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if (isPublic) {
    return NextResponse.next();
  }

  const idToken = req.cookies.get("firebase-id-token")?.value;

  if (!idToken) {
    const loginUrl = new URL("/", req.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/upload/:path*", "/quiz/:path*", "/scores"],
};


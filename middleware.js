import { NextResponse } from "next/server";

const AUTH_WHITELIST = ["/login", "/registerxyz", "/_next", "/api/auth"];

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Allow assets, auth endpoints, and Next internals
  if (
    AUTH_WHITELIST.some((path) => pathname.startsWith(path)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Prevent logged-in users from visiting auth pages
  if (pathname === "/login" || pathname === "/registerxyz") {
    const url = req.nextUrl.clone();
    url.pathname = "/invoices";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};

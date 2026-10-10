import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("authToken")?.value;
  const { pathname } = request.nextUrl;

  // Protected routes
  const protectedRoutes = [
    "/dashboard",
    "/checkout",
    "/orders",
    "/wishlist",
    "/notifications",
    "/settings",
    "/messages",
  ];

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // If route is protected and no token, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is logged in and trying to access auth pages, redirect to dashboard
  if (token && pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/dashboard/buyer", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/wishlist",
    "/notifications",
    "/settings/:path*",
    "/messages/:path*",
    "/auth/:path*",
  ],
};

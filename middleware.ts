// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Pasar pathname y searchParams en headers custom para que los layout los usen
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  requestHeaders.set("x-search-params", request.nextUrl.search.slice(1)); // sin el ?

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

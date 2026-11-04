import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

// Optimistic redirect only — real authorization happens in every page/route via getViewer().
export function proxy(request: NextRequest) {
  const signedIn = Boolean(getSessionCookie(request));
  const { pathname } = request.nextUrl;
  if (!signedIn && pathname !== "/login") return NextResponse.redirect(new URL("/login", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:png|jpg|svg|webp)$).*)"],
};

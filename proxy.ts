import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@insforge/sdk/ssr/middleware";

function isProtectedPath(pathname: string) {
  return (
    pathname === "/dashboard" ||
    pathname === "/profile" ||
    pathname.startsWith("/find-jobs")
  );
}

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });

  const { accessToken } = await updateSession({
    requestCookies: {
      get: (name: string) => request.cookies.get(name)?.value ?? null,
    },
    responseCookies: response.cookies,
  });

  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return response;
  }

  if (!accessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.png|images/|api/).*)",
  ],
};

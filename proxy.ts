import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@insforge/sdk/ssr/middleware";
import { createServerClient } from "@insforge/sdk/ssr";

function isProtectedPath(pathname: string) {
  return (
    pathname === "/dashboard" ||
    pathname === "/profile" ||
    pathname.startsWith("/find-jobs")
  );
}

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });

  await updateSession({
    requestCookies: {
      get: (name: string) => request.cookies.get(name)?.value ?? null,
    },
    responseCookies: response.cookies,
  });

  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return response;
  }

  const insforge = createServerClient({
    cookies: {
      get: (name: string) => response.cookies.get(name)?.value ?? null,
    },
  });

  const { data } = await insforge.auth.getCurrentUser();

  if (!data?.user) {
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

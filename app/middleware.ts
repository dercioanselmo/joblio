import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@insforge/sdk/ssr";

const protectedRoutes = ["/dashboard", "/profile", "/find-jobs"];

function isProtectedPath(pathname: string) {
  return (
    pathname === "/dashboard" ||
    pathname === "/profile" ||
    pathname.startsWith("/find-jobs")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const insforge = createServerClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
    cookies: {
      get: (name: string) => request.cookies.get(name)?.value ?? null,
    },
  });

  try {
    const { data: user } = await insforge.auth.getCurrentUser();

    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  } catch (error) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/dashboard", "/profile", "/find-jobs", "/find-jobs/:path*"],
};

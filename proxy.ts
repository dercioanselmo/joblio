import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@insforge/sdk/ssr/middleware";
import type { CookieOptions } from "@insforge/sdk/ssr/middleware";

function isProtectedPath(pathname: string) {
  return (
    pathname === "/dashboard" ||
    pathname === "/profile" ||
    pathname.startsWith("/find-jobs")
  );
}

// CookieWriter.set is overloaded (name/value/options, or a single {name,
// value, ...options} object) — updateSession()'s own setCookie() helper
// only ever calls the 3-arg form, but the exported type still requires both
// overloads to be implemented, so this normalizes either call shape.
function normalizeSetArgs(
  nameOrOptions: string | ({ name: string; value: string } & CookieOptions),
  value?: string,
  options?: CookieOptions,
): { name: string; value: string; options?: CookieOptions } {
  if (typeof nameOrOptions === "string") {
    return { name: nameOrOptions, value: value ?? "", options };
  }
  const { name, value: v, ...rest } = nameOrOptions;
  return { name, value: v, options: rest };
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  // updateSession() refreshes an expiring access token by calling
  // setAuthCookies() on BOTH requestCookies and responseCookies internally
  // (node_modules/@insforge/sdk/dist/ssr/update-session.ts) — not just
  // responseCookies. A requestCookies with only `.get()` makes that internal
  // `.set()` call a silent no-op (the library guards with
  // `if (!cookies?.set) return`), so a refreshed token only ever reached the
  // browser for the *next* navigation. Every Server Component rendered in
  // *this* request (Navbar, page-level auth checks) still read the stale,
  // already-expired cookie via next/headers — which is what was producing
  // the reported infinite refetch: each request looked unauthenticated to
  // the page even though the middleware itself had a valid, freshly-issued
  // token. Rebuilding `response` from the mutated `request` on every write
  // is the documented pattern for this exact problem in Next.js middleware
  // (same shape as Supabase's official `@supabase/ssr` middleware example).
  const { accessToken } = await updateSession({
    requestCookies: {
      get: (name: string) => request.cookies.get(name)?.value ?? null,
      set: (
        nameOrOptions: string | ({ name: string; value: string } & CookieOptions),
        value?: string,
        options?: CookieOptions,
      ) => {
        const args = normalizeSetArgs(nameOrOptions, value, options);
        request.cookies.set(args.name, args.value);
        response = NextResponse.next({ request });
      },
    },
    responseCookies: {
      get: (name: string) => response.cookies.get(name)?.value ?? null,
      set: (
        nameOrOptions: string | ({ name: string; value: string } & CookieOptions),
        value?: string,
        options?: CookieOptions,
      ) => {
        const args = normalizeSetArgs(nameOrOptions, value, options);
        response.cookies.set(args.name, args.value, args.options);
      },
    },
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

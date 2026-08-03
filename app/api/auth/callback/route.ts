import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { createAuthActions } from "@insforge/sdk/ssr";

const CODE_VERIFIER_COOKIE = "insforge_code_verifier";
const POST_LOGIN_REDIRECT_COOKIE = "post_login_redirect";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("insforge_code");
  const oauthError = request.nextUrl.searchParams.get("error");

  const cookieStore = await cookies();
  const destination = cookieStore.get(POST_LOGIN_REDIRECT_COOKIE)?.value || "/dashboard";

  if (oauthError || !code) {
    if (oauthError) {
      console.warn("OAuth callback failed", { error: oauthError });
    }
    return NextResponse.redirect(new URL("/login?error=oauth_failed", request.url));
  }

  const codeVerifier = cookieStore.get(CODE_VERIFIER_COOKIE)?.value;
  if (!codeVerifier) {
    return NextResponse.redirect(new URL("/login?error=missing_verifier", request.url));
  }

  const response = NextResponse.redirect(new URL(destination, request.url));
  const auth = createAuthActions({
    requestCookies: request.cookies,
    responseCookies: response.cookies,
  });

  const { data, error } = await auth.exchangeOAuthCode(code, codeVerifier);
  if (error || !data?.user) {
    if (error) {
      console.error("OAuth code exchange failed", error);
    }
    return NextResponse.redirect(new URL("/login?error=exchange_failed", request.url));
  }

  response.cookies.delete(CODE_VERIFIER_COOKIE);
  response.cookies.delete(POST_LOGIN_REDIRECT_COOKIE);

  return response;
}

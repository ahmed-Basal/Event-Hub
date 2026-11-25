import { NextRequest, NextResponse } from 'next/server';
import {
  createSessionWithBackendSync,
  decryptPayload,
  getKeycloakConfig,
  getPublicOrigin,
  type KeycloakTokenResponse,
  PKCE_COOKIE_NAME,
  type PkceCookieData,
  setSessionCookie,
} from '@/core/auth/bffSession';

export async function GET(request: NextRequest) {
  const origin = getPublicOrigin(request);
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const pkceCookie = request.cookies.get(PKCE_COOKIE_NAME)?.value;

  if (!code || !state || !pkceCookie) {
    return NextResponse.redirect(new URL('/login?error=invalid_callback', origin));
  }

  const pkce = decryptPayload<PkceCookieData>(pkceCookie);
  if (!pkce || pkce.state !== state) {
    return NextResponse.redirect(new URL('/login?error=state_mismatch', origin));
  }

  const { internalIssuer, clientId } = getKeycloakConfig();
  const redirectUri = `${origin}/api/auth/callback`;

  const tokenRes = await fetch(`${internalIssuer}/protocol/openid-connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      code,
      redirect_uri: redirectUri,
      code_verifier: pkce.codeVerifier,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL('/login?error=token_exchange_failed', origin));
  }

  const tokens = (await tokenRes.json()) as KeycloakTokenResponse;
  const session = await createSessionWithBackendSync(tokens);

  const response = NextResponse.redirect(new URL(pkce.returnTo || '/activities', origin));
  response.cookies.delete(PKCE_COOKIE_NAME);
  setSessionCookie(response, session, origin);

  return response;
}

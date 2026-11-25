import { NextRequest, NextResponse } from 'next/server';
import {
  type BffSessionData,
  decryptPayload,
  getKeycloakConfig,
  getPublicOrigin,
  SESSION_COOKIE_NAME,
} from '@/core/auth/bffSession';

export async function GET(request: NextRequest) {
  const { publicIssuer, clientId } = getKeycloakConfig();
  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = cookie ? decryptPayload<BffSessionData>(cookie) : null;
  const origin = getPublicOrigin(request);

  const logoutUrl = new URL(`${publicIssuer}/protocol/openid-connect/logout`);
  logoutUrl.searchParams.set('client_id', clientId);
  logoutUrl.searchParams.set('post_logout_redirect_uri', `${origin}/login`);
  if (session?.idToken) {
    logoutUrl.searchParams.set('id_token_hint', session.idToken);
  }

  const response = NextResponse.redirect(logoutUrl);
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}

export async function POST(request: NextRequest) {
  const { internalIssuer, clientId } = getKeycloakConfig();
  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = cookie ? decryptPayload<BffSessionData>(cookie) : null;

  if (session?.refreshToken) {
    try {
      await fetch(`${internalIssuer}/protocol/openid-connect/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          refresh_token: session.refreshToken,
        }),
        cache: 'no-store',
      });
    } catch {
      // Best-effort Keycloak session revocation
    }
  }

  const response = NextResponse.json({ ok: true }, { status: 200 });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}

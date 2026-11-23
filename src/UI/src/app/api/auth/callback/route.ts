import { NextRequest, NextResponse } from 'next/server';
import {
  type BffSessionData,
  decryptPayload,
  encryptPayload,
  getKeycloakConfig,
  PKCE_COOKIE_NAME,
  type PkceCookieData,
  SESSION_COOKIE_NAME,
} from '@/core/auth/bffSession';

function decodeJwtPayload(jwt: string): Record<string, any> {
  const parts = jwt.split('.');
  if (parts.length < 2) return {};
  return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const pkceCookie = request.cookies.get(PKCE_COOKIE_NAME)?.value;

  if (!code || !state || !pkceCookie) {
    return NextResponse.redirect(new URL('/login?error=invalid_callback', request.url));
  }

  const pkce = decryptPayload<PkceCookieData>(pkceCookie);
  if (!pkce || pkce.state !== state) {
    return NextResponse.redirect(new URL('/login?error=state_mismatch', request.url));
  }

  const { internalIssuer, clientId } = getKeycloakConfig();
  const redirectUri = `${request.nextUrl.origin}/api/auth/callback`;

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
    return NextResponse.redirect(new URL('/login?error=token_exchange_failed', request.url));
  }

  const tokens = (await tokenRes.json()) as {
    access_token: string;
    refresh_token?: string;
    id_token?: string;
    expires_in: number;
  };

  const claims = decodeJwtPayload(tokens.access_token);
  const realmRoles: string[] = Array.isArray(claims.roles)
    ? claims.roles
    : Array.isArray(claims.realm_access?.roles)
      ? claims.realm_access.roles
      : [];

  const session: BffSessionData = {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    idToken: tokens.id_token,
    expiresAt: Date.now() + (tokens.expires_in ?? 300) * 1000,
    user: {
      id: String(claims.sub ?? ''),
      username: String(claims.preferred_username ?? claims.email ?? ''),
      email: String(claims.email ?? ''),
      displayName: String(claims.name ?? claims.preferred_username ?? 'User'),
      roles: realmRoles,
    },
  };

  const response = NextResponse.redirect(new URL(pkce.returnTo || '/activities', request.url));
  response.cookies.delete(PKCE_COOKIE_NAME);
  response.cookies.set(SESSION_COOKIE_NAME, encryptPayload(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}

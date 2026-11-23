import { NextRequest, NextResponse } from 'next/server';
import {
  encryptPayload,
  generatePkcePair,
  getKeycloakConfig,
  PKCE_COOKIE_NAME,
} from '@/core/auth/bffSession';

export async function GET(request: NextRequest) {
  const { publicIssuer, clientId } = getKeycloakConfig();
  const { codeVerifier, state, codeChallenge } = generatePkcePair();

  const returnTo = request.nextUrl.searchParams.get('returnTo') || '/activities';
  const safeReturnTo = returnTo.startsWith('/') ? returnTo : '/activities';
  const redirectUri = `${request.nextUrl.origin}/api/auth/callback`;

  const authUrl = new URL(`${publicIssuer}/protocol/openid-connect/auth`);
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid profile email');
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('code_challenge', codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');
  authUrl.searchParams.set('state', state);

  const response = NextResponse.redirect(authUrl);
  response.cookies.set(
    PKCE_COOKIE_NAME,
    encryptPayload({ codeVerifier, state, returnTo: safeReturnTo }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 300,
    }
  );

  return response;
}

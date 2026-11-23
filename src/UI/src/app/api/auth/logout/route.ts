import { NextRequest, NextResponse } from 'next/server';
import {
  type BffSessionData,
  decryptPayload,
  getKeycloakConfig,
  SESSION_COOKIE_NAME,
} from '@/core/auth/bffSession';

export async function GET(request: NextRequest) {
  const { publicIssuer, clientId } = getKeycloakConfig();
  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = cookie ? decryptPayload<BffSessionData>(cookie) : null;

  const logoutUrl = new URL(`${publicIssuer}/protocol/openid-connect/logout`);
  logoutUrl.searchParams.set('client_id', clientId);
  logoutUrl.searchParams.set('post_logout_redirect_uri', `${request.nextUrl.origin}/login`);
  if (session?.idToken) {
    logoutUrl.searchParams.set('id_token_hint', session.idToken);
  }

  const response = NextResponse.redirect(logoutUrl);
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}

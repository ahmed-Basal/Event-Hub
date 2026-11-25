import { NextRequest, NextResponse } from 'next/server';
import {
  createSessionWithBackendSync,
  encryptPayload,
  exchangePasswordGrant,
  generatePkcePair,
  getKeycloakConfig,
  getPublicOrigin,
  PKCE_COOKIE_NAME,
  setSessionCookie,
} from '@/core/auth/bffSession';
import { loginSchema } from '@modules/identity/schemas/authSchemas';

export async function GET(request: NextRequest) {
  const { publicIssuer, clientId } = getKeycloakConfig();
  const { codeVerifier, state, codeChallenge } = generatePkcePair();

  const returnTo = request.nextUrl.searchParams.get('returnTo') || '/activities';
  const safeReturnTo = returnTo.startsWith('/') ? returnTo : '/activities';
  const origin = getPublicOrigin(request);
  const redirectUri = `${origin}/api/auth/callback`;

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
      secure: origin.startsWith('https://'),
      sameSite: 'lax',
      path: '/',
      maxAge: 300,
    }
  );

  return response;
}

export async function POST(request: NextRequest) {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(rawBody);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message || 'Email/username and password are required.';
    return NextResponse.json({ message: firstError }, { status: 400 });
  }

  const grantResult = await exchangePasswordGrant(parsed.data.email, parsed.data.password);
  if (!grantResult.ok) {
    if (grantResult.error === 'invalid_grant' || grantResult.status === 401) {
      return NextResponse.json(
        { message: 'Invalid email/username or password.' },
        { status: 401 }
      );
    }

    if (grantResult.status === 503) {
      return NextResponse.json(
        { message: 'Authentication service is temporarily unavailable.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { message: grantResult.errorDescription || 'Unable to sign in. Please try again.' },
      { status: grantResult.status >= 400 ? grantResult.status : 400 }
    );
  }

  const session = await createSessionWithBackendSync(grantResult.tokens);
  const response = NextResponse.json({ user: session.user }, { status: 200 });
  setSessionCookie(response, session, getPublicOrigin(request));
  return response;
}

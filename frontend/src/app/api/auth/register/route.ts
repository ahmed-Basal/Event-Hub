import { NextRequest, NextResponse } from 'next/server';
import {
  createSessionWithBackendSync,
  exchangePasswordGrant,
  getKeycloakAdminConfig,
  getKeycloakAdminToken,
  getPublicOrigin,
  setSessionCookie,
} from '@/core/auth/bffSession';
import { registerPayloadSchema } from '@modules/identity/schemas/authSchemas';

export async function POST(request: NextRequest) {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = registerPayloadSchema.safeParse(rawBody);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message || 'Please check your registration details.';
    return NextResponse.json({ message: firstError }, { status: 400 });
  }

  const adminToken = await getKeycloakAdminToken();
  if (!adminToken) {
    return NextResponse.json(
      { message: 'Registration service is temporarily unavailable.' },
      { status: 503 }
    );
  }

  const { displayName, username, email, password } = parsed.data;
  const nameParts = displayName.trim().split(/\s+/);
  const firstName = nameParts[0] || username;
  const lastName = nameParts.slice(1).join(' ');

  const { baseUrl, realm } = getKeycloakAdminConfig();

  try {
    const createRes = await fetch(
      `${baseUrl}/admin/realms/${encodeURIComponent(realm)}/users`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email: email.toLowerCase(),
          firstName,
          lastName,
          enabled: true,
          emailVerified: true,
          credentials: [
            {
              type: 'password',
              value: password,
              temporary: false,
            },
          ],
        }),
        cache: 'no-store',
      }
    );

    if (createRes.status === 409) {
      return NextResponse.json(
        { message: 'An account with this email or username already exists.' },
        { status: 409 }
      );
    }

    if (!createRes.ok) {
      const errBody = (await createRes.json().catch(() => ({}))) as {
        errorMessage?: string;
        error?: string;
      };
      return NextResponse.json(
        { message: errBody.errorMessage || errBody.error || 'Could not create account.' },
        { status: createRes.status >= 400 ? createRes.status : 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { message: 'Registration service is temporarily unavailable.' },
      { status: 503 }
    );
  }

  const grantResult = await exchangePasswordGrant(username, password);
  if (!grantResult.ok) {
    return NextResponse.json(
      {
        message:
          grantResult.errorDescription ||
          'Account created, but automatic sign-in failed. Please sign in manually.',
      },
      { status: 400 }
    );
  }

  const session = await createSessionWithBackendSync(grantResult.tokens);
  const response = NextResponse.json({ user: session.user }, { status: 201 });
  setSessionCookie(response, session, getPublicOrigin(request));
  return response;
}

import { NextRequest, NextResponse } from 'next/server';
import {
  getKeycloakAdminConfig,
  getKeycloakAdminToken,
  getKeycloakConfig,
  getPublicOrigin,
} from '@/core/auth/bffSession';
import { forgotPasswordSchema } from '@modules/identity/schemas/authSchemas';

const SAFE_CONFIRMATION_MESSAGE =
  'If an account exists for that email, a password reset link has been sent.';

export async function POST(request: NextRequest) {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = forgotPasswordSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message || 'Please enter a valid email address.' },
      { status: 400 }
    );
  }

  const email = parsed.data.email.toLowerCase();
  const { publicIssuer, clientId } = getKeycloakConfig();
  const { baseUrl, realm } = getKeycloakAdminConfig();
  const origin = getPublicOrigin(request);
  const fallbackResetUrl = `${publicIssuer}/login-actions/reset-credentials?client_id=${encodeURIComponent(clientId)}`;

  let emailSent = false;
  const adminToken = await getKeycloakAdminToken();

  if (adminToken) {
    try {
      const usersRes = await fetch(
        `${baseUrl}/admin/realms/${encodeURIComponent(realm)}/users?email=${encodeURIComponent(email)}&exact=true`,
        {
          headers: { Authorization: `Bearer ${adminToken}` },
          cache: 'no-store',
        }
      );

      if (usersRes.ok) {
        const users = (await usersRes.json()) as Array<{ id?: string }>;
        const userId = users[0]?.id;

        if (userId) {
          const redirectUri = `${origin}/login`;
          const actionRes = await fetch(
            `${baseUrl}/admin/realms/${encodeURIComponent(realm)}/users/${encodeURIComponent(userId)}/execute-actions-email?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}`,
            {
              method: 'PUT',
              headers: {
                Authorization: `Bearer ${adminToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(['UPDATE_PASSWORD']),
              cache: 'no-store',
            }
          );
          emailSent = actionRes.ok;
        }
      }
    } catch {
      emailSent = false;
    }
  }

  return NextResponse.json(
    {
      message: SAFE_CONFIRMATION_MESSAGE,
      ...(emailSent ? {} : { resetUrl: fallbackResetUrl }),
    },
    { status: 200 }
  );
}

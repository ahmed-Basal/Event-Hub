import { Suspense } from 'react';
import type { Metadata } from 'next';
import LoginForm from '@modules/identity/components/LoginForm';
import { tokens } from '@/theme/tokens';

export const metadata: Metadata = {
  title: 'Sign In | DevMeet',
  description: 'Sign in to your DevMeet account.',
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            maxWidth: 460,
            height: 440,
            margin: '40px auto',
            borderRadius: 20,
            backgroundColor: tokens.surface,
            border: `1px solid ${tokens.border}`,
          }}
        />
      }
    >
      <LoginForm />
    </Suspense>
  );
}

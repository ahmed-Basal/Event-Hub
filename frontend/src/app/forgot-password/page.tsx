import type { Metadata } from 'next';
import ForgotPasswordForm from '@modules/identity/components/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Forgot Password | DevMeet',
  description: 'Reset your DevMeet account password.',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}

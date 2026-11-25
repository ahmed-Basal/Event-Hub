import type { Metadata } from 'next';
import RegisterForm from '@modules/identity/components/RegisterForm';

export const metadata: Metadata = {
  title: 'Create Account | DevMeet',
  description: 'Register a new DevMeet account.',
};

export default function RegisterPage() {
  return <RegisterForm />;
}

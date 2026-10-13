import type { Metadata } from 'next';
import AccountClient from './AccountClient';

export const metadata: Metadata = { title: 'Your account — 1000SQUARES' };

export default function AccountPage() {
  return <AccountClient />;
}

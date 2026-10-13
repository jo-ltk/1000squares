import type { Metadata } from 'next';
import ListingClient from './ListingClient';

export const metadata: Metadata = {
  title: 'Wedding invitations — 1000SQUARES',
  description: 'Browse wedding invitation, save-the-date and engagement templates you can customise and send today.'
};

export default function TemplatesPage() {
  return <ListingClient />;
}

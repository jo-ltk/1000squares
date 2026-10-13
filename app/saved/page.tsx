import type { Metadata } from 'next';
import SavedClient from './SavedClient';

export const metadata: Metadata = { title: 'Saved templates — 1000SQUARES' };

export default function SavedPage() {
  return <SavedClient />;
}

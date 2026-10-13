// Sample catalogue for the supplied design mockups. Replace with a CMS or API when one is available.
export type Template = {
  id: string;
  title: string;
  price: number;
  category: string;
  style: string;
  tint: string;
  tintKey: number;
  tone?: 'dark' | 'rust' | '';
  names: string;
  kicker: string;
  rank: number;
  age: number;
  saved?: boolean;
  formats?: TemplateFormat[];
  when: string;
  meta?: string;
};

export type TemplateFormat = 'digital' | 'print';
export type Tint = { label: string; color: string };

export const TEMPLATES: Template[] = [
  { id: 'rose-garden-suite', title: 'Rose garden suite', price: 499, category: 'Wedding invitations', style: 'Floral', tint: '#ffe9d4', tintKey: 0, tone: '', names: 'Ananya & Rohan', kicker: 'Together with their families', rank: 1, age: 4, when: '14 Feb 2027 · Udaipur' },
  { id: 'midnight-vows', title: 'Midnight vows', price: 649, category: 'Wedding invitations', style: 'Modern', tint: '#121212', tintKey: 3, tone: 'dark', names: 'Isha & Dev', kicker: 'You are invited', rank: 2, age: 2, saved: true, when: '03 Dec 2026 · Mumbai' },
  { id: 'terracotta-sun', title: 'Terracotta sun', price: 399, category: 'Wedding invitations', style: 'Traditional', tint: '#bc4324', tintKey: 4, tone: 'rust', names: 'Zara & Arjun', kicker: 'Shubh vivah', rank: 3, age: 1, when: '21 Jan 2027 · Jaipur' },
  { id: 'quiet-linen', title: 'Quiet linen', price: 349, category: 'Wedding invitations', style: 'Minimal', tint: '#f2f1ef', tintKey: 5, tone: '', names: 'Nora & Vikram', kicker: 'Please join us', rank: 4, age: 9, when: '09 Nov 2026 · Bengaluru' },
  { id: 'apricot-bloom', title: 'Apricot bloom', price: 449, category: 'Wedding invitations', style: 'Floral', tint: '#ffe1cc', tintKey: 1, tone: '', names: 'Riya & Kunal', kicker: 'Together with their families', rank: 5, age: 6, when: '06 Mar 2027 · Goa' },
  { id: 'marigold-arch', title: 'Marigold arch', price: 549, category: 'Wedding invitations', style: 'Traditional', tint: '#ffd0b4', tintKey: 2, tone: '', names: 'Priya & Sameer', kicker: 'Shubh vivah', rank: 6, age: 3, when: '18 Feb 2027 · Jodhpur' },
  { id: 'grid-and-grace', title: 'Grid & grace', price: 399, category: 'Wedding invitations', style: 'Modern', tint: '#ffe9d4', tintKey: 0, tone: '', names: 'Leah & Omar', kicker: 'Save our day', rank: 7, age: 5, when: '27 Nov 2026 · Delhi' },
  { id: 'ink-letterpress', title: 'Ink letterpress', price: 699, category: 'Wedding invitations', style: 'Minimal', tint: '#121212', tintKey: 3, tone: 'dark', names: 'Tara & Neil', kicker: 'Request the pleasure', rank: 8, age: 11, when: '12 Dec 2026 · Kochi' },
  { id: 'peach-courtyard', title: 'Peach courtyard', price: 499, category: 'Wedding invitations', style: 'Floral', tint: '#ffd0b4', tintKey: 2, tone: '', names: 'Meera & Kabir', kicker: 'You are invited', rank: 9, age: 7, when: '25 Jan 2027 · Pune' },
  { id: 'paper-moon', title: 'Paper moon', price: 299, category: 'Save the dates', style: 'Minimal', tint: '#f2f1ef', tintKey: 5, tone: '', names: 'Aisha & Ravi', kicker: 'Save the date', rank: 10, age: 2, when: '30 Apr 2027 · Shimla' },
  { id: 'sunset-ticket', title: 'Sunset ticket', price: 349, category: 'Save the dates', style: 'Modern', tint: '#bc4324', tintKey: 4, tone: 'rust', names: 'Kiara & Sid', kicker: 'Save the date', rank: 11, age: 1, when: '15 May 2027 · Goa' },
  { id: 'ring-ceremony', title: 'Ring ceremony', price: 449, category: 'Engagement', style: 'Traditional', tint: '#ffe1cc', tintKey: 1, tone: '', names: 'Diya & Aman', kicker: 'Engagement', rank: 12, age: 8, when: '02 Jan 2027 · Chennai' },
  { id: 'henna-lines', title: 'Henna lines', price: 399, category: 'Haldi & mehendi', style: 'Floral', tint: '#ffd0b4', tintKey: 2, tone: '', names: 'Sana & Yash', kicker: 'Mehendi night', rank: 13, age: 4, when: '19 Feb 2027 · Lucknow' }
];

export const OCCASIONS = ['All', 'Wedding invitations', 'Save the dates', 'Engagement', 'Haldi & mehendi'] as const;
export type Occasion = (typeof OCCASIONS)[number];
export const STYLES = ['Floral', 'Minimal', 'Modern', 'Traditional'] as const;
export const TINTS: Tint[] = [
  { label: 'Ivory blush', color: '#ffe9d4' }, { label: 'Apricot', color: '#ffe1cc' }, { label: 'Peach', color: '#ffd0b4' },
  { label: 'Ink', color: '#121212' }, { label: 'Terracotta', color: '#bc4324' }, { label: 'Linen', color: '#f2f1ef' }
];
export const PRESS = ['Vowly', 'The Bridal Edit', 'mandap weekly', 'Paper & Petal', 'WED JOURNAL', 'shaadi.studio'];
export const formatPrice = (amount: number): string => `₹${amount.toLocaleString('en-IN')}`;


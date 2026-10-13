import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Anton, Archivo } from 'next/font/google';
import './ds.css';
import './site.css';
import '@/components/PageTheme.css';
import '@/components/CursorEffects.css';
import '@/components/FlipCard.css';
import '@/components/JellyRadio.css';
import '@/components/SlideCommit.css';
import { SavedTemplatesProvider } from '@/components/SavedTemplatesProvider';
import { CartProvider } from '@/components/CartProvider';
import CursorEffects from '@/components/CursorEffects';
import PageTheme from '@/components/PageTheme';

const anton = Anton({ subsets: ['latin'], weight: '400', variable: '--font-anton', display: 'swap' });
const archivo = Archivo({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-archivo', display: 'swap' });

export const metadata: Metadata = {
  title: '1000SQUARES — Wedding invitation templates',
  description: 'Discover, customise and buy beautifully designed wedding invitation templates.',
  icons: { icon: '/images/logo.png' }
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#121212' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="light" data-scroll-behavior="smooth" className={`${anton.variable} ${archivo.variable}`} suppressHydrationWarning>
      <body>
        <PageTheme>
          <CursorEffects>
            <SavedTemplatesProvider>
              <CartProvider>{children}</CartProvider>
            </SavedTemplatesProvider>
          </CursorEffects>
        </PageTheme>
      </body>
    </html>
  );
}

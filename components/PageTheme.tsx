'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';

type PageThemeName = 'home' | 'catalog' | 'editorial' | 'studio' | 'story' | 'saved' | 'cart' | 'account';

const THEMES = new Set<PageThemeName>(['home', 'catalog', 'editorial', 'studio', 'story', 'saved', 'cart', 'account']);

function isPageTheme(value: string | null): value is PageThemeName {
  return value !== null && THEMES.has(value as PageThemeName);
}

function themeForRoute(pathname: string): PageThemeName {
  if (pathname.startsWith('/templates')) return 'catalog';
  if (pathname.startsWith('/saved')) return 'saved';
  if (pathname.startsWith('/cart')) return 'cart';
  if (pathname.startsWith('/account')) return 'account';
  return 'home';
}

export default function PageTheme({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '/';
  const routeTheme = themeForRoute(pathname);
  const [sectionTheme, setSectionTheme] = useState<PageThemeName | null>(null);
  const pageTheme = pathname === '/' ? sectionTheme ?? routeTheme : routeTheme;

  useEffect(() => {
    setSectionTheme(null);
    if (pathname !== '/' || !('IntersectionObserver' in window)) return;

    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-theme-section]'));
    if (!sections.length) return;

    const observer = new IntersectionObserver((entries) => {
      const current = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      const nextTheme = current?.target.getAttribute('data-theme-section') ?? null;
      if (isPageTheme(nextTheme)) setSectionTheme(nextTheme);
    }, {
      rootMargin: '-40% 0px -40% 0px',
      threshold: [0, 0.15, 0.4]
    });

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname]);

  return (
    <div className="page-theme" data-page-theme={pageTheme} data-route-theme={routeTheme}>
      {children}
    </div>
  );
}

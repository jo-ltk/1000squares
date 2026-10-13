'use client';

import { useEffect, useRef, useState } from 'react';

export function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    setReady(true);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }

    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, ready, visible };
}

'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useScrollReveal } from './useScrollReveal';

type TextRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

type TextRevealStyle = CSSProperties & { '--text-reveal-delay': string };

export default function TextReveal({ children, className = '', delay = 0 }: TextRevealProps) {
  const { ref, ready, visible } = useScrollReveal<HTMLSpanElement>();

  return (
    <span
      ref={ref}
      className={`text-reveal ${className}`.trim()}
      data-text-reveal-ready={ready}
      data-text-reveal-visible={visible}
      style={{ '--text-reveal-delay': `${delay}ms` } as TextRevealStyle}
    >
      {children}
    </span>
  );
}

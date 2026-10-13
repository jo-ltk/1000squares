"use client";

import { Fragment, useEffect, useRef, useState, type CSSProperties } from 'react';

type StaggeredTextProps = {
  text?: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
};

type StaggeredTextStyle = CSSProperties & { '--stagger-delay': string };

const DEFAULT_TEXT = 'Wedding invites,\nmade to matter';

export default function StaggeredText({
  text = DEFAULT_TEXT,
  className = '',
  as = 'h1'
}: StaggeredTextProps) {
  const Tag = as;
  const contentRef = useRef<HTMLSpanElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  let staggerIndex = 0;

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    setIsReady(true);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px' }
    );

    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      className={`staggered-text ${className}`.trim()}
      aria-label={text.replace(/\s+/g, ' ').trim()}
      data-staggered-ready={isReady}
      data-staggered-visible={isVisible}
    >
      <span ref={contentRef} className="staggered-text__content" aria-hidden="true">
        {text.split(/\r?\n/).map((line, lineIndex) => {
          const words = line.trim().split(/\s+/).filter(Boolean);

          return (
            <span className="staggered-text__line" key={`line-${lineIndex}`}>
              {words.map((word, wordIndex) => {
                const index = staggerIndex++;

                return (
                  <Fragment key={`word-${lineIndex}-${wordIndex}`}>
                    <span
                      className="staggered-text__word"
                      style={{ '--stagger-delay': `${index * 80}ms` } as StaggeredTextStyle}
                    >
                      {word}
                    </span>
                    {wordIndex < words.length - 1 ? ' ' : null}
                  </Fragment>
                );
              })}
            </span>
          );
        })}
      </span>
    </Tag>
  );
}

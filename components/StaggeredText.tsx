"use client";

import { Fragment, type CSSProperties } from 'react';
import { useScrollReveal } from './useScrollReveal';

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
  const { ref: contentRef, ready, visible } = useScrollReveal<HTMLSpanElement>();
  let staggerIndex = 0;

  return (
    <Tag
      className={`staggered-text ${className}`.trim()}
      aria-label={text.replace(/\s+/g, ' ').trim()}
      data-staggered-ready={ready}
      data-staggered-visible={visible}
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

'use client';

import { useEffect, useRef, useState } from 'react';

type Sparkle = { id: number; x: number; y: number };

export default function TouchSparkles() {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Set<number>());

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType !== 'touch' || reducedMotion.matches) return;
      const sparkle = { id: nextId.current++, x: event.clientX, y: event.clientY };
      setSparkles((current) => [...current.slice(-5), sparkle]);
      const timer = window.setTimeout(() => {
        setSparkles((current) => current.filter(({ id }) => id !== sparkle.id));
        timers.current.delete(timer);
      }, 760);
      timers.current.add(timer);
    };

    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      timers.current.forEach((timer) => window.clearTimeout(timer));
      timers.current.clear();
    };
  }, []);

  return (
    <div className="touch-sparkles" aria-hidden="true">
      {sparkles.map((sparkle) => (
        <span className="touch-sparkle" key={sparkle.id} style={{ left: sparkle.x, top: sparkle.y }}>
          <i className="touch-sparkle__halo" />
          <i className="touch-sparkle__star touch-sparkle__star--one" />
          <i className="touch-sparkle__star touch-sparkle__star--two" />
          <i className="touch-sparkle__star touch-sparkle__star--three" />
          <i className="touch-sparkle__star touch-sparkle__star--four" />
        </span>
      ))}
    </div>
  );
}

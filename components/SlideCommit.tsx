'use client';

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type PointerEvent as ReactPointerEvent, type KeyboardEvent } from 'react';
import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform } from 'motion/react';

type Phase = 'idle' | 'pending' | 'done' | 'error';
type HistoryPoint = [time: number, position: number];
type GripState = { id: number; grab: number | null; moved: boolean; history: HistoryPoint[] };
type Props = {
  label?: ReactNode;
  doneLabel?: ReactNode;
  errorLabel?: ReactNode;
  onConfirm?: () => void | Promise<unknown>;
  onDone?: () => void;
  onError?: (reason: unknown) => void;
  trackColor?: string;
  handleColor?: string;
  successColor?: string;
  dangerColor?: string;
  width?: number;
  height?: number;
  radius?: number;
  speed?: number;
  returnBounce?: number;
  landingDip?: number;
  holdMs?: number;
  disabled?: boolean;
  fluid?: boolean;
  icon?: ReactNode;
  className?: string;
};

const PAD = 4;
const SQUASH_MAX = .08;
const SQUASH_DIV = 110;
const SWELL = 1.03;
const MIN_PENDING = 300;
const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const SHAKE = [0, -5, 5, -3, 3, -1, 0];
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function onColor(hex: string) {
  const raw = hex.replace('#', '');
  const full = raw.length === 3 ? [...raw].map((character) => character + character).join('') : raw.slice(0, 6);
  const value = Number.parseInt(full, 16);
  if (Number.isNaN(value)) return '#fff';
  const brightness = (((value >> 16) & 255) * 299 + ((value >> 8) & 255) * 587 + (value & 255) * 114) / 1000;
  return brightness >= 128 ? '#111' : '#fff';
}

function velocityOf(history: HistoryPoint[]) {
  if (history.length < 2) return 0;
  const [startTime, startPosition] = history[0];
  const [endTime, endPosition] = history[history.length - 1];
  return ((endPosition - startPosition) / Math.max(1, endTime - startTime)) * 1000;
}

function ArrowIcon({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7" /></svg>;
}

function CheckIcon({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>;
}

function Spinner({ size }: { size: number }) {
  return <svg className="slide-commit__spinner" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.4" strokeOpacity=".25" /><path d="M12 3a9 9 0 0 1 9 9" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>;
}

export default function SlideCommit({
  label = 'Slide to confirm', doneLabel = 'Done', errorLabel = 'Try again', onConfirm, onDone, onError,
  trackColor = '#5a2a1e', handleColor = '#ffe9d4', successColor = '#bc4324', dangerColor = '#9a3024',
  width = 280, height = 56, radius = 28, speed = 50, returnBounce = .38, landingDip = .026,
  holdMs = 1500, disabled = false, fluid = false, icon, className = ''
}: Props) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>('idle');
  const [held, setHeld] = useState(false);
  const [hot, setHot] = useState(false);
  const [fluidWidth, setFluidWidth] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const capsuleRef = useRef<HTMLDivElement | null>(null);
  const grip = useRef<GripState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const homeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const run = useRef(0);
  const unwatch = useRef<(() => void) | null>(null);
  const live = useRef<{ move: (event: PointerEvent) => void; up: (event: PointerEvent) => void }>({ move: () => {}, up: () => {} });
  const lastPercent = useRef(-1);

  const measuredWidth = fluid && fluidWidth ? fluidWidth : width;
  const gripSize = height - PAD * 2;
  const innerWidth = measuredWidth - PAD * 2;
  const travel = Math.max(1, innerWidth - gripSize);
  const trackRadius = clamp(radius, 0, height / 2);
  const gripRadius = Math.max(0, trackRadius - PAD);
  const stiffness = 260 + clamp(speed, 0, 100) / 100 * 640;
  const mass = .9;
  const criticalDamping = 2 * Math.sqrt(stiffness * mass);
  const commitSpring = { type: 'spring' as const, stiffness, damping: criticalDamping, mass };
  const homeSpring = { ...commitSpring, damping: criticalDamping * (1 - clamp(returnBounce, 0, .5)) };

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!fluid || !track) return;
    const measure = () => {
      const nextWidth = Number.parseFloat(getComputedStyle(track).width);
      if (nextWidth > 0) setFluidWidth((current) => current !== null && Math.abs(current - nextWidth) < .5 ? current : nextWidth);
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [fluid]);

  const x = useMotionValue(0);
  const anchor = useMotionValue(0);
  const shown = useMotionValue(1);
  const spin = useMotionValue(0);
  const pulse = useMotionValue(1);
  const shake = useMotionValue(0);
  const seen = useTransform(x, (value) => clamp(value, 0, travel));
  const edge = useTransform([seen, anchor], ([position, anchored]) => Number(position) + gripSize + clamp(Number(anchored) - Number(position), 0, travel));
  const clip = useTransform(edge, (right) => `inset(0 ${innerWidth - right}px 0 0 round ${gripRadius}px)`);
  const content = useTransform([seen, edge], ([position, right]) => `translateX(${(Number(position) + Number(right)) / 2 - innerWidth / 2}px)`);
  const swell = hot && !held && phase === 'idle' && !reduce ? SWELL : 1;
  const shape = useTransform(x, (value) => {
    const squeeze = 1 - Math.min(SQUASH_MAX, Math.max(0, -value) / SQUASH_DIV);
    return `scale(${squeeze * swell}, ${swell / squeeze})`;
  });
  const origin = useTransform(seen, (value) => `${value}px 50%`);
  const say = useTransform(seen, [0, travel * .55], [1, 0]);
  const arrowOpacity = useTransform([seen, shown], ([position, visible]) => Number(visible) * clamp(1 - (Number(position) - travel * .55) / (travel * .4), 0, 1));
  const trackTransform = useTransform([shake, pulse], ([shakeX, scale]) => `translateX(${shakeX}px) scale(${scale})`);
  const labelText = typeof label === 'string' ? label : 'Slide to confirm';

  useMotionValueEvent(seen, 'change', (position) => {
    const percent = Math.round(position / travel * 100);
    if (percent === lastPercent.current || !capsuleRef.current) return;
    lastPercent.current = percent;
    capsuleRef.current.setAttribute('aria-valuenow', String(percent));
    capsuleRef.current.setAttribute('aria-valuetext', `${labelText}, ${percent}%`);
  });

  useEffect(() => {
    if (disabled || phase !== 'done') return;
    setPhase('idle');
    x.set(0);
    anchor.set(0);
    shown.set(1);
    spin.set(0);
    pulse.set(1);
  }, [disabled, phase, x, anchor, shown, spin, pulse]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
    if (homeTimer.current) clearTimeout(homeTimer.current);
    unwatch.current?.();
    run.current += 1;
  }, []);

  const local = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    return rect ? (clientX - rect.left) / (rect.width / measuredWidth || 1) : 0;
  };
  const goHome = (velocity: number) => {
    if (reduce) animate(x, 0, { duration: .2, ease: EASE_OUT });
    else animate(x, 0, { ...homeSpring, velocity: Math.min(0, velocity) });
  };
  const settle = () => {
    setPhase('idle');
    animate(shown, 1, { duration: .2, delay: .12 });
    if (reduce) anchor.set(0);
    else animate(anchor, 0, { type: 'spring', duration: .3, bounce: 0 });
  };
  const resolve = (viaKey: boolean) => {
    setPhase('done');
    anchor.set(x.get());
    animate(spin, 0, { duration: .12 });
    if (reduce) x.set(0);
    else {
      animate(x, 0, commitSpring);
      if (!viaKey && landingDip > 0) animate(pulse, [1, 1 - landingDip, 1], { duration: .46, times: [0, .62, 1], ease: EASE_OUT, delay: .1 });
    }
    onDone?.();
    if (holdMs > 0) timer.current = setTimeout(settle, holdMs);
  };
  const reject = (reason: unknown) => {
    setPhase('error');
    onError?.(reason);
    animate(spin, 0, { duration: .12 });
    animate(shown, 1, { duration: .2, delay: .12 });
    if (reduce) goHome(0);
    else {
      animate(shake, SHAKE, { duration: .45, ease: EASE_OUT });
      homeTimer.current = setTimeout(() => { if (!grip.current) goHome(0); }, 300);
    }
    timer.current = setTimeout(() => setPhase('idle'), Math.max(holdMs, 1500));
  };
  const commit = (viaKey: boolean) => {
    if (timer.current) clearTimeout(timer.current);
    const id = ++run.current;
    x.set(travel);
    let result: void | Promise<unknown>;
    try { result = onConfirm?.(); } catch (reason) { reject(reason); return; }
    const pending = result && typeof result.then === 'function' ? result : null;
    if (!pending) {
      animate(shown, 0, { duration: .12 });
      resolve(viaKey);
      return;
    }
    setPhase('pending');
    animate(shown, 0, { duration: .2 });
    animate(spin, 1, { duration: .2 });
    const started = performance.now();
    const later = (callback: () => void) => setTimeout(() => {
      if (id === run.current) callback();
    }, Math.max(0, MIN_PENDING - (performance.now() - started)));
    pending.then(() => later(() => resolve(viaKey)), (reason) => later(() => reject(reason)));
  };

  const pointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled || grip.current || phase === 'pending' || phase === 'done' || event.button !== 0) return;
    x.stop();
    grip.current = { id: event.pointerId, grab: null, moved: false, history: [] };
    setHeld(true);
    try { trackRef.current?.setPointerCapture(event.pointerId); } catch { /* Pointer capture is optional in embedded browsers. */ }
    unwatch.current?.();
    const onMove = (nativeEvent: PointerEvent) => { if (nativeEvent.isTrusted) live.current.move(nativeEvent); };
    const onUp = (nativeEvent: PointerEvent) => { if (nativeEvent.isTrusted) live.current.up(nativeEvent); };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    unwatch.current = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      unwatch.current = null;
    };
  };
  const pointerMove = (event: PointerEvent) => {
    const current = grip.current;
    if (!current || current.id !== event.pointerId) return;
    const position = local(event.clientX);
    if (current.grab === null) { current.grab = position - x.get(); return; }
    const next = clamp(position - current.grab, 0, travel);
    if (Math.abs(next - x.get()) > .5) current.moved = true;
    current.history.push([event.timeStamp, next]);
    if (current.history.length > 4) current.history.shift();
    x.set(next);
  };
  const pointerUp = (event: PointerEvent) => {
    const current = grip.current;
    if (!current || current.id !== event.pointerId) return;
    grip.current = null;
    unwatch.current?.();
    try {
      if (trackRef.current?.hasPointerCapture(event.pointerId)) trackRef.current.releasePointerCapture(event.pointerId);
    } catch { /* The browser may already have released capture. */ }
    setHeld(false);
    if (x.get() >= travel) commit(false);
    else if (current.moved) goHome(velocityOf(current.history));
  };
  live.current = { move: pointerMove, up: pointerUp };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled || phase === 'pending' || phase === 'done') return;
    const step = travel / 10;
    if (event.key === 'End') { event.preventDefault(); commit(true); }
    else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      const next = Math.min(travel, x.get() + step);
      x.set(next);
      if (next >= travel) commit(true);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault(); x.set(Math.max(0, x.get() - step));
    } else if (event.key === 'Home' || event.key === 'Escape') { event.preventDefault(); x.set(0); }
  };

  const fontSize = clamp(Math.round(height * .25), 13, 17);
  const iconSize = Math.round(gripSize * .42);
  const done = phase === 'done';

  return (
    <div
      className={`slide-commit${className ? ` ${className}` : ''}`}
      data-phase={phase}
      data-held={held ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
      style={{
        width: fluid ? '100%' : width, height, '--sc-track': trackColor, '--sc-ink': handleColor,
        '--sc-ok': successColor, '--sc-no': dangerColor,
        '--sc-on-ink': onColor(handleColor), '--sc-on-ok': onColor(successColor), '--sc-on-no': onColor(dangerColor),
        '--sc-radius': `${trackRadius}px`, '--sc-grip-r': `${gripRadius}px`, '--sc-pad': `${PAD}px`, '--sc-font': `${fontSize}px`
      } as React.CSSProperties}
    >
      <motion.div ref={trackRef} className="slide-commit__track" style={{ transform: trackTransform }} onPointerDown={pointerDown}>
        <motion.span className="slide-commit__label" style={{ opacity: say }} aria-hidden="true">
          <span className="slide-commit__text slide-commit__text--plain">{label}</span>
          <span className="slide-commit__text slide-commit__text--error">{errorLabel}</span>
        </motion.span>
        <motion.div
          ref={capsuleRef}
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label={labelText}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={0}
          aria-busy={phase === 'pending' || undefined}
          aria-disabled={disabled || undefined}
          className="slide-commit__capsule"
          style={{ clipPath: clip, transform: shape, transformOrigin: origin }}
          onPointerEnter={(event) => { if (event.pointerType === 'mouse' && window.matchMedia?.('(hover: hover) and (pointer: fine)').matches) setHot(true); }}
          onPointerLeave={() => setHot(false)}
          onKeyDown={onKeyDown}
        >
          <motion.div className="slide-commit__content" style={{ transform: content }}>
            <motion.span className="slide-commit__arrow" style={{ opacity: arrowOpacity }} aria-hidden="true">{icon ?? <ArrowIcon size={iconSize} />}</motion.span>
            <motion.span className="slide-commit__spin" style={{ opacity: spin }} aria-hidden="true"><Spinner size={iconSize} /></motion.span>
            <motion.span className="slide-commit__done" aria-hidden="true" initial={false}
              animate={{ opacity: done ? 1 : 0, scale: done || reduce ? 1 : .95 }} transition={{ duration: .2, ease: EASE_OUT }}>
              <CheckIcon size={Math.round(gripSize * .38)} />{doneLabel}
            </motion.span>
          </motion.div>
        </motion.div>
        <span className="slide-commit__sr" aria-live="polite">
          {phase === 'pending' ? 'Working' : phase === 'done' ? doneLabel : phase === 'error' ? errorLabel : ''}
        </span>
      </motion.div>
    </div>
  );
}

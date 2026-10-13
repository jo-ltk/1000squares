'use client';

import { forwardRef, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { animate, motion, motionValue, useReducedMotion, useTransform, type HTMLMotionProps, type MotionValue } from 'motion/react';

type JellyOption = string | { value: string; label: ReactNode; icon?: ReactNode; disabled?: boolean };
type MotionSet = { x: MotionValue<number>; sx: MotionValue<number>; sy: MotionValue<number> };
type Props = {
  items?: JellyOption[]; value?: string; defaultValue?: string; onChange?: (value: string, index: number) => void;
  chipColor?: string; activeColor?: string; textColor?: string; activeTextColor?: string;
  size?: 'sm' | 'md' | 'lg'; gap?: number; radius?: number; swell?: number; barge?: number;
  shrink?: number; jelly?: number; bounce?: number; stagger?: number; stiffness?: number;
  disabled?: boolean; ariaLabel?: string; className?: string;
};
type Option = Exclude<JellyOption, string>;
const DEFAULT_ITEMS: JellyOption[] = ['Off', 'Low', 'Medium', 'High', 'Max'];
const SIZES = { sm: [28, 12, 12], md: [36, 13, 16], lg: [44, 14, 20] } as const;
const spring = (stiffness: number, mass: number, bounce: number) => ({
  type: 'spring' as const,
  stiffness,
  damping: 2 * Math.sqrt(stiffness * mass) * (1 - bounce),
  mass
});

const Chip = forwardRef<HTMLButtonElement, Omit<HTMLMotionProps<'button'>, 'style'> & { mv: MotionSet }>(
  function Chip({ mv, children, ...props }, ref) {
    const transform = useTransform(() => `translateX(${mv.x.get()}px) scale(${mv.sx.get()}, ${mv.sy.get()})`);
    return <motion.button ref={ref} style={{ transform }} {...props}>{children}</motion.button>;
  }
);

export default function JellyRadio({
  items = DEFAULT_ITEMS, value, defaultValue, onChange,
  chipColor = '#27272a', activeColor = '#f5f5f5', textColor = '#f5f5f5', activeTextColor = '#18181b',
  size = 'md', gap = 8, radius = 18, swell = .2, barge = 6, shrink = .05, jelly = 1,
  bounce = .25, stagger = 22, stiffness = 580, disabled = false, ariaLabel = 'Options', className = ''
}: Props) {
  const options: Option[] = items.map((item) => typeof item === 'string' ? { value: item, label: item } : item);
  const [inner, setInner] = useState(() => defaultValue ?? options[0]?.value);
  const selected = value ?? inner;
  const selectedIndex = Math.max(0, options.findIndex((item) => item.value === selected));
  const reducedMotion = useReducedMotion();
  const groupRef = useRef<HTMLDivElement | null>(null);
  const chipRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const widths = useRef<number[]>([]);
  const valuesRef = useRef<MotionSet[]>([]);
  const applied = useRef(selectedIndex);
  const settings = useRef({ swell, barge, shrink, jelly, bounce, stagger, stiffness, reducedMotion, count: options.length });
  settings.current = { swell, barge, shrink, jelly, bounce, stagger, stiffness, reducedMotion, count: options.length };
  const [height, fontSize, horizontalPadding] = SIZES[size] ?? SIZES.md;
  const itemsKey = options.map((item) => item.value).join('|');

  const motionFor = (index: number) => {
    let valueSet = valuesRef.current[index];
    if (!valueSet) {
      valueSet = { x: motionValue(0), sx: motionValue(1), sy: motionValue(1) };
      valuesRef.current[index] = valueSet;
    }
    return valueSet;
  };

  const animateSelection = (selection: number, instant: boolean) => {
    const config = settings.current;
    const group = groupRef.current;
    const rtl = group ? getComputedStyle(group).direction === 'rtl' : false;
    const shove = ((widths.current[selection] ?? 0) * config.swell) / 2 + config.barge;
    for (let index = 0; index < config.count; index += 1) {
      const mv = motionFor(index);
      const distance = Math.abs(index - selection);
      const x = Math.sign(index - selection) * (rtl ? -1 : 1) * shove;
      const scale = index === selection ? 1 + config.swell : 1 - config.shrink;
      if (instant || config.reducedMotion) {
        mv.x.jump(x); mv.sx.jump(scale); mv.sy.jump(scale);
        continue;
      }
      const k = config.stiffness * (1 - .12 * Math.min(distance, 3));
      const delay = mv.x.isAnimating() || mv.sx.isAnimating() || mv.sy.isAnimating() ? 0 : distance * config.stagger / 1000;
      animate(mv.x, x, { ...spring(k, .9, config.bounce), delay });
      animate(mv.sx, scale, { ...spring(k * (1 + .24 * config.jelly), .9 - .1 * config.jelly, Math.min(.85, config.bounce + .3 * config.jelly)), delay });
      animate(mv.sy, scale, { ...spring(k * (1 - .14 * config.jelly), .9 + .05 * config.jelly, config.bounce), delay: delay + .05 * config.jelly });
    }
  };

  const measure = () => {
    const group = groupRef.current;
    if (!group) return;
    widths.current = chipRefs.current.map((element) => element?.offsetWidth ?? 0);
    const chipHeight = chipRefs.current[0]?.offsetHeight ?? 0;
    const maxWidth = Math.max(0, ...widths.current);
    group.style.setProperty('--jr-pad-x', `${Math.ceil(maxWidth * swell * 1.3 / 2 + barge) + 2}px`);
    group.style.setProperty('--jr-pad-y', `${Math.ceil(chipHeight * swell / 2) + 2}px`);
  };

  useLayoutEffect(() => {
    const settle = () => { measure(); animateSelection(applied.current, true); };
    settle();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(settle);
    if (groupRef.current) observer?.observe(groupRef.current);
    document.fonts?.ready.then(settle);
    return () => observer?.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsKey, size, gap, swell, barge, shrink]);

  useEffect(() => {
    if (applied.current === selectedIndex) return;
    applied.current = selectedIndex;
    animateSelection(selectedIndex, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex]);
  useEffect(() => () => valuesRef.current.forEach((mv) => { mv.x.destroy(); mv.sx.destroy(); mv.sy.destroy(); }), []);

  const commit = (index: number, instant: boolean) => {
    if (disabled || index === selectedIndex || !options[index] || options[index].disabled) return;
    applied.current = index;
    animateSelection(index, instant);
    if (value === undefined) setInner(options[index].value);
    onChange?.(options[index].value, index);
  };
  const stepFrom = (index: number, direction: number) => {
    let next = index;
    for (let tries = 0; tries < options.length; tries += 1) {
      next = (next + direction + options.length) % options.length;
      if (!options[next].disabled) return next;
    }
    return index;
  };
  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number | null = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = stepFrom(index, 1);
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = stepFrom(index, -1);
    else if (event.key === 'Home') next = stepFrom(-1, 1);
    else if (event.key === 'End') next = stepFrom(options.length, -1);
    else if (event.key === ' ' || event.key === 'Enter') next = index;
    if (next === null) return;
    event.preventDefault(); commit(next, true); chipRefs.current[next]?.focus();
  };

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label={ariaLabel}
      data-disabled={disabled ? '' : undefined}
      className={`jelly-radio${className ? ` ${className}` : ''}`}
      style={{
        '--jr-chip': chipColor, '--jr-active': activeColor, '--jr-text': textColor, '--jr-active-text': activeTextColor,
        '--jr-gap': `${gap}px`, '--jr-radius': `${radius}px`, '--jr-h': `${height}px`,
        '--jr-font': `${fontSize}px`, '--jr-px': `${horizontalPadding}px`
      } as React.CSSProperties}
    >
      {options.map((item, index) => (
        <Chip
          key={item.value}
          mv={motionFor(index)}
          ref={(element) => { chipRefs.current[index] = element; }}
          type="button" role="radio" aria-checked={index === selectedIndex}
          tabIndex={index === selectedIndex ? 0 : -1} disabled={disabled || !!item.disabled}
          className="jelly-radio__chip" data-on={index === selectedIndex ? 'true' : 'false'}
          onClick={(event) => commit(index, event.detail === 0)}
          onKeyDown={(event) => onKeyDown(event, index)}
        >
          <span className="jelly-radio__skin">
            {item.icon ? <span className="jelly-radio__icon">{item.icon}</span> : null}
            <span className="jelly-radio__label">{item.label}</span>
          </span>
        </Chip>
      ))}
    </div>
  );
}

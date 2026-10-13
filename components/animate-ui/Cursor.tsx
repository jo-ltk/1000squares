'use client';

import * as React from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  type HTMLMotionProps,
  type SpringOptions
} from 'motion/react';

type CursorContextValue = {
  cursorPos: { x: number; y: number };
  active: boolean;
  global: boolean;
  cursorRef: React.RefObject<HTMLDivElement | null>;
};

const CursorContext = React.createContext<CursorContextValue | null>(null);

function useCursor() {
  const context = React.useContext(CursorContext);
  if (!context) throw new Error('Cursor components must be inside CursorProvider.');
  return context;
}

export function CursorProvider({ children, global = false }: { children: React.ReactNode; global?: boolean }) {
  const [cursorPos, setCursorPos] = React.useState({ x: 0, y: 0 });
  const [active, setActive] = React.useState(false);
  const cursorRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const finePointer = window.matchMedia('(any-hover: hover) and (any-pointer: fine)');
    let latestPosition = { x: 0, y: 0 };
    let frame = 0;
    let cursorIsActive = false;

    const handlePointerMove = (event: PointerEvent) => {
      if (!finePointer.matches || (event.pointerType !== 'mouse' && event.pointerType !== 'pen')) return;
      latestPosition = { x: event.clientX, y: event.clientY };
      if (!cursorIsActive) setCursorPos(latestPosition);
      cursorIsActive = true;
      setActive(true);
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        setCursorPos(latestPosition);
        frame = 0;
      });
    };

    const handlePointerOut = (event: PointerEvent) => {
      if (event.relatedTarget === null) {
        cursorIsActive = false;
        setActive(false);
      }
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        cursorIsActive = false;
        setActive(false);
      }
    };
    const handleMediaChange = () => {
      if (!finePointer.matches) {
        cursorIsActive = false;
        setActive(false);
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerout', handlePointerOut, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    finePointer.addEventListener('change', handleMediaChange);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerout', handlePointerOut);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      finePointer.removeEventListener('change', handleMediaChange);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  React.useEffect(() => {
    const root = document.documentElement;
    if (active) root.classList.add('animate-ui-cursor-none');
    else root.classList.remove('animate-ui-cursor-none');
    return () => root.classList.remove('animate-ui-cursor-none');
  }, [active]);

  const value = React.useMemo(() => ({ cursorPos, active, global, cursorRef }), [cursorPos, active, global]);

  return <CursorContext.Provider value={value}>{children}</CursorContext.Provider>;
}

export function Cursor({ children, style, ...props }: HTMLMotionProps<'div'> & { children?: React.ReactNode }) {
  const { cursorPos, active, global, cursorRef } = useCursor();
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  React.useEffect(() => {
    x.set(cursorPos.x);
    y.set(cursorPos.y);
  }, [cursorPos, x, y]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          data-slot="cursor"
          data-global={global}
          ref={cursorRef}
          className="site-cursor"
          style={{
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 9999,
            position: 'fixed',
            top: y,
            left: x,
            ...style
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type CursorFollowProps = Omit<HTMLMotionProps<'div'>, 'transition'> & {
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
  transition?: SpringOptions;
};

export function CursorFollow({
  children,
  side = 'bottom',
  sideOffset = 15,
  align = 'end',
  alignOffset = 5,
  transition = { stiffness: 500, damping: 50, bounce: 0 },
  style,
  ...props
}: CursorFollowProps) {
  const { cursorPos, active, cursorRef, global } = useCursor();
  const followRef = React.useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, transition);
  const springY = useSpring(y, transition);

  const calculateOffset = React.useCallback(() => {
    const rect = followRef.current?.getBoundingClientRect();
    const width = rect?.width ?? 0;
    const height = rect?.height ?? 0;
    let offsetX = 0;
    let offsetY = 0;

    if (side === 'top' || side === 'bottom') {
      offsetY = side === 'top' ? height + sideOffset : -sideOffset;
      offsetX = align === 'start' ? width + alignOffset : align === 'center' ? width / 2 : -alignOffset;
    } else {
      offsetX = side === 'left' ? width + sideOffset : -sideOffset;
      offsetY = align === 'start' ? height + alignOffset : align === 'center' ? height / 2 : -alignOffset;
    }
    return { x: offsetX, y: offsetY };
  }, [side, sideOffset, align, alignOffset]);

  React.useEffect(() => {
    const offset = calculateOffset();
    const cursorRect = cursorRef.current?.getBoundingClientRect();
    const cursorWidth = cursorRect?.width ?? 20;
    const cursorHeight = cursorRect?.height ?? 20;
    x.set(cursorPos.x - offset.x + cursorWidth / 2);
    y.set(cursorPos.y - offset.y + cursorHeight / 2);
  }, [calculateOffset, cursorPos, cursorRef, x, y]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          ref={followRef}
          data-slot="cursor-follow"
          data-global={global}
          className="site-cursor-follow"
          style={{
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 9998,
            position: 'fixed',
            top: springY,
            left: springX,
            ...style
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

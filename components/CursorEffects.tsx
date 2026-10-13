'use client';

import { Cursor, CursorFollow, CursorProvider } from '@/components/animate-ui/Cursor';
import TouchSparkles from '@/components/TouchSparkles';

export default function CursorEffects({ children }: { children: React.ReactNode }) {
  return (
    <CursorProvider global>
      {children}
      <Cursor>
        <span className="site-cursor__ring"><i /></span>
      </Cursor>
      <CursorFollow side="bottom" sideOffset={17} align="end" alignOffset={-5}>
        <span className="site-cursor-follow__label"><i /> 1000SQUARES</span>
      </CursorFollow>
      <TouchSparkles />
    </CursorProvider>
  );
}

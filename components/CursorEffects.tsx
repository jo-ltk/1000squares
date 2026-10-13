'use client';

import { Cursor, CursorProvider } from '@/components/animate-ui/Cursor';
import TouchSparkles from '@/components/TouchSparkles';

export default function CursorEffects({ children }: { children: React.ReactNode }) {
  return (
    <CursorProvider global>
      {children}
      <Cursor>
        <span className="site-cursor__ring"><i /></span>
      </Cursor>
      <TouchSparkles />
    </CursorProvider>
  );
}

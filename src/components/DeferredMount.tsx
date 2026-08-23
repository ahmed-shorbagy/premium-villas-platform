import { Suspense, useRef, type ReactNode } from 'react';
import { useInViewport } from '@/hooks/useInViewport';
import { Skeleton } from '@/components/ui/skeleton';

interface DeferredMountProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  minHeight?: string;
}

export function DeferredMount({
  children,
  fallback,
  rootMargin = '240px 0px',
  minHeight = '12rem',
}: DeferredMountProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInViewport(ref, { rootMargin, once: true });

  return (
    <div ref={ref} style={{ minHeight: inView ? undefined : minHeight }}>
      {inView ? (
        <Suspense fallback={fallback ?? <Skeleton className="h-full min-h-[inherit] w-full rounded-xl" />}>
          {children}
        </Suspense>
      ) : (
        fallback ?? <Skeleton className="h-full min-h-[inherit] w-full rounded-xl" />
      )}
    </div>
  );
}

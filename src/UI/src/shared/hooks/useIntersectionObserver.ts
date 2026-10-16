import { useEffect, useRef } from 'react';

export interface UseIntersectionObserverOptions {
  enabled?: boolean;
  onIntersect: () => void;
  rootMargin?: string;
  threshold?: number;
}

/**
 * Custom hook for observing DOM elements intersection.
 * Decouples observer lifecycle from component rendering logic (SRP).
 */
export function useIntersectionObserver({
  enabled = true,
  onIntersect,
  rootMargin = '200px',
  threshold = 0.1,
}: UseIntersectionObserverOptions) {
  const targetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onIntersect();
        }
      },
      {
        root: null,
        rootMargin,
        threshold,
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [enabled, onIntersect, rootMargin, threshold]);

  return targetRef;
}

export default useIntersectionObserver;

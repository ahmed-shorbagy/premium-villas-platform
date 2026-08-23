import { useEffect, useState, type RefObject } from 'react';

interface UseInViewportOptions {
  rootMargin?: string;
  once?: boolean;
}

export function useInViewport(
  ref: RefObject<Element | null>,
  { rootMargin = '200px 0px', once = true }: UseInViewportOptions = {},
) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || (once && inView)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, rootMargin, once, inView]);

  return inView;
}

import { useEffect, useRef } from 'react';

// container that drives opacity/translateX based on vertical scroll progress
export function ScrollHorizontalFade({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number | null = null;
    const cards: HTMLElement[] = [];

    function updateStyles() {
      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        // progress 0 when card just enters bottom of viewport, 1 when it has passed top
        const progress =
          (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
        const p = Math.min(Math.max(progress, 0), 1);

        card.style.opacity = String(1 - p);
        card.style.transform = `translateX(${-p * 40}px)`; // move left up to 40px
      });
      rafId = null;
    }

    function onScroll() {
      if (rafId === null) rafId = requestAnimationFrame(updateStyles);
    }

    if (ref.current) {
      cards.push(
        ...Array.from(ref.current.querySelectorAll<HTMLElement>('.testimonial-card'))
      );
      window.addEventListener('scroll', onScroll, { passive: true });
      updateStyles();
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div ref={ref} className="overflow-visible">
      {children}
    </div>
  );
}
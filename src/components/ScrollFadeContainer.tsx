import { useEffect, useRef } from "react";

export function ScrollFadeContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number | null = null;
    const cards: HTMLElement[] = [];

    function updateStyles() {
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const startFade = rect.bottom;
        const progress =
          (startFade - window.innerHeight) / (rect.height + window.innerHeight);
        const p = Math.min(Math.max(progress, 0), 1);

        card.style.opacity = String(1 - p);
        card.style.transform = `translateY(${p * 40}px)`;
      });
      rafId = null;
    }

    function onScroll() {
      if (rafId === null) rafId = requestAnimationFrame(updateStyles);
    }

    if (containerRef.current) {
      cards.push(
        ...Array.from(containerRef.current.querySelectorAll(".review-card"))
      );
      window.addEventListener("scroll", onScroll, { passive: true });
      updateStyles();
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="overflow-visible"
      style={{ perspective: "1000px" }}
    >
      {children}
    </div>
  );
}

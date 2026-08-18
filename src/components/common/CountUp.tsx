"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counts from 0 up to `value` the first time it scrolls into view, then stops.
 *
 * Renders `value` immediately when the viewer prefers reduced motion, and the
 * final number is in the markup from the first paint either way, so the figure is
 * never missing if JS has not run.
 */
export default function CountUp({
  value,
  suffix = "",
  durationMs = 1400,
  className,
}: {
  value: number;
  suffix?: string;
  durationMs?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let start = 0;

    const run = (now: number) => {
      if (!start) start = now;
      const t = Math.min((now - start) / durationMs, 1);
      // Ease-out so it decelerates into the final figure.
      setDisplay(Math.round(value * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(run);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();
        setDisplay(0);
        frame = requestAnimationFrame(run);
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, durationMs]);

  return (
    <span ref={ref} className={className}>
      {display.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}

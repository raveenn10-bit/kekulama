"use client";

import { useEffect, useRef, useCallback } from "react";

interface UseAutoScrollOptions {
  /** Time between auto-scrolls in ms (default: 3000) */
  interval?: number;
  /** Pause duration after user interaction in ms (default: 5000) */
  pauseAfterInteraction?: number;
  /** Only auto-scroll below this viewport width (default: 768 for mobile) */
  mobileBreakpoint?: number;
}

export function useAutoScroll({
  interval = 3000,
  pauseAfterInteraction = 5000,
  mobileBreakpoint = 768,
}: UseAutoScrollOptions = {}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPausedRef = useRef(false);

  const scrollToNext = useCallback(() => {
    const el = scrollRef.current;
    if (!el || isPausedRef.current) return;
    if (window.innerWidth >= mobileBreakpoint) return;

    const children = Array.from(el.children) as HTMLElement[];
    if (children.length === 0) return;

    // Find the current snap child closest to scroll position
    const scrollLeft = el.scrollLeft;
    const containerWidth = el.clientWidth;
    let currentIndex = 0;
    let minDist = Infinity;

    children.forEach((child, i) => {
      const dist = Math.abs(child.offsetLeft - scrollLeft);
      if (dist < minDist) {
        minDist = dist;
        currentIndex = i;
      }
    });

    const nextIndex = currentIndex + 1;

    if (nextIndex < children.length) {
      // Scroll to next item
      children[nextIndex].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
    } else {
      // Loop back to the first item
      el.scrollTo({ left: 0, behavior: "smooth" });
    }
  }, [mobileBreakpoint]);

  const pauseAutoScroll = useCallback(() => {
    isPausedRef.current = true;
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => {
      isPausedRef.current = false;
    }, pauseAfterInteraction);
  }, [pauseAfterInteraction]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    // Start auto-scroll interval
    timerRef.current = setInterval(scrollToNext, interval);

    // Pause on user touch/scroll interaction
    const handleInteraction = () => pauseAutoScroll();

    el.addEventListener("touchstart", handleInteraction, { passive: true });
    el.addEventListener("wheel", handleInteraction, { passive: true });
    el.addEventListener("mousedown", handleInteraction);

    // Respect prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      el.removeEventListener("touchstart", handleInteraction);
      el.removeEventListener("wheel", handleInteraction);
      el.removeEventListener("mousedown", handleInteraction);
    };
  }, [scrollToNext, interval, pauseAutoScroll]);

  return scrollRef;
}

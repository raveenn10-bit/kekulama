"use client";

import { useEffect, useRef, useCallback } from "react";

interface UseAutoScrollOptions {
  /** Time between auto-scroll steps in ms (default: 3000) */
  interval?: number;
  /** Pause duration after user touch/drag interaction in ms (default: 4000) */
  pauseAfterInteraction?: number;
}

export function useAutoScroll({
  interval = 3000,
  pauseAfterInteraction = 4000,
}: UseAutoScrollOptions = {}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isPausedRef = useRef(false);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToNext = useCallback(() => {
    const el = scrollRef.current;
    if (!el || isPausedRef.current) return;

    // Only scroll if content horizontally overflows the viewport
    if (el.scrollWidth <= el.clientWidth + 10) return;

    const children = Array.from(el.children).filter(
      (child) => child instanceof HTMLElement && child.offsetWidth > 0
    ) as HTMLElement[];

    if (children.length <= 1) return;

    const containerRect = el.getBoundingClientRect();
    const currentScroll = el.scrollLeft;
    const maxScroll = el.scrollWidth - el.clientWidth;

    // If near the end (within 20px), loop back to the beginning smoothly
    if (currentScroll >= maxScroll - 20) {
      el.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }

    // Find the next child element to bring into view
    let targetLeft = -1;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const childRect = child.getBoundingClientRect();
      const childAbsoluteLeft = childRect.left - containerRect.left + currentScroll;

      // Find the first child that starts at least 25px after current scroll position
      if (childAbsoluteLeft > currentScroll + 25) {
        const paddingLeft = parseFloat(window.getComputedStyle(el).paddingLeft) || 0;
        targetLeft = Math.max(0, childAbsoluteLeft - paddingLeft);
        break;
      }
    }

    if (targetLeft >= 0 && targetLeft <= maxScroll + 50) {
      el.scrollTo({ left: Math.min(targetLeft, maxScroll), behavior: "smooth" });
    } else {
      el.scrollTo({ left: 0, behavior: "smooth" });
    }
  }, []);

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

    // Never auto-advance for users who asked the OS to reduce motion
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let intervalId: ReturnType<typeof setInterval> | null = null;
    let isVisible = true;
    let isHeld = false; // hovered or keyboard-focused: hold until the user leaves

    const startTimer = () => {
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(() => {
        if (isVisible && !isHeld && !isPausedRef.current) {
          scrollToNext();
        }
      }, interval);
    };

    const stopTimer = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    // Intersection Observer to scroll only when section is in viewport
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            isVisible = entry.isIntersecting;
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(el);
    }

    startTimer();

    // Pause on user interactions (touch or pointer)
    const handleInteraction = () => {
      pauseAutoScroll();
    };

    el.addEventListener("touchstart", handleInteraction, { passive: true });
    el.addEventListener("pointerdown", handleInteraction, { passive: true });
    el.addEventListener("wheel", handleInteraction, { passive: true });

    // Hold rotation while the pointer is over the row or focus is inside it,
    // so people can read a card or tab through it without it sliding away.
    const hold = () => {
      isHeld = true;
    };
    const release = () => {
      isHeld = false;
    };
    const handleFocusOut = (e: FocusEvent) => {
      if (!el.contains(e.relatedTarget as Node | null)) release();
    };
    el.addEventListener("mouseenter", hold);
    el.addEventListener("mouseleave", release);
    el.addEventListener("focusin", hold);
    el.addEventListener("focusout", handleFocusOut);

    return () => {
      el.removeEventListener("mouseenter", hold);
      el.removeEventListener("mouseleave", release);
      el.removeEventListener("focusin", hold);
      el.removeEventListener("focusout", handleFocusOut);
      stopTimer();
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      if (observer) observer.disconnect();
      el.removeEventListener("touchstart", handleInteraction);
      el.removeEventListener("pointerdown", handleInteraction);
      el.removeEventListener("wheel", handleInteraction);
    };
  }, [scrollToNext, interval, pauseAutoScroll]);

  return scrollRef;
}

"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { siteData } from "@/data/siteData";
import { Badge } from "@/components/ui/Badge";
import { MapPin, Sparkles, Star, ChevronDown, ArrowUpRight, Pause, Play } from "lucide-react";
import { LUXURY_EASING, LUXURY_DURATION } from "@/lib/motion";

export default function Hero() {
  const { hero } = siteData;
  const shouldReduceMotion = useReducedMotion();
  const portraitVideoRef = useRef<HTMLVideoElement>(null);
  const landscapeVideoRef = useRef<HTMLVideoElement>(null);

  const [isVideoPaused, setIsVideoPaused] = useState(false);
  const userPausedRef = useRef(false);

  // Only the video that is actually on screen (portrait vs landscape) plays.
  // Respects reduced-motion and a visitor's explicit pause (WCAG 2.2.2).
  useEffect(() => {
    const isShown = (v: HTMLVideoElement | null) => !!v && v.offsetParent !== null;

    const sync = () => {
      [portraitVideoRef.current, landscapeVideoRef.current].forEach((video) => {
        if (!video) return;
        video.muted = true;
        video.playsInline = true;
        if (userPausedRef.current || !isShown(video)) {
          video.pause();
          return;
        }
        video.play().catch(() => {
          const retry = () => {
            if (!userPausedRef.current && isShown(video)) video.play().catch(() => {});
          };
          window.addEventListener("touchstart", retry, { once: true, passive: true });
          window.addEventListener("click", retry, { once: true, passive: true });
        });
      });
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      userPausedRef.current = true;
      setIsVideoPaused(true);
    }

    sync();
    const onVisibility = () => document.visibilityState === "visible" && sync();
    const orientation = window.matchMedia("(orientation: portrait)");
    document.addEventListener("visibilitychange", onVisibility);
    orientation.addEventListener?.("change", sync);
    window.addEventListener("resize", sync, { passive: true });
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      orientation.removeEventListener?.("change", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  const toggleVideo = () => {
    const next = !userPausedRef.current;
    userPausedRef.current = next;
    setIsVideoPaused(next);
    [portraitVideoRef.current, landscapeVideoRef.current].forEach((video) => {
      if (!video) return;
      if (next) video.pause();
      else if (video.offsetParent !== null) video.play().catch(() => {});
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 18 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: LUXURY_DURATION.slow,
        ease: LUXURY_EASING.editorial,
      },
    },
  };

  return (
    <section
      id="home"
      className="relative min-h-[100dvh] w-full overflow-hidden flex flex-col justify-center pt-24 sm:pt-28 pb-14 sm:pb-16"
    >
      {/* ── High-Definition Zero-Lag Video Background ── */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#131d17]">
        {/* Portrait Video — Shown in Portrait orientation & Mobile views */}
        <video
          ref={portraitVideoRef}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
          className="absolute inset-0 w-full h-full object-cover object-center portrait:block landscape:hidden max-md:block md:landscape:hidden"
          style={{
            transform: "translate3d(0,0,0)",
            backfaceVisibility: "hidden",
          }}
        >
          <source src="/videos/hero-portrait.mp4" type="video/mp4" />
        </video>

        {/* Landscape Drone Video — Shown in Landscape orientation & Desktop views */}
        <video
          ref={landscapeVideoRef}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
          className="absolute inset-0 w-full h-full object-cover object-center hidden landscape:block portrait:hidden md:portrait:hidden md:landscape:block"
          style={{
            transform: "translate3d(0,0,0)",
            backfaceVisibility: "hidden",
          }}
        >
          <source src="/videos/hero-drone.mp4" type="video/mp4" />
        </video>

        {/* Natural Warm Film Vignette & Subtle Cinematic Scrim */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111c15]/70 via-transparent to-transparent pointer-events-none" />
        {/* Reading scrim behind the headline column so body copy holds 4.5:1 on bright frames */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent md:via-black/10 pointer-events-none" />
      </div>

      <div className="container-custom relative z-10 flex flex-col justify-center my-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="max-w-3xl 2xl:max-w-4xl"
        >
          {/* Authentic Hospitality Eyebrow Strip */}
          <motion.div variants={itemVariants} className="mb-4 sm:mb-6 inline-flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white font-eyebrow tracking-[0.2em] text-[11px] sm:text-xs uppercase">
              <MapPin size={12} className="text-mint-300" />
              <span>{hero.badge}</span>
            </div>

            <a
              href="https://www.tripadvisor.com/Hotel_Review-g297896-d34099769-Reviews-Kekulama_Eco_Cabana-Galle_Galle_District_Southern_Province.html"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Rated 5.0 on TripAdvisor (opens in a new tab)"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/90 hover:bg-white/20 hover:text-white transition-colors font-body text-[11px] font-medium"
            >
              <div className="w-2 h-2 rounded-full bg-[#00AA6C]" />
              <span>TripAdvisor 5.0</span>
              <Star size={11} className="fill-current text-amber-300" aria-hidden="true" />
            </a>
          </motion.div>

          {/* Bespoke Human-Crafted Editorial Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl 2xl:text-8xl font-display font-medium text-white leading-[1.04] tracking-[-0.02em] mb-5 sm:mb-7 drop-shadow-sm"
          >
            <span className="block font-normal text-white/90 text-2xl sm:text-3xl md:text-4xl 2xl:text-5xl mb-1 sm:mb-2">
              Disconnect & Recharge at
            </span>
            <span className="font-serif italic font-medium text-amber-100 pr-2">
              Kekulama
            </span>
            <span className="font-normal text-white">Eco Cabana</span>
          </motion.h1>

          {/* Understated Editorial Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg md:text-xl text-white/90 font-body font-normal max-w-xl 2xl:max-w-2xl leading-relaxed mb-6 sm:mb-8"
          >
            {hero.subtitle}
          </motion.p>

          {/* Action CTAs */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3 sm:gap-4 mb-2">
            <Link
              href="/book"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-body text-xs sm:text-sm font-semibold uppercase tracking-[0.14em] bg-mint-700 hover:bg-mint-800 text-white shadow-glow transition-all min-h-[48px] active:scale-98"
            >
              <span>Book Your Stay</span>
              <ArrowUpRight size={16} />
            </Link>
            <a
              href="#booking"
              className="inline-flex items-center gap-2 min-h-[48px] px-5 py-3.5 rounded-full font-body text-xs sm:text-sm font-medium tracking-[0.05em] bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/20 transition-all active:scale-98"
            >
              <span>Check Live Rates</span>
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Background video pause control (auto-playing motion must be stoppable) */}
      <button
        type="button"
        onClick={toggleVideo}
        aria-pressed={isVideoPaused}
        aria-label={isVideoPaused ? "Play background video" : "Pause background video"}
        className="focus-on-dark absolute bottom-[6.75rem] right-[1.375rem] sm:bottom-[7.5rem] sm:right-[2.125rem] z-20 w-11 h-11 rounded-full bg-black/30 hover:bg-black/45 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-colors"
      >
        {isVideoPaused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
      </button>

      {/* Understated Minimalist Scroll Cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        aria-hidden="true"
        className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-white/80 pointer-events-none"
      >
        <span className="font-eyebrow text-[11px] uppercase tracking-[0.25em]">Explore</span>
        <ChevronDown size={14} className="animate-bounce" />
      </motion.div>
    </section>
  );
}

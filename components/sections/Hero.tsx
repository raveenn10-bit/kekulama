"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { siteData } from "@/data/siteData";
import { Badge } from "@/components/ui/Badge";
import { MapPin, Sparkles, Star, ChevronDown } from "lucide-react";
import { LUXURY_EASING, LUXURY_DURATION } from "@/lib/motion";

export default function Hero() {
  const { hero } = siteData;
  const shouldReduceMotion = useReducedMotion();
  const portraitVideoRef = useRef<HTMLVideoElement>(null);
  const landscapeVideoRef = useRef<HTMLVideoElement>(null);

  // Guarantee unblocked, smooth autoplay across all mobile and desktop browsers
  useEffect(() => {
    const playSafe = (video: HTMLVideoElement | null) => {
      if (!video) return;
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;

      const promise = video.play();
      if (promise !== undefined) {
        promise.catch(() => {
          const handleFirstGesture = () => {
            video.play().catch(() => {});
          };
          window.addEventListener("touchstart", handleFirstGesture, { once: true, passive: true });
          window.addEventListener("click", handleFirstGesture, { once: true, passive: true });
          window.addEventListener("scroll", handleFirstGesture, { once: true, passive: true });
        });
      }
    };

    playSafe(portraitVideoRef.current);
    playSafe(landscapeVideoRef.current);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        playSafe(portraitVideoRef.current);
        playSafe(landscapeVideoRef.current);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

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
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onCanPlay={(e) => e.currentTarget.play().catch(() => {})}
          onPause={(e) => e.currentTarget.play().catch(() => {})}
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
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onCanPlay={(e) => e.currentTarget.play().catch(() => {})}
          onPause={(e) => e.currentTarget.play().catch(() => {})}
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white font-eyebrow tracking-[0.2em] text-[10.5px] sm:text-xs uppercase">
              <MapPin size={12} className="text-mint-300" />
              <span>{hero.badge}</span>
            </div>

            <a
              href="https://www.tripadvisor.com/Hotel_Review-g297896-d34099769-Reviews-Kekulama_Eco_Cabana-Galle_Galle_District_Southern_Province.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/90 hover:bg-[#00AA6C] hover:text-white transition-all font-body text-[11px] font-medium"
            >
              <div className="w-2 h-2 rounded-full bg-[#00AA6C]" />
              <span>TripAdvisor 5.0 ★</span>
            </a>
          </motion.div>

          {/* Bespoke Human-Crafted Editorial Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl 2xl:text-8xl font-display text-white leading-[1.08] tracking-[-0.02em] mb-5 sm:mb-7 drop-shadow-sm"
          >
            <span className="block font-light text-white/90 text-2xl sm:text-3xl md:text-4xl 2xl:text-5xl mb-1 sm:mb-2">
              Disconnect & Recharge at
            </span>
            <span className="font-serif italic font-normal text-amber-100 pr-2">
              Kekulama
            </span>
            <span className="font-normal text-white">Eco Cabana</span>
          </motion.h1>

          {/* Understated Editorial Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg md:text-xl text-white/85 font-body font-light max-w-xl 2xl:max-w-2xl leading-relaxed mb-6 sm:mb-8"
          >
            {hero.subtitle}
          </motion.p>
        </motion.div>
      </div>

      {/* Understated Minimalist Scroll Cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-white/70 pointer-events-none"
      >
        <span className="font-eyebrow text-[9px] uppercase tracking-[0.25em]">Explore</span>
        <ChevronDown size={14} className="animate-bounce" />
      </motion.div>
    </section>
  );
}

"use client";

import React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { siteData } from "@/data/siteData";
import { Badge } from "@/components/ui/Badge";
import { MapPin, Sparkles, Star } from "lucide-react";
import { LUXURY_EASING, LUXURY_DURATION } from "@/lib/motion";

export default function Hero() {
  const { hero } = siteData;
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: LUXURY_DURATION.slow,
        ease: LUXURY_EASING.quintOut,
      },
    },
  };

  return (
    <section
      id="home"
      className="relative min-h-[100dvh] w-full overflow-hidden flex flex-col justify-center pt-24 sm:pt-28 pb-14 sm:pb-16"
    >
      {/* ── High-Definition Zero-Lag Video Background ── */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-forest-dark">
        {/* Portrait Video — Shown in Portrait orientation & Mobile views */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/images/hero.jpg"
          className="absolute inset-0 w-full h-full object-cover object-center portrait:block landscape:hidden max-md:block md:landscape:hidden"
          style={{
            transform: "translate3d(0,0,0)",
            backfaceVisibility: "hidden",
            imageRendering: "crisp-edges",
          }}
        >
          <source src="/videos/hero-portrait.mp4" type="video/mp4" />
        </video>

        {/* Landscape Drone Video — Shown in Landscape orientation & Desktop views */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/images/hero.jpg"
          className="absolute inset-0 w-full h-full object-cover object-center hidden landscape:block portrait:hidden md:portrait:hidden md:landscape:block"
          style={{
            transform: "translate3d(0,0,0)",
            backfaceVisibility: "hidden",
            imageRendering: "crisp-edges",
          }}
        >
          <source src="/videos/hero-drone.mp4" type="video/mp4" />
        </video>

        {/* Crystal-Clear Subtle Overlay — Maximum Video Clarity & Vibrancy */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/55 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/60 via-transparent to-transparent pointer-events-none" />
      </div>

      <div className="container-custom relative z-10 flex flex-col justify-center my-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="max-w-4xl"
        >
          {/* Eyebrow badge with inscriptional tracking */}
          <motion.div variants={itemVariants} className="mb-5 sm:mb-6 inline-flex items-center gap-2 flex-wrap">
            <Badge dot variant="mint" className="bg-mint-950/40 text-mint-200 border-mint-400/40 backdrop-blur-md shadow-sm">
              <span className="flex items-center gap-1.5 font-eyebrow tracking-[0.2em] text-[10px] sm:text-xs">
                <MapPin size={12} className="text-mint-300" />
                {hero.badge}
              </span>
            </Badge>
            <span className="inline-flex items-center gap-1.5 font-eyebrow text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-white px-3.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/15">
              <Sparkles size={11} className="text-mint-300" />
              Eco Luxury Sanctuary
            </span>
            <a
              href="https://www.tripadvisor.com/Hotel_Review-g297896-d34099769-Reviews-Kekulama_Eco_Cabana-Galle_Galle_District_Southern_Province.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-eyebrow text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-amber-200 px-3.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-amber-400/30 hover:bg-amber-500/20 transition-colors"
            >
              <Star size={11} className="text-amber-400 fill-amber-400" />
              <span>TripAdvisor 5.0 ★</span>
            </a>
          </motion.div>

          {/* Editorial Display Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display text-white leading-[1.12] sm:leading-[1.1] tracking-[-0.015em] mb-6 sm:mb-8 drop-shadow-md"
          >
            <span className="block font-light text-slate-100 mb-1 sm:mb-2 text-2xl sm:text-3xl md:text-4xl">
              Disconnect & Recharge at
            </span>
            <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-mint-200 via-mint-300 to-eucalyptus-300 pr-2">
              Kekulama
            </span>
            <span className="font-normal text-white"> Eco Cabana</span>
          </motion.h1>

          {/* Refined Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg md:text-xl text-slate-100/90 font-body font-normal max-w-2xl leading-relaxed mb-6 sm:mb-8 drop-shadow"
          >
            {hero.subtitle}
          </motion.p>
        </motion.div>
      </div>

      {/* Subtle Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 pointer-events-none"
      >
        <span className="font-eyebrow text-[9px] uppercase tracking-[0.25em] text-white/80">Scroll</span>
        <div className="w-[1px] h-6 bg-gradient-to-b from-white/80 via-mint-400 to-transparent" />
      </motion.div>
    </section>
  );
}

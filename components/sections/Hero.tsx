"use client";

import React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { siteData } from "@/data/siteData";
import { Sparkles, MapPin, ChevronDown } from "lucide-react";
import { LUXURY_EASING, LUXURY_DURATION } from "@/lib/motion";

export function Hero() {
  const shouldReduceMotion = useReducedMotion();
  const { hero } = siteData;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: LUXURY_DURATION.medium,
        ease: LUXURY_EASING.quintOut,
      },
    },
  };

  const headlineVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
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
      {/* Background Image with Quiet Slow Ambient Movement */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          initial={{ scale: 1.06, opacity: 0 }}
          animate={{ scale: 1.01, opacity: 1 }}
          transition={{
            duration: 1.8,
            ease: LUXURY_EASING.editorial,
          }}
          className="relative w-full h-full"
        >
          <Image
            src="/images/hero.jpg"
            alt="Kekulama Eco Cabana Nature Panorama"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </motion.div>
        {/* Luxury Nature Atmospheric Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-forest-dark/85 via-forest/65 to-forest-dark/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-mint-500/20 via-transparent to-transparent pointer-events-none" />
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
            <Badge dot variant="mint" className="bg-mint-100/20 text-mint-200 border-mint-400/40 backdrop-blur-md">
              <span className="flex items-center gap-1.5 font-eyebrow tracking-[0.2em] text-[10px] sm:text-xs">
                <MapPin size={12} className="text-mint-300" />
                {hero.badge}
              </span>
            </Badge>
            <span className="inline-flex items-center gap-1.5 font-eyebrow text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-eucalyptus-200 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
              <Sparkles size={11} className="text-mint-300" />
              Tea Estate Stay
            </span>
          </motion.div>

          {/* Monumental Luxury Headline */}
          <motion.h1
            variants={headlineVariants}
            className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-white font-normal leading-[1.06] tracking-lux-tight mb-5 sm:mb-7"
          >
            {hero.headline}{" "}
            <span className="italic font-normal bg-gradient-to-r from-mint-200 via-white to-eucalyptus-200 bg-clip-text text-transparent underline decoration-mint-400/40 decoration-wavy decoration-1 underline-offset-8">
              {hero.highlightWord}
            </span>{" "}
            <span className="block sm:inline font-light">Eco Cabana</span>
          </motion.h1>

          {/* Lead Description in Plus Jakarta Sans */}
          <motion.p
            variants={itemVariants}
            className="font-body font-light text-sm sm:text-lg md:text-xl text-eucalyptus-100/95 max-w-2xl mb-8 sm:mb-10 leading-lux-relaxed"
          >
            {hero.subtitle}
          </motion.p>

          {/* Dual Action Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-10 sm:mb-14"
          >
            <Button
              variant="mint"
              size="lg"
              href="https://wa.me/94756657000"
              target="_blank"
              rel="noopener noreferrer"
              className="gap-2 shadow-glow w-full sm:w-auto py-3.5 sm:py-3.5"
            >
              <span>Book via WhatsApp</span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              href="#packages"
              className="border-white/30 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:border-mint-300 w-full sm:w-auto py-3.5 sm:py-3.5"
            >
              Explore Rates & Packages
            </Button>
          </motion.div>

          {/* Luxury Stats Strip (Grid on Mobile for perfect 3-column balance) */}
          <motion.div
            variants={itemVariants}
            className="border-t border-white/15 pt-6 grid grid-cols-3 gap-2 sm:flex sm:gap-16 text-center sm:text-left"
          >
            {hero.stats.map((stat, i) => (
              <div key={i} className="flex flex-col">
                <span className="font-display text-2xl sm:text-4xl text-mint-200 font-normal tracking-tight">
                  {stat.value}
                </span>
                <span className="font-eyebrow text-[9.5px] sm:text-xs text-eucalyptus-200/90 uppercase tracking-[0.2em] mt-0.5">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Down arrow scroll hint */}
      {!shouldReduceMotion && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 4 }}
          transition={{ duration: 1.8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 text-mint-200/60 hidden sm:flex flex-col items-center gap-1"
        >
          <span className="font-eyebrow text-[9px] uppercase tracking-[0.3em] text-mint-300/80">Scroll to Explore</span>
          <ChevronDown size={16} />
        </motion.div>
      )}
    </section>
  );
}

export default Hero;

"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { siteData } from "@/data/siteData";
import { Sparkles, MapPin, ChevronDown } from "lucide-react";

export function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 28 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const { hero } = siteData;

  return (
    <section
      id="home"
      className="relative min-h-[100dvh] w-full overflow-hidden flex flex-col justify-center pt-28 pb-16"
    >
      {/* Background Image with Subtle Atmospheric Zoom */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero.jpg"
          alt="Kekulama Eco Cabana Nature Panorama"
          fill
          priority
          sizes="100vw"
          className="object-cover scale-105 animate-float duration-[12s]"
        />
        {/* Luxury Nature Overlay */}
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
          <motion.div variants={itemVariants} className="mb-6 inline-flex items-center gap-2.5 flex-wrap">
            <Badge dot variant="mint" className="bg-mint-100/20 text-mint-200 border-mint-400/40 backdrop-blur-md">
              <span className="flex items-center gap-1.5 font-eyebrow tracking-[0.22em]">
                <MapPin size={12} className="text-mint-300" />
                {hero.badge}
              </span>
            </Badge>
            <span className="inline-flex items-center gap-1.5 font-eyebrow text-[11px] uppercase tracking-[0.24em] text-eucalyptus-200 px-3 py-0.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
              <Sparkles size={11} className="text-mint-300" />
              Direct Tea Estate Stay
            </span>
          </motion.div>

          {/* Monumental Luxury Headline in Cormorant Garamond */}
          <motion.h1
            variants={itemVariants}
            className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-white font-normal leading-[1.04] tracking-lux-tight mb-7"
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
            className="font-body font-light text-base sm:text-lg md:text-xl text-eucalyptus-100 max-w-2xl mb-10 leading-lux-relaxed"
          >
            {hero.subtitle}
          </motion.p>

          {/* Dual Action Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center gap-4 mb-14"
          >
            <Button
              variant="mint"
              size="lg"
              href="https://wa.me/94756657000"
              target="_blank"
              rel="noopener noreferrer"
              className="gap-2 shadow-glow w-full sm:w-auto"
            >
              <span>Book via WhatsApp</span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              href="#packages"
              className="border-white/30 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:border-mint-300 w-full sm:w-auto"
            >
              Explore Rates & Packages
            </Button>
          </motion.div>

          {/* Luxury Stats Strip */}
          <motion.div
            variants={itemVariants}
            className="border-t border-white/15 pt-7 flex flex-wrap items-center gap-8 sm:gap-16"
          >
            {hero.stats.map((stat, i) => (
              <div key={i} className="flex flex-col">
                <span className="font-display text-3xl sm:text-4xl text-mint-200 font-normal tracking-tight">
                  {stat.value}
                </span>
                <span className="font-eyebrow text-[11px] sm:text-xs text-eucalyptus-200/90 uppercase tracking-[0.22em] mt-0.5">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Down arrow scroll hint */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-mint-200/60 hidden sm:flex flex-col items-center gap-1"
      >
        <span className="font-eyebrow text-[9px] uppercase tracking-[0.3em] text-mint-300/80">Scroll to Explore</span>
        <ChevronDown size={16} />
      </motion.div>
    </section>
  );
}

export default Hero;

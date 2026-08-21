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
      className="relative min-h-[100dvh] w-full overflow-hidden flex flex-col justify-center pt-24 pb-16"
    >
      {/* Background Image with Parallax & Soft Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero.jpg"
          alt="Kekulama Eco Cabana Nature Panorama"
          fill
          priority
          sizes="100vw"
          className="object-cover scale-105 animate-float duration-[10s]"
        />
        {/* Soft Multi-tone Nature Overlay: Mint Lagoon into Eucalyptus Forest */}
        <div className="absolute inset-0 bg-gradient-to-b from-forest-dark/80 via-forest/65 to-forest-dark/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-mint-500/20 via-transparent to-transparent pointer-events-none" />
      </div>

      <div className="container-custom relative z-10 flex flex-col justify-center my-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="max-w-3xl"
        >
          {/* Badge with pulse dot */}
          <motion.div variants={itemVariants} className="mb-6 inline-flex items-center gap-2">
            <Badge dot variant="mint" className="bg-mint-100/20 text-mint-200 border-mint-400/40 backdrop-blur-md">
              <span className="flex items-center gap-1.5">
                <MapPin size={12} className="text-mint-300" />
                {hero.badge}
              </span>
            </Badge>
            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-eucalyptus-200 font-medium px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-sm">
              <Sparkles size={11} className="text-mint-300" />
              Direct Tea Estate Stay
            </span>
          </motion.div>

          {/* Heading with Mint & Eucalyptus highlighted typography */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display text-white leading-[1.1] mb-6 tracking-tight"
          >
            {hero.headline}{" "}
            <span className="italic bg-gradient-to-r from-mint-300 via-mint-200 to-eucalyptus-300 bg-clip-text text-transparent underline decoration-mint-400/30 decoration-wavy decoration-1 underline-offset-8">
              {hero.highlightWord}
            </span>{" "}
            Eco Cabana
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg md:text-xl text-eucalyptus-100 max-w-2xl mb-8 sm:mb-10 leading-relaxed"
          >
            {hero.subtitle}
          </motion.p>

          {/* Dual Action Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center gap-4 mb-12"
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

          {/* Horizontal Stats Row with Micro-Glow on Mobile */}
          <motion.div
            variants={itemVariants}
            className="border-t border-white/15 pt-6 flex flex-wrap items-center gap-8 sm:gap-14"
          >
            {hero.stats.map((stat, i) => (
              <div key={i} className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-display text-mint-200 font-bold tracking-tight">
                  {stat.value}
                </span>
                <span className="text-xs sm:text-sm text-eucalyptus-200 font-medium mt-0.5">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Down arrow scroll hint */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-mint-200/60 hidden sm:flex flex-col items-center gap-1"
      >
        <span className="text-[10px] uppercase tracking-widest text-mint-300/80">Scroll to Explore</span>
        <ChevronDown size={18} />
      </motion.div>
    </section>
  );
}

export default Hero;

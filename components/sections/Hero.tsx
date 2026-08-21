"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { siteData } from "@/data/siteData";

export function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  // Fallback data if siteData.hero is not fully defined
  const heroData = siteData?.hero || {
    subtitle: "Experience luxury in harmony with nature at our exclusive eco cabana, nestled within lush gardens and minutes away from the historic Galle Fort.",
    stats: [
      { value: "5 min", label: "to Galle Fort" },
      { value: "100%", label: "Eco-friendly" },
      { value: "4", label: "Guests Max" }
    ]
  };

  return (
    <section className="relative min-h-[100dvh] w-full overflow-hidden flex flex-col justify-center pt-28">
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero.jpg"
          alt="Kekulama Eco Cabana Hero Background"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-dark/70 via-forest/50 to-forest-dark/80" />
      </div>

      <div className="container-custom relative z-10 flex flex-col justify-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="max-w-3xl"
        >
          <motion.div variants={itemVariants} className="mb-6 inline-block">
            <Badge dot className="bg-white/10 text-white border-white/20">
              Pinnaduwa, Galle · Sri Lanka
            </Badge>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-display text-white leading-tight mb-6"
          >
            Disconnect & Recharge at <br />
            <span className="italic text-[#d4b58e]">Kekulama</span> Eco Cabana
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-lg text-sage-200 max-w-xl mb-10"
          >
            {heroData.subtitle}
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4">
            <Button variant="primary" size="lg" href="https://wa.me/94756657000">
              Book via WhatsApp
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              href="#packages"
              className="border-white/40 text-white hover:bg-white/10"
            >
              Explore Packages
            </Button>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="border-t border-white/15 mt-12 pt-8 flex flex-wrap items-center gap-12"
          >
            {heroData.stats.map((stat: any, i: number) => (
              <div key={i} className="flex flex-col">
                <span className="text-2xl font-display text-white mb-1">
                  {stat.value}
                </span>
                <span className="text-sm text-sage-300">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;

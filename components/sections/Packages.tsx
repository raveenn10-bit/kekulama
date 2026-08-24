"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Check, Sparkles, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { siteData } from "@/data/siteData";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LUXURY_EASING, LUXURY_DURATION } from "@/lib/motion";
import { useAutoScroll } from "@/hooks/useAutoScroll";

export default function Packages() {
  const { packages } = siteData;
  const [activeTab, setActiveTab] = useState<"all" | "day" | "night" | "meals">("all");
  const shouldReduceMotion = useReducedMotion();
  const scrollRef = useAutoScroll({ interval: 3200 });

  const dayPackages = packages.filter((p) => p.name.includes("Day Out"));
  const nightPackages = packages.filter((p) => p.name.includes("Night Stay"));
  const mealPackages = packages.filter(
    (p) => p.name.includes("Bed & Breakfast") || p.name.includes("Board")
  );

  const displayedPackages =
    activeTab === "day"
      ? dayPackages
      : activeTab === "night"
      ? nightPackages
      : activeTab === "meals"
      ? mealPackages
      : packages;

  return (
    <section id="packages" className="bg-gradient-to-b from-eucalyptus-50 via-mint-50/40 to-sand-50 section-padding relative overflow-hidden">
      {/* Soft Background Ambience */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-mint-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-eucalyptus-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="container-custom relative z-10">
        <SectionHeading
          badge="Curated Stays & Rates"
          title="Choose your perfect"
          highlight="stay"
          subtitle="All prices in Sri Lankan Rupees (LKR). Direct booking via WhatsApp with instant confirmation and personalized service."
        />

        {/* Filter Pills with Liquid Slider Pill Animation */}
        <div className="flex items-center justify-center gap-2.5 mb-12 2xl:mb-16 overflow-x-auto no-scrollbar pb-2">
          {[
            { id: "all", label: "All Packages" },
            { id: "day", label: "Day Out" },
            { id: "night", label: "Night Stay" },
            { id: "meals", label: "Meal Plans (B&B / FB)" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative px-5 py-2.5 2xl:px-6 2xl:py-3 rounded-full font-body text-xs 2xl:text-sm font-semibold uppercase tracking-[0.14em] transition-colors duration-300 whitespace-nowrap cursor-pointer z-10 ${
                  isActive ? "text-white" : "text-sage-700 hover:text-forest"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activePackageTab"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 35,
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-mint-500 to-mint-600 rounded-full shadow-glow -z-10"
                  />
                )}
                {!isActive && (
                  <div className="absolute inset-0 bg-white/95 border border-sage-200/80 rounded-full -z-20 shadow-sm" />
                )}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Mobile Horizontal Snap Row / Desktop Grid */}
        <motion.div
          ref={scrollRef}
          layout
          className="flex overflow-x-auto snap-x snap-mandatory gap-5 2xl:gap-7 pb-6 pt-2 px-1 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 sm:overflow-visible sm:pb-0 no-scrollbar"
        >
          <AnimatePresence mode="popLayout">
            {displayedPackages.map((pkg, index) => (
              <PackageCard
                key={pkg.name}
                pkg={pkg}
                index={index}
                shouldReduceMotion={shouldReduceMotion}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Mobile Swipe Hint Indicator */}
        <div className="flex sm:hidden items-center justify-center gap-1.5 font-eyebrow text-[11px] uppercase tracking-[0.2em] text-sage-500 mt-3">
          <span>👈 Swipe horizontally for all packages 👉</span>
        </div>
      </div>
    </section>
  );
}

function PackageCard({
  pkg,
  index,
  shouldReduceMotion,
}: {
  pkg: any;
  index: number;
  shouldReduceMotion: boolean | null;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{
        duration: LUXURY_DURATION.medium,
        ease: LUXURY_EASING.quintOut,
        delay: index * 0.04,
      }}
      whileHover={shouldReduceMotion ? {} : { y: -6 }}
      className={`snap-center flex-shrink-0 w-[84vw] sm:w-auto bg-white/95 backdrop-blur-md rounded-3xl p-7 2xl:p-8 shadow-soft hover:shadow-glow transition-all duration-300 relative flex flex-col justify-between border ${
        pkg.popular
          ? "border-mint-400 ring-2 ring-mint-300/60 bg-gradient-to-b from-mint-50/70 via-white to-white shadow-glow"
          : "border-eucalyptus-200/80 hover:border-mint-300"
      }`}
    >
      <div>
        {/* Popular Highlight Badge */}
        {pkg.popular && (
          <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-mint-500 via-mint-600 to-mint-500 text-white font-eyebrow text-[10px] 2xl:text-xs uppercase tracking-[0.22em] px-3.5 py-1 rounded-full shadow-md flex items-center gap-1.5 animate-pulse">
            <Sparkles size={11} />
            <span>Most Popular</span>
          </div>
        )}

        <div className="mb-4">
          <span className="font-eyebrow text-[10px] 2xl:text-xs uppercase tracking-[0.26em] text-mint-700 font-normal">
            {pkg.timing ? "Overnight Experience" : "Day / Night Stay"}
          </span>
          <h3 className="font-display text-2xl sm:text-[26px] 2xl:text-3xl text-forest font-normal mt-1 leading-snug">
            {pkg.name}
          </h3>
        </div>

        {/* Price Tag with Luxury Cormorant Numerals and Space Grotesk Currency */}
        <div className="bg-eucalyptus-50/90 rounded-2xl p-4 2xl:p-5 mb-5 border border-eucalyptus-200/70">
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-xs 2xl:text-sm font-bold tracking-[0.16em] uppercase text-mint-700">LKR</span>
            <span className="font-display text-3xl sm:text-4xl 2xl:text-5xl font-normal text-forest tracking-tight">
              {pkg.price}
            </span>
            <span className="font-body text-xs 2xl:text-sm text-sage-600 font-light ml-1">
              / {pkg.unit}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {pkg.timing && (
              <span className="inline-flex items-center gap-1 font-mono text-[10.5px] 2xl:text-xs uppercase tracking-wider text-mint-900 font-medium bg-mint-100/90 px-2.5 py-0.5 rounded-md">
                <span>⏱</span>
                <span>{pkg.timing}</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1 font-eyebrow text-[9.5px] 2xl:text-[10.5px] uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md font-medium">
              <ShieldCheck size={11} className="text-emerald-700" />
              <span>Direct Rate</span>
            </span>
          </div>
        </div>

        {/* Features Checklist */}
        <ul className="space-y-2.5 2xl:space-y-3 mb-6 2xl:mb-8">
          {pkg.features.map((feature: string, i: number) => (
            <li key={i} className="flex items-start gap-2.5 font-body text-xs sm:text-[13px] 2xl:text-sm text-sage-700 leading-normal">
              <div className="w-4 h-4 2xl:w-5 2xl:h-5 rounded-full bg-mint-100 text-mint-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check size={11} strokeWidth={2.5} />
              </div>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA Button */}
      <motion.a
        href={`https://wa.me/94756657000?text=Hello%20Kekulama%20Eco%20Cabana,%20I%20am%20interested%20in%20booking%20the%20${encodeURIComponent(
          pkg.name
        )}%20package.`}
        target="_blank"
        rel="noopener noreferrer"
        whileTap={{ scale: 0.98 }}
        className={`w-full py-3.5 2xl:py-4 px-5 rounded-full text-center font-body text-xs 2xl:text-sm uppercase tracking-[0.15em] font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
          pkg.popular
            ? "bg-gradient-to-r from-mint-500 to-mint-600 text-white shadow-glow hover:from-mint-600 hover:to-mint-700"
            : "bg-sage-100/90 text-forest hover:bg-mint-500 hover:text-white border border-sage-200/80"
        }`}
      >
        <span>Reserve Package</span>
        <ArrowRight size={13} />
      </motion.a>
    </motion.div>
  );
}

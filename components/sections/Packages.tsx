"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { siteData } from "@/data/siteData";
import { SectionHeading } from "@/components/ui/SectionHeading";

export default function Packages() {
  const { packages } = siteData;
  const [activeTab, setActiveTab] = useState<"all" | "day" | "night" | "meals">("all");

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

        {/* Filter Pills */}
        <div className="flex items-center justify-center gap-2.5 mb-10 overflow-x-auto no-scrollbar pb-2">
          {[
            { id: "all", label: "All Packages" },
            { id: "day", label: "Day Out" },
            { id: "night", label: "Night Stay" },
            { id: "meals", label: "Meal Plans (B&B / FB)" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-2 rounded-full font-body text-xs font-semibold uppercase tracking-[0.14em] transition-all duration-300 whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? "bg-mint-500 text-white shadow-glow scale-105"
                  : "bg-white/80 text-sage-700 hover:bg-mint-100/70 border border-sage-200/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Mobile Horizontal Snap Row / Desktop Grid */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-5 pb-6 pt-2 px-1 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:overflow-visible sm:pb-0 no-scrollbar">
          {displayedPackages.map((pkg, index) => (
            <PackageCard key={pkg.name} pkg={pkg} index={index} />
          ))}
        </div>

        {/* Mobile Swipe Hint Indicator */}
        <div className="flex sm:hidden items-center justify-center gap-1.5 font-eyebrow text-[11px] uppercase tracking-[0.2em] text-sage-500 mt-3">
          <span>👈 Swipe horizontally for all packages 👉</span>
        </div>
      </div>
    </section>
  );
}

function PackageCard({ pkg, index }: { pkg: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      className={`snap-center flex-shrink-0 w-[84vw] sm:w-auto bg-white/95 backdrop-blur-sm rounded-3xl p-7 shadow-soft hover:shadow-glow transition-all duration-300 relative flex flex-col justify-between border ${
        pkg.popular
          ? "border-mint-400 ring-2 ring-mint-300/60 bg-gradient-to-b from-mint-50/60 via-white to-white"
          : "border-eucalyptus-200/80 hover:border-mint-300"
      }`}
    >
      <div>
        {/* Popular Highlight Badge */}
        {pkg.popular && (
          <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-mint-500 to-mint-600 text-white font-eyebrow text-[10px] uppercase tracking-[0.22em] px-4 py-1 rounded-full shadow-md flex items-center gap-1.5">
            <Sparkles size={11} />
            <span>Most Popular</span>
          </div>
        )}

        <div className="mb-4">
          <span className="font-eyebrow text-[10px] uppercase tracking-[0.26em] text-mint-700 font-normal">
            {pkg.timing ? "Overnight Experience" : "Day / Night Stay"}
          </span>
          <h3 className="font-display text-2xl sm:text-3xl text-forest font-normal mt-1.5 leading-snug">
            {pkg.name}
          </h3>
        </div>

        {/* Price Tag with Luxury Cormorant Numerals and Space Grotesk Currency */}
        <div className="bg-eucalyptus-50/90 rounded-2xl p-4 mb-5 border border-eucalyptus-200/70">
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-xs font-bold tracking-[0.16em] uppercase text-mint-700">LKR</span>
            <span className="font-display text-3xl sm:text-4xl font-normal text-forest tracking-tight">
              {pkg.price}
            </span>
            <span className="font-body text-xs text-sage-600 font-light ml-1">
              / {pkg.unit}
            </span>
          </div>
          {pkg.timing && (
            <span className="inline-block font-mono text-[10.5px] uppercase tracking-wider text-mint-900 font-medium bg-mint-100/90 px-2.5 py-0.5 rounded-md mt-2">
              ⏱ {pkg.timing}
            </span>
          )}
        </div>

        {/* Features Checklist */}
        <ul className="space-y-2.5 mb-6">
          {pkg.features.map((feature: string, i: number) => (
            <li key={i} className="flex items-start gap-2.5 font-body text-xs sm:text-[13px] text-sage-700 leading-normal">
              <div className="w-4 h-4 rounded-full bg-mint-100 text-mint-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check size={11} strokeWidth={2.5} />
              </div>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA Button */}
      <a
        href={`https://wa.me/94756657000?text=Hello%20Kekulama%20Eco%20Cabana,%20I%20am%20interested%20in%20booking%20the%20${encodeURIComponent(
          pkg.name
        )}%20package.`}
        target="_blank"
        rel="noopener noreferrer"
        className={`w-full py-3 px-5 rounded-full text-center font-body text-xs uppercase tracking-[0.15em] font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
          pkg.popular
            ? "bg-gradient-to-r from-mint-500 to-mint-600 text-white shadow-glow hover:from-mint-600 hover:to-mint-700"
            : "bg-sage-100/90 text-forest hover:bg-mint-500 hover:text-white border border-sage-200/80"
        }`}
      >
        <span>Reserve Package</span>
        <ArrowRight size={13} />
      </a>
    </motion.div>
  );
}

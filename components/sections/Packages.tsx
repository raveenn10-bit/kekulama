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
      {/* Soft Background Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-mint-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-eucalyptus-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="container-custom relative z-10">
        <SectionHeading
          badge="Transparent Rates"
          title="Choose your perfect"
          highlight="stay"
          subtitle="All prices in Sri Lankan Rupees (LKR). Direct booking via WhatsApp with instant confirmation."
        />

        {/* Filter Pills with Mint & Eucalyptus Styling */}
        <div className="flex items-center justify-center gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
          {[
            { id: "all", label: "All Packages" },
            { id: "day", label: "Day Out" },
            { id: "night", label: "Night Stay" },
            { id: "meals", label: "Meal Plans (B&B / FB)" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap cursor-pointer ${
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
        <div className="flex sm:hidden items-center justify-center gap-1 text-xs text-sage-400 mt-2">
          <span>👈 Swipe horizontally to view all rates 👉</span>
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
      className={`snap-center flex-shrink-0 w-[84vw] sm:w-auto bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-soft hover:shadow-glow transition-all duration-300 relative flex flex-col justify-between border ${
        pkg.popular
          ? "border-mint-400 ring-2 ring-mint-300/60 bg-gradient-to-b from-mint-50/60 via-white to-white"
          : "border-eucalyptus-200/80 hover:border-mint-300"
      }`}
    >
      <div>
        {/* Popular Highlight Badge */}
        {pkg.popular && (
          <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-mint-500 to-mint-600 text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md flex items-center gap-1">
            <Sparkles size={12} />
            <span>Most Popular</span>
          </div>
        )}

        <div className="mb-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-mint-600">
            {pkg.timing ? "Check-in 2:00 PM" : "Day/Night Package"}
          </span>
          <h3 className="text-xl font-display font-bold text-forest mt-1">
            {pkg.name}
          </h3>
        </div>

        {/* Price Tag with Eucalyptus & Mint accents */}
        <div className="bg-eucalyptus-50/80 rounded-2xl p-4 mb-5 border border-eucalyptus-100">
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-bold text-mint-700">LKR</span>
            <span className="text-3xl sm:text-4xl font-display font-bold text-forest">
              {pkg.price}
            </span>
            <span className="text-xs text-sage-600 font-medium ml-1">
              / {pkg.unit}
            </span>
          </div>
          {pkg.timing && (
            <span className="inline-block text-[11px] text-mint-800 font-semibold bg-mint-100/80 px-2 py-0.5 rounded-md mt-2">
              ⏱ {pkg.timing}
            </span>
          )}
        </div>

        {/* Features Checklist */}
        <ul className="space-y-2.5 mb-6">
          {pkg.features.map((feature: string, i: number) => (
            <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-sage-700">
              <div className="w-4 h-4 rounded-full bg-mint-100 text-mint-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check size={11} strokeWidth={2.5} />
              </div>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA Button with WhatsApp Link */}
      <a
        href={`https://wa.me/94756657000?text=Hello%20Kekulama%20Eco%20Cabana,%20I%20am%20interested%20in%20booking%20the%20${encodeURIComponent(
          pkg.name
        )}%20package.`}
        target="_blank"
        rel="noopener noreferrer"
        className={`w-full py-3 px-5 rounded-full text-center text-xs sm:text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
          pkg.popular
            ? "bg-gradient-to-r from-mint-500 to-mint-600 text-white shadow-glow hover:from-mint-600 hover:to-mint-700"
            : "bg-sage-100/90 text-forest hover:bg-mint-500 hover:text-white border border-sage-200/80"
        }`}
      >
        <span>Book This Package</span>
        <ArrowRight size={14} />
      </a>
    </motion.div>
  );
}

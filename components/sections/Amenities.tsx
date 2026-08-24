"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Bath,
  Shirt,
  Coffee,
  Tv,
  Speaker,
  Refrigerator,
  Droplets,
  CookingPot,
  Wind,
  TreePine,
} from "lucide-react";
import { siteData } from "@/data/siteData";
import { SectionHeading } from "@/components/ui/SectionHeading";

const iconMap: Record<string, any> = {
  Bath,
  Shirt,
  Coffee,
  Tv,
  Speaker,
  Refrigerator,
  Droplets,
  CookingPot,
  Wind,
  TreePine,
};

export default function Amenities() {
  const { amenities } = siteData;

  return (
    <section id="amenities" className="bg-white section-padding relative overflow-hidden">
      <div className="container-custom">
        <SectionHeading
          badge="Property Amenities"
          title="Comforts designed for"
          highlight="nature living"
          subtitle="From 45' Smart TV and JBL audio to hot water pressure pump and kitchenette — thoughtful appointments for an effortless retreat."
        />

        {/* Mobile Horizontal Snap Row / Desktop 5-Col Grid */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-5 pt-2 px-1 sm:grid sm:grid-cols-3 md:grid-cols-5 sm:overflow-visible sm:pb-0 no-scrollbar">
          {amenities.map((amenity, index) => {
            const Icon = iconMap[amenity.icon] || TreePine;
            return (
              <motion.div
                key={amenity.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.45,
                  ease: [0.16, 1, 0.3, 1],
                  delay: index * 0.04,
                }}
                whileHover={{ y: -5 }}
                className="snap-center flex-shrink-0 w-[44vw] sm:w-auto bg-gradient-to-b from-mint-50/50 via-white to-eucalyptus-50/40 rounded-3xl p-5 text-center shadow-soft hover:shadow-glow transition-all duration-300 border border-mint-100 hover:border-mint-300 flex flex-col items-center justify-center group"
              >
                <div className="w-13 h-13 rounded-2xl bg-mint-100/80 text-mint-700 flex items-center justify-center mb-3.5 group-hover:bg-mint-500 group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-sm">
                  <Icon size={26} strokeWidth={1.5} />
                </div>
                <span className="font-body text-xs sm:text-[13.5px] font-semibold text-forest group-hover:text-mint-700 transition-colors">
                  {amenity.label}
                </span>
                {amenity.category && (
                  <span className="font-eyebrow text-[9.5px] uppercase tracking-[0.22em] text-sage-400 font-normal mt-1">
                    {amenity.category}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Mobile Swipe Hint */}
        <div className="flex sm:hidden items-center justify-center gap-1.5 font-eyebrow text-[11px] uppercase tracking-[0.2em] text-sage-400 mt-3">
          <span>👈 Swipe horizontally for all amenities 👉</span>
        </div>
      </div>
    </section>
  );
}

"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
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
import { LUXURY_EASING, LUXURY_DURATION } from "@/lib/motion";
import { useAutoScroll } from "@/hooks/useAutoScroll";

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
  const shouldReduceMotion = useReducedMotion();
  const scrollRef = useAutoScroll({ interval: 2600 });

  return (
    <section id="amenities" className="bg-white section-padding relative overflow-hidden">
      <div className="container-custom">
        <SectionHeading
          badge="Property Appointments"
          title="Comforts designed for"
          highlight="nature living"
          subtitle="From 45' Smart TV and JBL audio to hot water pressure pump and kitchenette — thoughtful appointments for an effortless retreat."
        />

        {/* Mobile Horizontal Snap Row / Desktop 5-Col Grid */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-5 pt-2 px-1 sm:grid sm:grid-cols-3 md:grid-cols-5 sm:overflow-visible sm:pb-0 no-scrollbar"
        >
          {amenities.map((amenity, index) => {
            const Icon = iconMap[amenity.icon] || TreePine;
            return (
              <motion.div
                key={amenity.label}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: LUXURY_DURATION.medium,
                  ease: LUXURY_EASING.quintOut,
                  delay: index * 0.035,
                }}
                whileHover={shouldReduceMotion ? {} : { y: -4 }}
                className="snap-center flex-shrink-0 w-[44vw] sm:w-auto bg-gradient-to-b from-mint-50/40 via-white to-eucalyptus-50/30 rounded-3xl p-5 sm:p-6 text-center shadow-soft hover:shadow-glow transition-all duration-300 border border-eucalyptus-200/80 hover:border-mint-300 flex flex-col items-center justify-center group"
              >
                <motion.div
                  whileHover={shouldReduceMotion ? {} : { scale: 1.08 }}
                  transition={{ duration: 0.25, ease: LUXURY_EASING.quintOut }}
                  className="w-12 h-12 rounded-2xl bg-mint-100/90 text-mint-700 flex items-center justify-center mb-3.5 group-hover:bg-mint-500 group-hover:text-white transition-colors duration-300 shadow-sm"
                >
                  <Icon size={24} strokeWidth={1.5} />
                </motion.div>
                <span className="font-body text-xs sm:text-[13px] font-semibold text-forest group-hover:text-mint-700 transition-colors">
                  {amenity.label}
                </span>
                {amenity.category && (
                  <span className="font-eyebrow text-[9.5px] uppercase tracking-[0.22em] text-sage-400 font-normal mt-1.5">
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

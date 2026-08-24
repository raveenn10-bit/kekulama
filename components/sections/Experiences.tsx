"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Landmark, Mountain, Waves, Turtle, MapPin, Calendar } from "lucide-react";
import { siteData } from "@/data/siteData";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LUXURY_EASING, LUXURY_DURATION } from "@/lib/motion";

const iconMap: Record<string, any> = { Landmark, Mountain, Waves, Turtle };

export default function Experiences() {
  const { experiences } = siteData;
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="experiences" className="bg-forest section-padding relative overflow-hidden text-white">
      {/* Background Ambience Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-mint-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-eucalyptus-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container-custom relative z-10">
        <div className="[&_h2]:text-white [&_p]:text-eucalyptus-200 [&_.badge]:bg-mint-400/20 [&_.badge]:text-mint-200 [&_.badge]:border-mint-400/30">
          <SectionHeading
            badge="Southern Adventures"
            title="Curated excursions around"
            highlight="Galle"
            subtitle="From rolling tea plantation walks right from your verandah to UNESCO world heritage bastions and southern surf breaks."
          />
        </div>

        {/* Mobile Horizontal Snap Row / Desktop 2-Col Grid */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-5 pb-6 pt-2 px-1 md:grid md:grid-cols-2 md:overflow-visible md:pb-0 no-scrollbar">
          {experiences.map((exp: any, index: number) => {
            const Icon = iconMap[exp.icon] || Landmark;
            return (
              <motion.div
                key={exp.title}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: LUXURY_DURATION.medium,
                  ease: LUXURY_EASING.quintOut,
                  delay: index * 0.07,
                }}
                whileHover={shouldReduceMotion ? {} : { y: -4 }}
                className="snap-center flex-shrink-0 w-[84vw] md:w-auto bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-7 hover:bg-white/15 hover:border-mint-400/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <motion.div
                      whileHover={shouldReduceMotion ? {} : { scale: 1.06 }}
                      transition={{ duration: 0.25, ease: LUXURY_EASING.quintOut }}
                      className="w-12 h-12 rounded-2xl bg-mint-400/20 text-mint-300 flex items-center justify-center border border-mint-400/30 shadow-sm"
                    >
                      <Icon size={24} strokeWidth={1.5} />
                    </motion.div>
                    {exp.badge && (
                      <span className="font-eyebrow text-[10px] uppercase tracking-[0.24em] font-normal bg-mint-500/20 text-mint-200 border border-mint-400/30 px-3.5 py-1 rounded-full">
                        {exp.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="font-display text-2xl sm:text-3xl text-white font-normal mb-2 leading-snug">
                    {exp.title}
                  </h3>
                  <p className="font-body font-light text-xs sm:text-sm text-eucalyptus-100/90 leading-lux-relaxed">
                    {exp.description}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10 text-xs text-eucalyptus-200">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-mint-300">
                    <MapPin size={13} className="text-mint-300" />
                    <span>{exp.distance}</span>
                  </div>
                  {exp.season && (
                    <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-mint-200">
                      <Calendar size={13} />
                      <span>{exp.season}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile Swipe Hint */}
        <div className="flex md:hidden items-center justify-center gap-1.5 font-eyebrow text-[11px] uppercase tracking-[0.2em] text-mint-200/60 mt-3">
          <span>👈 Swipe for all nearby excursions 👉</span>
        </div>
      </div>
    </section>
  );
}

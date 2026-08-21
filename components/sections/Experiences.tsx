"use client";

import React from "react";
import { motion } from "framer-motion";
import { Landmark, Mountain, Waves, Turtle, MapPin, Calendar, Compass } from "lucide-react";
import { siteData } from "@/data/siteData";
import { SectionHeading } from "@/components/ui/SectionHeading";

const iconMap: Record<string, any> = { Landmark, Mountain, Waves, Turtle };

export default function Experiences() {
  const { experiences } = siteData;

  return (
    <section id="experiences" className="bg-forest section-padding relative overflow-hidden text-white">
      {/* Background Ambience Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-mint-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-eucalyptus-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container-custom relative z-10">
        <div className="[&_h2]:text-white [&_p]:text-eucalyptus-200 [&_.badge]:bg-mint-400/20 [&_.badge]:text-mint-200 [&_.badge]:border-mint-400/30">
          <SectionHeading
            badge="Local Adventures"
            title="Things to do around"
            highlight="Galle"
            subtitle="From rolling estate pathways right at your doorstep to historic Dutch fort ramparts and southern surfing beaches."
          />
        </div>

        {/* Mobile Horizontal Snap Row / Desktop 2-Col Grid */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-5 pb-6 pt-2 px-1 md:grid md:grid-cols-2 md:overflow-visible md:pb-0 no-scrollbar">
          {experiences.map((exp: any, index: number) => {
            const Icon = iconMap[exp.icon] || Landmark;
            return (
              <motion.div
                key={exp.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: index * 0.08 }}
                whileHover={{ y: -5 }}
                className="snap-center flex-shrink-0 w-[84vw] md:w-auto bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-6 sm:p-7 hover:bg-white/15 hover:border-mint-400/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-mint-400/20 text-mint-300 flex items-center justify-center border border-mint-400/30 shadow-sm">
                      <Icon size={24} strokeWidth={1.75} />
                    </div>
                    {exp.badge && (
                      <span className="text-[10px] uppercase tracking-wider font-bold bg-mint-500/20 text-mint-200 border border-mint-400/30 px-3 py-1 rounded-full">
                        {exp.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-display font-bold text-white mb-2">
                    {exp.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-eucalyptus-100/90 leading-relaxed">
                    {exp.description}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10 text-xs text-eucalyptus-200">
                  <div className="flex items-center gap-1.5 font-medium">
                    <MapPin size={14} className="text-mint-300" />
                    <span>{exp.distance}</span>
                  </div>
                  {exp.season && (
                    <div className="flex items-center gap-1.5 font-medium text-mint-200">
                      <Calendar size={14} />
                      <span>{exp.season}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile Swipe Hint */}
        <div className="flex md:hidden items-center justify-center gap-1 text-xs text-mint-200/60 mt-2">
          <span>👈 Swipe to view all nearby adventures 👉</span>
        </div>
      </div>
    </section>
  );
}

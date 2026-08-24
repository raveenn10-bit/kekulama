"use client";

import React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Home, Leaf, Wifi, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { siteData } from "@/data/siteData";
import { LUXURY_EASING, LUXURY_DURATION } from "@/lib/motion";

const iconMap: Record<string, React.ElementType> = {
  Home,
  Leaf,
  Wifi,
};

export function About() {
  const { about } = siteData;
  const shouldReduceMotion = useReducedMotion();

  const featureContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const featureItemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: LUXURY_DURATION.medium,
        ease: LUXURY_EASING.quintOut,
      },
    },
  };

  return (
    <section id="about" className="section-padding bg-gradient-to-b from-sand-50 via-eucalyptus-50/50 to-white overflow-hidden relative">
      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Left Column - Image & Floating Badge */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: LUXURY_DURATION.slow, ease: LUXURY_EASING.quintOut }}
            className="lg:col-span-6 relative"
          >
            <div className="relative w-full rounded-3xl overflow-hidden aspect-[4/5] shadow-lifted border-4 border-white group">
              <Image
                src={about.image || "/images/cabana-garden.jpg"}
                alt="Kekulama Eco Cabana Garden View"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/40 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Floating Glassmorphism Badge */}
            <motion.div
              animate={shouldReduceMotion ? {} : { y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-6 -right-3 sm:right-6 bg-white/95 backdrop-blur-xl rounded-2xl p-4 sm:p-5 shadow-lifted border border-mint-200/80 max-w-[260px]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-mint-100 text-mint-700 flex items-center justify-center flex-shrink-0">
                  <Sparkles size={20} />
                </div>
                <div>
                  <span className="block text-xs font-bold text-forest">100% Eco-Friendly</span>
                  <span className="text-[11px] text-sage-600">Surrounded by tea hills</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Content */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: LUXURY_DURATION.slow, ease: LUXURY_EASING.quintOut, delay: 0.1 }}
            className="lg:col-span-6"
          >
            <SectionHeading
              badge="About Our Sanctuary"
              title={about.headline}
              highlight={about.highlight}
              align="left"
            />

            <div className="space-y-4 mb-8">
              {about.paragraphs.map((para: string, idx: number) => (
                <p key={idx} className="text-base text-sage-700 leading-relaxed font-body font-light">
                  {para}
                </p>
              ))}
            </div>

            <motion.div
              variants={featureContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="flex flex-col gap-4 mt-6"
            >
              {about.features.map((feature: any, idx: number) => {
                const IconComponent = iconMap[feature.icon] || Home;

                return (
                  <motion.div
                    key={idx}
                    variants={featureItemVariants}
                    whileHover={shouldReduceMotion ? {} : { y: -2, x: 2 }}
                    transition={{ duration: 0.3, ease: LUXURY_EASING.quintOut }}
                    className="flex items-start gap-4 p-3.5 rounded-2xl bg-white/80 border border-eucalyptus-200/70 hover:border-mint-300 hover:bg-mint-50/40 transition-all duration-300 shadow-sm"
                  >
                    <div className="w-11 h-11 rounded-xl bg-mint-100/90 text-mint-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <IconComponent size={22} strokeWidth={1.75} />
                    </div>
                    <div>
                      <h4 className="font-bold text-forest text-sm sm:text-base mb-0.5">
                        {feature.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-sage-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

export default About;

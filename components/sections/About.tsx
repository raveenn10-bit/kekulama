"use client";

import React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Home, Leaf, Wifi, Sparkles, Heart, Compass, ShieldCheck } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { siteData } from "@/data/siteData";
import { LUXURY_EASING, LUXURY_DURATION } from "@/lib/motion";

const iconMap: Record<string, React.ElementType> = {
  Home,
  Leaf,
  Wifi,
  Heart,
  Compass,
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

  const coupleHighlights = [
    {
      icon: Heart,
      title: "Romantic Couples Sanctuary",
      description: "Private loft master bedroom overlooking tea hills, intimate verandah seating & birdsong mornings.",
    },
    {
      icon: Home,
      title: "Authentic Timber A-Frame Living",
      description: "Handcrafted from local sustainable timbers with full A/C, hot water rain shower, and modern comforts.",
    },
    {
      icon: Compass,
      title: "Perfect Galle Location for Foreign Travelers",
      description: "Just 1.5h from Colombo Airport via Southern Expressway (Pinnaduwa exit) & 12 mins to UNESCO Galle Fort.",
    },
  ];

  return (
    <section id="about" className="section-padding bg-gradient-to-b from-sand-50 via-eucalyptus-50/50 to-white overflow-hidden relative">
      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Left Column - Image & Floating Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: LUXURY_DURATION.slow, ease: LUXURY_EASING.quintOut }}
            className="lg:col-span-6 relative"
          >
            <div className="relative w-full rounded-3xl overflow-hidden aspect-[4/5] shadow-[0_20px_50px_rgba(20,35,25,0.12)] border-4 border-white group">
              <Image
                src={about.image || "/images/cabana-garden.jpg"}
                alt="Kekulama Eco Cabana Romantic Nature Sanctuary in Galle"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/50 via-transparent to-transparent pointer-events-none" />
              
              {/* Couple & Honeymoon Ribbon Badge */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-stone-200 shadow-md flex items-center gap-1.5 text-xs font-semibold text-forest">
                <Heart size={14} className="text-red-500 fill-red-500" />
                <span>Couples & Honeymoon Retreat</span>
              </div>
            </div>

            {/* Floating Glassmorphism Badge */}
            <motion.div
              animate={shouldReduceMotion ? {} : { y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-6 -right-3 sm:right-6 bg-white/95 backdrop-blur-xl rounded-2xl p-4 sm:p-5 shadow-[0_15px_35px_rgba(0,0,0,0.1)] border border-stone-200 max-w-[280px]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 font-bold">
                  <Sparkles size={20} className="text-emerald-700" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-forest">100% Eco Sanctuary</span>
                  <span className="text-[11px] text-sage-600">Surrounded by tea hills & birdsong</span>
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
              badge="Romantic Nature Retreat"
              title="A secluded haven crafted for"
              highlight="couples & explorers"
              align="left"
            />

            <div className="space-y-4 mb-8">
              <p className="text-base text-sage-800 leading-relaxed font-body font-normal">
                Nestled amidst the serene hillside tea plantations of Pinnaduwa, <strong>Kekulama Eco Cabana</strong> offers an unforgettable romantic escape for couples, honeymooners, and international travelers seeking tranquility.
              </p>
              <p className="text-base text-sage-700 leading-relaxed font-body font-light">
                Wake up to melodious birdsong, breathe crisp tropical mountain air, and savor authentic Ceylon breakfast on your private verandah with zero city disturbance.
              </p>
            </div>

            <motion.div
              variants={featureContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="flex flex-col gap-3.5 mt-6"
            >
              {coupleHighlights.map((feature, idx) => {
                const IconComponent = feature.icon;

                return (
                  <motion.div
                    key={idx}
                    variants={featureItemVariants}
                    whileHover={shouldReduceMotion ? {} : { y: -2, x: 2 }}
                    transition={{ duration: 0.3, ease: LUXURY_EASING.quintOut }}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-stone-200/90 hover:border-emerald-500/40 hover:shadow-md transition-all duration-300 shadow-sm"
                  >
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <IconComponent size={22} strokeWidth={2} />
                    </div>
                    <div>
                      <h4 className="font-bold text-forest text-sm sm:text-base mb-0.5 font-body">
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

"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  MapPin,
  Navigation,
  Clock,
  Compass,
  Car,
  Plane,
  Waves,
  Landmark,
  Trees,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { LUXURY_EASING, LUXURY_DURATION } from "@/lib/motion";

interface TransitPoint {
  name: string;
  category: string;
  distance: string;
  duration: string;
  description: string;
  icon: React.ElementType;
  badge?: string;
}

const transitPoints: TransitPoint[] = [
  {
    name: "Pinnaduwa Expressway Exit (E01)",
    category: "Highway Interchange",
    distance: "1.5 km",
    duration: "2 mins",
    description: "Fastest direct connection from Colombo Airport & Western Province without city traffic.",
    icon: Car,
    badge: "Direct Access",
  },
  {
    name: "UNESCO World Heritage Galle Fort",
    category: "Historic Landmark",
    distance: "6.2 km",
    duration: "12 mins",
    description: "17th-century Dutch ramparts, ocean sunset bastions, boutique jewelry stores & colonial cafes.",
    icon: Landmark,
    badge: "Must Visit",
  },
  {
    name: "Unawatuna Golden Beach",
    category: "Coastal Beach",
    distance: "7.5 km",
    duration: "15 mins",
    description: "Calm turquoise swimming bay, beachfront dining, water sports, and sunset cocktail lounges.",
    icon: Waves,
    badge: "Beach Tour",
  },
  {
    name: "Jungle Beach & Rumassala Peace Pagoda",
    category: "Nature & Sanctuary",
    distance: "8.5 km",
    duration: "18 mins",
    description: "Secluded forest cove with snorkeling reefs and 360° ocean vista from the Japanese Peace Pagoda.",
    icon: Trees,
    badge: "Secret Spot",
  },
  {
    name: "Bandaranaike Int'l Airport (CMB / BIA)",
    category: "International Airport",
    distance: "148 km",
    duration: "1h 30m",
    description: "Direct expressway express transit via Southern Expressway (E01). Private airport taxis available.",
    icon: Plane,
    badge: "Airport Link",
  },
];

export default function LocationGuide() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="location" className="section-padding bg-sand-50/90 relative overflow-hidden text-sage-900 border-t border-sage-200/60">
      {/* Subtle ambient botanical background gradients */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-mint-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-eucalyptus-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="container-custom relative z-10">
        <SectionHeading
          badge="Geographic Location & Proximity · Galle, Sri Lanka"
          title="Secluded in nature, effortlessly connected to"
          highlight="Galle"
          subtitle="Tucked away in the tranquil tea hills of Pinnaduwa while being just minutes from the Southern Expressway and Galle's premier coastal attractions."
        />

        {/* Geographic Key Coordinates & Anchor Card */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: LUXURY_DURATION.medium, ease: LUXURY_EASING.quintOut }}
          className="max-w-4xl mx-auto mb-10 bg-white/95 rounded-3xl border border-sage-200 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-forest text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <MapPin size={24} />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 mb-1">
                <span className="font-mono text-xs uppercase tracking-wider text-forest font-semibold">
                  Official GPS Coordinates:
                </span>
                <span className="font-mono text-xs bg-sage-100 text-forest-dark px-2 py-0.5 rounded-md font-medium">
                  6.0779352° N, 80.2623579° E
                </span>
              </div>
              <h3 className="font-display text-xl sm:text-2xl text-forest-dark font-medium">
                416/1, Pinnaduwa, Galle 80000, Sri Lanka
              </h3>
              <p className="font-body text-xs sm:text-sm text-sage-600 font-light mt-0.5">
                Pinnaduwa Interchange (Exit 2) · Southern Province · Tea Plantation Belt
              </p>
            </div>
          </div>

          <a
            href="https://maps.app.goo.gl/SjnALMB1tAHYKzkM6"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-forest text-white hover:bg-forest-dark transition-all duration-300 font-body text-xs sm:text-sm font-medium shadow-sm hover:shadow-md flex-shrink-0"
          >
            <Navigation size={15} />
            Open in Google Maps
            <ExternalLink size={13} className="opacity-70" />
          </a>
        </motion.div>

        {/* Structured Distance & Transit Matrix (AEO & GEO citation friendly) */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {transitPoints.map((point, index) => {
            const Icon = point.icon;
            return (
              <motion.div
                key={point.name}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: LUXURY_DURATION.medium,
                  delay: index * 0.06,
                  ease: LUXURY_EASING.quintOut,
                }}
                className={`bg-white/80 hover:bg-white border border-sage-200/90 rounded-2xl p-5 sm:p-6 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between ${
                  index === 4 ? "md:col-span-2 bg-gradient-to-r from-white via-white to-mint-50/50" : ""
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-eucalyptus-100 text-forest flex items-center justify-center">
                      <Icon size={20} strokeWidth={1.75} />
                    </div>
                    {point.badge && (
                      <span className="font-eyebrow text-[9.5px] uppercase tracking-[0.2em] font-medium bg-forest/10 text-forest px-3 py-1 rounded-full border border-forest/15">
                        {point.badge}
                      </span>
                    )}
                  </div>

                  <h4 className="font-display text-lg sm:text-xl text-forest-dark font-medium leading-snug">
                    {point.name}
                  </h4>
                  <p className="font-body text-xs sm:text-sm text-sage-700 font-light mt-1.5 leading-relaxed">
                    {point.description}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-5 pt-3.5 border-t border-sage-100 font-mono text-xs">
                  <span className="inline-flex items-center gap-1.5 text-sage-600">
                    <Compass size={13} className="text-forest" />
                    {point.distance}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-forest font-semibold">
                    <Clock size={13} />
                    {point.duration}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

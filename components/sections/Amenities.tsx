"use client";

import { motion } from "framer-motion";
import { Bath, Shirt, Coffee, Tv, Speaker, Refrigerator, Droplets, CookingPot, Wind, TreePine } from "lucide-react";
import { siteData } from "@/data/siteData";
import { SectionHeading } from "@/components/ui/SectionHeading";

const iconMap: Record<string, any> = { Bath, Shirt, Coffee, Tv, Speaker, Refrigerator, Droplets, CookingPot, Wind, TreePine };

export default function Amenities() {
  const { amenities } = siteData;

  return (
    <section id="amenities" className="bg-sage-50 section-padding">
      <div className="container-custom">
        <SectionHeading
          badge="Your Cabana Includes"
          title="Everything you"
          highlight="need"
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-12">
          {amenities.map((amenity: any, index: number) => {
            const Icon = iconMap[amenity.icon] || TreePine;
            return (
              <motion.div
                key={amenity.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl p-5 text-center shadow-soft hover:shadow-lifted transition-all hover:border-bark/20 border border-transparent flex flex-col items-center justify-center"
              >
                <div className="h-12 w-12 mb-3 flex items-center justify-center">
                  <Icon size={32} className="text-bark" strokeWidth={1.5} />
                </div>
                <span className="text-sm font-medium text-sage-700">{amenity.label}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

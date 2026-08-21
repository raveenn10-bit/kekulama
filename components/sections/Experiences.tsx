"use client";

import { motion } from "framer-motion";
import { Landmark, Mountain, Waves, Turtle, MapPin, Calendar } from "lucide-react";
import { siteData } from "@/data/siteData";
import { SectionHeading } from "@/components/ui/SectionHeading";

const iconMap: Record<string, any> = { Landmark, Mountain, Waves, Turtle };

export default function Experiences() {
  const { experiences } = siteData;

  return (
    <section id="experiences" className="bg-forest section-padding">
      <div className="container-custom">
        <div className="text-white [&_h2]:text-white [&_p]:text-sage-300 [&_.badge]:bg-white/10 [&_.badge]:text-white">
          <SectionHeading
            badge="Explore Nearby"
            title="Adventures around"
            highlight="Galle"
            className="text-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-12">
          {experiences.map((exp: any, index: number) => {
            const Icon = iconMap[exp.icon] || Landmark;
            return (
              <motion.div
                key={exp.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-bark/20 text-bark flex items-center justify-center mb-4">
                  <Icon size={20} strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-display text-white">{exp.title}</h3>
                <p className="text-sm text-sage-300 leading-relaxed mt-2">{exp.description}</p>
                
                <div className="flex justify-between mt-4">
                  <div className="flex items-center gap-1.5 text-xs text-sage-400">
                    <MapPin size={14} />
                    <span>{exp.distance}</span>
                  </div>
                  {exp.season && (
                    <div className="flex items-center gap-1.5 text-xs text-sage-400">
                      <Calendar size={14} />
                      <span>{exp.season}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

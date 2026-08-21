"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Home, Leaf, Wifi } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { siteData } from "@/data/siteData";

const iconMap: Record<string, React.ElementType> = { 
  Home, 
  Leaf, 
  Wifi 
};

export function About() {
  const aboutData = siteData?.about || {
    paragraphs: [
      "Nestled amidst a verdant landscape, Kekulama Eco Cabana is designed for those seeking a tranquil retreat away from the bustle. Our spaces blend rustic elegance with modern comforts, ensuring an authentic yet relaxing stay.",
      "Experience the beauty of southern Sri Lanka with our thoughtfully curated amenities. Whether you're relaxing in the garden or exploring nearby historical sites, we provide the perfect sanctuary."
    ],
    features: [
      { icon: "Leaf", title: "Eco-Friendly Design", description: "Built with sustainable materials harmonizing with nature." },
      { icon: "Home", title: "Private Sanctuary", description: "Exclusive access to the cabana and surrounding gardens." },
      { icon: "Wifi", title: "Modern Comforts", description: "High-speed internet and modern amenities for a seamless stay." }
    ]
  };

  return (
    <section id="about" className="section-padding bg-sage-50 overflow-hidden">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left Column - Image */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full rounded-2xl overflow-hidden aspect-[4/5] shadow-lifted"
          >
            <Image
              src="/images/cabana-garden.jpg"
              alt="Kekulama Eco Cabana Garden View"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </motion.div>

          {/* Right Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <SectionHeading
              badge="Welcome"
              title="Built from the land it"
              highlight="sits in"
              align="left"
            />
            
            <div className="space-y-4 mb-8">
              {aboutData.paragraphs.map((para: string, idx: number) => (
                <p key={idx} className="text-base text-sage-600 leading-relaxed">
                  {para}
                </p>
              ))}
            </div>

            <div className="flex flex-col gap-5 mt-8">
              {aboutData.features.map((feature: any, idx: number) => {
                const IconComponent = iconMap[feature.icon] || Home;
                
                return (
                  <div key={idx} className="flex flex-row items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-bark/10 text-bark flex items-center justify-center flex-shrink-0">
                      <IconComponent size={24} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sage-900 mb-1">{feature.title}</h4>
                      <p className="text-sm text-sage-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

export default About;

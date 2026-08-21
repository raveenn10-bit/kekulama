"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { siteData } from "@/data/siteData";
import { SectionHeading } from "@/components/ui/SectionHeading";

export default function Gallery() {
  const { gallery } = siteData;

  const getSpanClass = (span?: string) => {
    switch (span) {
      case "wide":
        return "col-span-2";
      case "tall":
        return "row-span-2";
      case "large":
        return "col-span-2 row-span-2";
      default:
        return "";
    }
  };

  return (
    <section id="gallery" className="bg-white section-padding">
      <div className="container-custom">
        <SectionHeading
          badge="Gallery"
          title="Scenes from"
          highlight="Kekulama"
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-[200px] md:auto-rows-[250px] mt-12">
          {gallery.map((image: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 }}
              className={`rounded-xl overflow-hidden relative group cursor-pointer ${getSpanClass(image.span)}`}
            >
              <Image
                src={image.src}
                alt={image.alt || "Gallery image"}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-forest-dark/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

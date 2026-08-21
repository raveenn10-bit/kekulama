"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { siteData } from "@/data/siteData";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Maximize2, X } from "lucide-react";

export default function Gallery() {
  const { gallery } = siteData;
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const filters = ["All", "Exterior", "Interior", "Garden", "Nature"];

  const filteredGallery =
    selectedFilter === "All"
      ? gallery
      : gallery.filter((img) => img.category === selectedFilter);

  const getSpanClass = (span?: string) => {
    switch (span) {
      case "wide":
        return "md:col-span-2";
      case "tall":
        return "md:row-span-2";
      case "large":
        return "md:col-span-2 md:row-span-2";
      default:
        return "";
    }
  };

  return (
    <section id="gallery" className="bg-eucalyptus-50/60 section-padding relative overflow-hidden">
      <div className="container-custom">
        <SectionHeading
          badge="Property Gallery"
          title="Scenes from"
          highlight="Kekulama"
          subtitle="Explore the A-frame timber architecture, lush hillside gardens, and cozy loft interiors."
        />

        {/* Filter Pills */}
        <div className="flex items-center justify-center gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
                selectedFilter === filter
                  ? "bg-mint-500 text-white shadow-glow"
                  : "bg-white text-sage-700 hover:bg-mint-100/70 border border-sage-200"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Mobile Horizontal Snap Row / Desktop Masonry Grid */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-3.5 pb-5 pt-2 px-1 md:grid md:grid-cols-3 lg:grid-cols-4 md:auto-rows-[220px] lg:auto-rows-[240px] md:overflow-visible md:pb-0 no-scrollbar">
          {filteredGallery.map((image, index) => (
            <motion.div
              key={image.src + index}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: index * 0.04 }}
              onClick={() => setLightboxImage(image.src)}
              className={`snap-center flex-shrink-0 w-[78vw] h-[280px] md:w-auto md:h-auto rounded-2xl overflow-hidden relative group cursor-pointer border border-mint-100 shadow-soft hover:shadow-lifted transition-all ${getSpanClass(
                image.span
              )}`}
            >
              <Image
                src={image.src}
                alt={image.alt || "Kekulama Eco Cabana Photo"}
                fill
                sizes="(max-width: 768px) 80vw, 33vw"
                className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4 text-white">
                <span className="text-xs font-semibold">{image.alt}</span>
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Maximize2 size={14} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile Swipe Hint */}
        <div className="flex md:hidden items-center justify-center gap-1 text-xs text-sage-400 mt-2">
          <span>👈 Swipe to view photo gallery 👉</span>
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-forest-dark/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8"
            onClick={() => setLightboxImage(null)}
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
              aria-label="Close photo preview"
            >
              <X size={24} />
            </button>
            <div className="relative w-full max-w-5xl h-[80vh] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src={lightboxImage}
                alt="Enlarged photo"
                fill
                className="object-contain"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

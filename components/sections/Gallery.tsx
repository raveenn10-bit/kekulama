"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { siteData } from "@/data/siteData";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Maximize2, X } from "lucide-react";
import { LUXURY_EASING, LUXURY_DURATION } from "@/lib/motion";
import { useAutoScroll } from "@/hooks/useAutoScroll";

export default function Gallery() {
  const { gallery } = siteData;
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const scrollRef = useAutoScroll({ interval: 3000 });

  // Handle escape key and scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxImage(null);
    };

    if (lightboxImage) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxImage]);

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

        {/* Filter Pills with Liquid Slider */}
        <div className="flex items-center justify-center gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
          {filters.map((filter) => {
            const isActive = selectedFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`relative px-4 py-1.5 rounded-full font-body text-xs font-semibold uppercase tracking-[0.14em] transition-colors duration-300 cursor-pointer z-10 ${
                  isActive ? "text-white" : "text-sage-700 hover:text-forest"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeGalleryTab"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 35,
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-mint-500 to-mint-600 rounded-full shadow-glow -z-10"
                  />
                )}
                {!isActive && (
                  <div className="absolute inset-0 bg-white border border-sage-200/80 rounded-full -z-20" />
                )}
                {filter}
              </button>
            );
          })}
        </div>

        {/* Mobile Horizontal Snap Row / Desktop Masonry Grid */}
        <motion.div
          ref={scrollRef}
          layout
          className="flex overflow-x-auto snap-x snap-mandatory gap-3.5 pb-5 pt-2 px-1 md:grid md:grid-cols-3 lg:grid-cols-4 md:auto-rows-[220px] lg:auto-rows-[240px] md:overflow-visible md:pb-0 no-scrollbar"
        >
          <AnimatePresence mode="popLayout">
            {filteredGallery.map((image, index) => (
              <motion.div
                key={image.src}
                layout
                initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{
                  duration: LUXURY_DURATION.medium,
                  ease: LUXURY_EASING.quintOut,
                  delay: index * 0.03,
                }}
                onClick={() => setLightboxImage(image.src)}
                className={`snap-center flex-shrink-0 w-[78vw] h-[280px] md:w-auto md:h-auto rounded-3xl overflow-hidden relative group cursor-pointer border border-mint-100 shadow-soft hover:shadow-lifted transition-all ${getSpanClass(
                  image.span
                )}`}
              >
                <Image
                  src={image.src}
                  alt={image.alt || "Kekulama Eco Cabana Photo"}
                  fill
                  sizes="(max-width: 768px) 80vw, 33vw"
                  className="object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-5 text-white">
                  <span className="font-eyebrow text-xs uppercase tracking-wider font-normal drop-shadow-sm">{image.alt}</span>
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <Maximize2 size={14} />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Mobile Swipe Hint */}
        <div className="flex md:hidden items-center justify-center gap-1.5 font-eyebrow text-[11px] uppercase tracking-[0.2em] text-sage-400 mt-3">
          <span>👈 Swipe to view photo gallery 👉</span>
        </div>
      </div>

      {/* Lightbox Modal with Keyboard Escape & Scroll Lock */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: LUXURY_EASING.quintOut }}
            className="fixed inset-0 z-[100] bg-forest-dark/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-8"
            onClick={() => setLightboxImage(null)}
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10 cursor-pointer"
              aria-label="Close photo preview (Escape)"
            >
              <X size={24} />
            </button>
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.4, ease: LUXURY_EASING.quintOut }}
              className="relative w-full max-w-5xl h-[80vh] rounded-3xl overflow-hidden shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={lightboxImage}
                alt="Enlarged photo"
                fill
                className="object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

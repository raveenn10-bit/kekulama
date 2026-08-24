"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { siteData } from "@/data/siteData";
import { LUXURY_EASING } from "@/lib/motion";

export function FloatingWhatsApp() {
  const [showTooltip, setShowTooltip] = useState(true);
  const whatsappNumber = siteData.contact.whatsappRaw || "94756657000";
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom,0))] right-4 sm:right-6 z-50 flex items-center gap-3">
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: 12, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.95 }}
            transition={{ duration: 0.4, ease: LUXURY_EASING.quintOut }}
            className="hidden sm:flex items-center gap-2.5 bg-white/95 backdrop-blur-xl text-sage-900 px-4 py-2 rounded-full shadow-lifted border border-mint-200/80 text-xs font-medium"
          >
            <span className="relative flex h-2 w-2">
              {!shouldReduceMotion && (
                <motion.span
                  animate={{ scale: [1, 1.9, 1], opacity: [0.75, 0, 0.75] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
                />
              )}
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-body text-xs font-semibold text-forest">Chat on WhatsApp</span>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowTooltip(false);
              }}
              className="text-sage-400 hover:text-sage-700 ml-1 p-0.5 rounded-full hover:bg-sage-100 transition-colors"
              aria-label="Close tooltip"
            >
              <X size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.a
        href={`https://wa.me/${whatsappNumber}?text=Hello%20Kekulama%20Eco%20Cabana,%20I%20would%20like%20to%20inquire%20about%20a%20booking.`}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.3, ease: LUXURY_EASING.quintOut }}
        className="relative group w-13 h-13 sm:w-14 sm:h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lifted hover:shadow-glow transition-all duration-300"
        aria-label="Contact us on WhatsApp"
      >
        {/* Soft Organic Aura Glow */}
        {!shouldReduceMotion && (
          <motion.span
            animate={{ scale: [1, 1.25, 1], opacity: [0.35, 0, 0.35] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-[#25D366]"
          />
        )}

        {/* SVG WhatsApp icon */}
        <svg
          className="w-6 h-6 sm:w-7 sm:h-7 fill-current relative z-10"
          viewBox="0 0 24 24"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
      </motion.a>
    </div>
  );
}

export default FloatingWhatsApp;

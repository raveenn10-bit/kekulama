"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { siteData } from "@/data/siteData";
import { LUXURY_EASING, LUXURY_DURATION } from "@/lib/motion";

export default function CTA() {
  const { contact } = siteData;
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative w-full overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/cabana-trees.jpg"
          alt="Lush nature canopy at Kekulama Eco Cabana"
          fill
          className="object-cover scale-105"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-forest-dark/85 backdrop-blur-[2px]"></div>
      </div>

      <div className="relative z-10 py-24 sm:py-28 px-5 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: LUXURY_DURATION.slow, ease: LUXURY_EASING.editorial }}
          className="text-center max-w-3xl mx-auto"
        >
          <span className="font-eyebrow text-xs uppercase tracking-[0.28em] text-mint-300 mb-4 block font-normal">
            Escape the Ordinary
          </span>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-white font-normal leading-[1.08] tracking-lux-tight">
            Ready to reconnect with <span className="italic font-normal bg-gradient-to-r from-mint-200 to-eucalyptus-200 bg-clip-text text-transparent underline decoration-mint-400/40 decoration-wavy decoration-1 underline-offset-8">nature</span>?
          </h2>
          <p className="font-body font-light text-base sm:text-lg text-eucalyptus-100/90 mt-5 max-w-lg mx-auto leading-lux-relaxed">
            Reserve your private eco-cabana directly via WhatsApp for guaranteed best rates, instant confirmation, and personalized hospitality.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-10">
            <motion.a
              href={`https://wa.me/${contact.whatsappRaw}?text=Hello%20Kekulama%20Eco%20Cabana,%20I%20would%20like%20to%20reserve%20a%20stay.`}
              target="_blank"
              rel="noreferrer"
              whileHover={shouldReduceMotion ? {} : { y: -1, scale: 1.012 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-r from-mint-500 to-mint-600 text-white rounded-full px-8 py-3.5 hover:from-mint-600 hover:to-mint-700 transition-all font-body font-semibold text-xs uppercase tracking-[0.15em] shadow-glow w-full sm:w-auto text-center"
            >
              Book via WhatsApp
            </motion.a>
            <motion.a
              href={`tel:${contact.phoneRaw}`}
              whileHover={shouldReduceMotion ? {} : { y: -1, scale: 1.012 }}
              whileTap={{ scale: 0.98 }}
              className="border border-white/30 text-white hover:bg-white/10 rounded-full px-8 py-3.5 transition-colors font-body font-semibold text-xs uppercase tracking-[0.15em] w-full sm:w-auto text-center backdrop-blur-sm"
            >
              Call Directly
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

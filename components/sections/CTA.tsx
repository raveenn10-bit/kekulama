"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { siteData } from "@/data/siteData";
import { LUXURY_EASING, LUXURY_DURATION } from "@/lib/motion";
import { Sparkles, MessageCircle, Phone } from "lucide-react";

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

      {/* Atmospheric Soft Light Pulse */}
      <motion.div
        animate={shouldReduceMotion ? {} : { opacity: [0.15, 0.35, 0.15], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-mint-400/20 rounded-full blur-3xl pointer-events-none"
      />

      <div className="relative z-10 py-18 sm:py-24 md:py-28 px-5 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: LUXURY_DURATION.slow, ease: LUXURY_EASING.editorial }}
          className="text-center max-w-3xl mx-auto"
        >
          <span className="font-eyebrow text-xs uppercase tracking-[0.28em] text-mint-300 mb-3.5 inline-flex items-center gap-2 font-normal">
            <Sparkles size={13} className="text-mint-300 animate-pulse" />
            <span>Escape the Ordinary</span>
            <Sparkles size={13} className="text-mint-300 animate-pulse" />
          </span>

          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl 2xl:text-7xl text-white font-normal leading-[1.08] tracking-lux-tight">
            Ready to reconnect with{" "}
            <span className="italic font-normal bg-gradient-to-r from-mint-200 to-eucalyptus-200 bg-clip-text text-transparent underline decoration-mint-400/40 decoration-wavy decoration-1 underline-offset-8">
              nature
            </span>
            ?
          </h2>
          <p className="font-body font-light text-sm sm:text-base md:text-lg 2xl:text-xl text-eucalyptus-100/90 mt-4 max-w-lg 2xl:max-w-xl mx-auto leading-lux-relaxed">
            Reserve your private eco-cabana directly via WhatsApp for guaranteed best rates, instant confirmation, and personalized hospitality.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 mt-8 sm:mt-10">
            <Link
              href="/book"
              className="relative overflow-hidden bg-gradient-to-r from-mint-500 to-mint-600 text-white rounded-full px-8 py-3.5 sm:py-4 hover:from-mint-600 hover:to-mint-700 transition-all font-body font-semibold text-xs 2xl:text-sm uppercase tracking-[0.15em] shadow-glow w-full sm:w-auto text-center flex items-center justify-center gap-2 group cursor-pointer active:scale-98"
            >
              <Sparkles size={15} />
              <span>Book Online (Direct)</span>
            </Link>

            {/* Shimmering Magnetic WhatsApp CTA */}
            <motion.a
              href={`https://wa.me/${contact.whatsappRaw}?text=Hello%20Kekulama%20Eco%20Cabana,%20I%20would%20like%20to%20reserve%20a%20stay.`}
              target="_blank"
              rel="noreferrer"
              whileHover={shouldReduceMotion ? {} : { y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="border border-white/30 text-white hover:bg-white/10 hover:border-white/50 rounded-full px-8 py-3.5 sm:py-4 transition-all font-body font-semibold text-xs 2xl:text-sm uppercase tracking-[0.15em] w-full sm:w-auto text-center backdrop-blur-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle size={15} />
              <span>Book via WhatsApp</span>
            </motion.a>

            <motion.a
              href={`tel:${contact.phoneRaw}`}
              whileHover={shouldReduceMotion ? {} : { y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="text-white/80 hover:text-white rounded-full px-6 py-3.5 sm:py-4 transition-all font-body font-medium text-xs 2xl:text-sm tracking-[0.1em] w-full sm:w-auto text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              <Phone size={14} />
              <span>Call Directly</span>
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

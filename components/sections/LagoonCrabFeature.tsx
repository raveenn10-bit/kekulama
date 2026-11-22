"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, MessageCircle, Sparkles } from "lucide-react";
import { LUXURY_EASING } from "@/lib/motion";

const enquiryText = encodeURIComponent(
  "Hello Kekulama Eco Cabana, I would like to enquire about your Sri Lankan Lagoon Crab experience. Please share availability, serving details and today's price."
);

export default function LagoonCrabFeature() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="lagoon-crab" aria-labelledby="lagoon-crab-heading" className="relative overflow-hidden bg-[#10271f] py-16 text-white sm:py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_12%_16%,rgba(208,165,91,.24),transparent_28%),radial-gradient(circle_at_88%_88%,rgba(158,71,40,.2),transparent_30%)]" />
      <div className="container-custom relative z-10 grid items-center gap-12 lg:grid-cols-[1.08fr_.92fr] lg:gap-20">
        <motion.div initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.9, ease: LUXURY_EASING.editorial }} className="relative min-h-[440px] sm:min-h-[580px]">
          <div className="absolute inset-x-0 top-0 h-[88%] overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl sm:rounded-[2.5rem]">
            <Image src="/images/lagoon-crab/lagoon-crab-hero.webp" alt="Illustrative presentation of Sri Lankan lagoon crab curry in a clay pot" fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover transition-transform duration-[1800ms] hover:scale-[1.035]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#10271f]/70 via-transparent to-transparent" />
          </div>
          <motion.div animate={shouldReduceMotion ? undefined : { y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-0 right-1 w-[44%] overflow-hidden rounded-[1.5rem] border-4 border-[#10271f] bg-[#10271f] shadow-2xl sm:right-5 sm:rounded-[2rem]">
            <div className="relative aspect-[4/5]">
              <Image src="/images/lagoon-crab/lagoon-crab-serving-detail.webp" alt="Illustrative close-up of lagoon crab curry being served" fill sizes="(max-width: 1024px) 42vw, 22vw" className="object-cover" />
            </div>
          </motion.div>
          <div className="absolute bottom-5 left-5 rounded-full border border-white/20 bg-black/35 px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-white/85 backdrop-blur-md">Illustrative culinary presentation</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.8, ease: LUXURY_EASING.quintOut }} className="max-w-xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d0a55b]/35 bg-[#d0a55b]/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f2d59f]">
            <Sparkles size={14} aria-hidden="true" /> Southern Sri Lankan dining
          </div>
          <h2 id="lagoon-crab-heading" className="font-display text-4xl font-normal leading-[1.05] text-white sm:text-5xl lg:text-6xl">
            Sri Lankan Lagoon Crab,<span className="mt-2 block text-[#e7bd72]">served with soul.</span>
          </h2>
          <p className="mt-7 text-lg font-light leading-8 text-[#e8eee9]">Enquire about a thoughtfully arranged Sri Lankan lagoon crab meal during your Kekulama stay—rich local flavours, an intimate table and a quiet tropical setting near Galle.</p>
          <p className="mt-4 text-sm leading-7 text-white/60">Availability, preparation, serving details and today&apos;s price are confirmed directly with the host.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/lagoon-crab-galle" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#e7bd72] px-6 py-3 text-sm font-semibold text-[#10271f] transition hover:bg-[#f0d49e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e7bd72]">
              Discover the experience <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
            <a href={`https://wa.me/94756657000?text=${enquiryText}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              <MessageCircle size={17} aria-hidden="true" /> Ask today&apos;s price
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

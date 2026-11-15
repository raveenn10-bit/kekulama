"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Heart,
  Leaf,
  MessageCircle,
  MoonStar,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { LUXURY_DURATION, LUXURY_EASING } from "@/lib/motion";

const moments = [
  {
    icon: MoonStar,
    label: "Private A-frame hideaway",
    copy: "A quiet two-level cabana reserved entirely for your stay.",
  },
  {
    icon: UtensilsCrossed,
    label: "Dining your way",
    copy: "Choose breakfast, half board, or full board when you reserve.",
  },
  {
    icon: Leaf,
    label: "Tea-estate slow mornings",
    copy: "Wake to birdsong, garden air, and an unhurried green horizon.",
  },
];

export default function RomanticEscape() {
  const shouldReduceMotion = useReducedMotion();

  const reveal = {
    initial: { opacity: 0, y: shouldReduceMotion ? 0 : 22 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.25 },
    transition: {
      duration: LUXURY_DURATION.slow,
      ease: LUXURY_EASING.editorial,
    },
  };

  return (
    <section
      id="romance"
      aria-labelledby="romance-title"
      className="relative overflow-hidden bg-[#13261d] text-white section-padding"
    >
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-mint-500/20 blur-[110px]" />
        <div className="absolute -right-28 bottom-0 h-80 w-80 rounded-full bg-amber-300/15 blur-[120px]" />
      </div>

      <div className="container-custom relative z-10">
        <motion.div
          {...reveal}
          className="mb-8 flex flex-col gap-5 sm:mb-12 md:flex-row md:items-end md:justify-between"
        >
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3.5 py-2 font-eyebrow text-[10px] font-bold uppercase tracking-[0.24em] text-amber-100 backdrop-blur-xl sm:text-[11px]">
              <Heart size={13} className="fill-amber-100/70" />
              Romantic escapes, thoughtfully arranged
            </div>
            <h2
              id="romance-title"
              className="max-w-2xl font-display text-4xl font-light leading-[1.02] tracking-[-0.03em] text-white sm:text-5xl lg:text-6xl"
            >
              Just the two of you,
              <span className="block font-serif italic text-amber-100">
                held by nature.
              </span>
            </h2>
          </div>
          <p className="max-w-md font-body text-sm font-light leading-7 text-white/68 sm:text-base">
            Build a honeymoon, anniversary, or quiet couple&apos;s escape around
            the stay you want. We&apos;ll help you shape the little details before
            arrival.
          </p>
        </motion.div>

        <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr] lg:gap-6">
          <motion.figure
            {...reveal}
            className="group relative min-h-[430px] overflow-hidden rounded-[2rem] border border-white/10 bg-black/20 shadow-[0_28px_90px_rgba(0,0,0,0.28)] sm:min-h-[560px]"
          >
            <Image
              src="/images/romantic-golden-hour.webp"
              alt="Kekulama Eco Cabana at golden hour with a private tea setting in the garden"
              fill
              sizes="(max-width: 1024px) 100vw, 68vw"
              className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.025]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e1c16]/90 via-transparent to-black/10" />
            <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 sm:p-8">
              <div>
                <span className="font-eyebrow text-[10px] font-bold uppercase tracking-[0.24em] text-amber-100/90">
                  Golden-hour ritual
                </span>
                <p className="mt-1 max-w-md font-display text-2xl leading-tight text-white sm:text-3xl">
                  Tea, stillness, and a garden that feels entirely yours.
                </p>
              </div>
              <Sparkles className="hidden text-amber-100/80 sm:block" size={28} />
            </figcaption>
          </motion.figure>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            <motion.figure
              {...reveal}
              transition={{
                duration: LUXURY_DURATION.slow,
                ease: LUXURY_EASING.editorial,
                delay: 0.08,
              }}
              className="relative min-h-[360px] overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] sm:min-h-[430px] lg:min-h-0"
            >
              <Image
                src="/images/romantic-welcome-interior.webp"
                alt="Warm romantic welcome styling inside the authentic Kekulama A-frame cabana"
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 32vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c1712]/75 via-transparent to-transparent" />
              <figcaption className="absolute bottom-0 left-0 p-6">
                <span className="font-eyebrow text-[10px] font-bold uppercase tracking-[0.22em] text-amber-100">
                  A warmer welcome
                </span>
                <p className="mt-1 font-display text-2xl text-white">
                  Simple details, made personal.
                </p>
              </figcaption>
            </motion.figure>

            <motion.div
              {...reveal}
              transition={{
                duration: LUXURY_DURATION.slow,
                ease: LUXURY_EASING.editorial,
                delay: 0.14,
              }}
              className="flex flex-col justify-between rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl sm:p-7"
            >
              <div className="space-y-5">
                {moments.map(({ icon: Icon, label, copy }) => (
                  <div key={label} className="flex gap-3.5">
                    <div className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-full bg-amber-100 text-forest">
                      <Icon size={16} />
                    </div>
                    <div>
                      <h3 className="font-body text-sm font-semibold text-white">
                        {label}
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-white/58">
                        {copy}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-7 grid gap-2.5">
                <Link
                  href="/book"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-amber-100 px-5 font-body text-xs font-bold uppercase tracking-[0.15em] text-forest transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-100"
                >
                  Plan your escape
                  <ArrowUpRight size={15} />
                </Link>
                <a
                  href="https://wa.me/94756657000?text=Hello%20Kekulama%20Eco%20Cabana%2C%20I%27d%20like%20to%20plan%20a%20romantic%20stay.%20Please%20share%20the%20available%20arrangements."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-5 font-body text-xs font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <MessageCircle size={15} />
                  Personalize on WhatsApp
                </a>
              </div>

              <p className="mt-4 text-center font-body text-[10px] leading-4 text-white/42">
                Welcome styling and meal arrangements are available on request
                and confirmed with your reservation.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

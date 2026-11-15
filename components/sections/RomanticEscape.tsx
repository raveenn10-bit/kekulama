"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Armchair,
  ArrowUpRight,
  BadgeCheck,
  Check,
  Clock3,
  Coffee,
  Heart,
  Leaf,
  MessageCircle,
  Moon,
  MoonStar,
  Sparkles,
  Sun,
  UtensilsCrossed,
  Wifi,
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

const romanticPackages = [
  {
    eyebrow: "Private couple day experience",
    name: "Couple Day Escape",
    price: "8,000",
    unit: "day · A/C",
    timing: "Flexible daytime stay",
    image: "/images/couple-day-escape.webp",
    imageAlt:
      "Couple Day Escape tea setting in the garden at Kekulama Eco Cabana",
    bookingName: "Couple Day Escape — A/C",
    features: [
      "Private air-conditioned cabana for two",
      "M3 Tantra Chair — complimentary",
      "Unlimited tea & coffee",
      "Starlink Wi-Fi, 45-inch Smart TV & JBL audio",
      "Kitchenette, refrigerator & hot-water shower",
      "Private tea-garden relaxation",
    ],
  },
  {
    eyebrow: "Romantic overnight experience",
    name: "Honeymoon Night Escape",
    price: "9,000",
    unit: "night · A/C",
    timing: "2:00 PM – 10:00 AM",
    image: "/images/honeymoon-night-escape.webp",
    imageAlt:
      "Warmly prepared A-frame loft bedroom for the Honeymoon Night Escape at Kekulama",
    bookingName: "Honeymoon Night Escape — A/C",
    features: [
      "Private A/C cabana and loft bedroom for two",
      "M3 Tantra Chair — complimentary",
      "Unlimited tea & coffee",
      "Starlink Wi-Fi, 45-inch Smart TV & JBL audio",
      "Kitchenette, refrigerator & hot-water shower",
      "Quiet tea-estate morning experience",
    ],
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
              className="max-w-2xl font-display text-4xl font-medium leading-[1.02] tracking-[-0.025em] text-white sm:text-5xl lg:text-6xl"
            >
              Just the two of you,
              <span className="block font-serif italic text-amber-100">
                held by nature.
              </span>
            </h2>
          </div>
          <p className="max-w-md font-body text-sm font-normal leading-7 text-white/72 sm:text-base">
            Build a honeymoon, anniversary, or quiet couple&apos;s escape around
            the stay you want. We&apos;ll help you shape the little details before
            arrival.
          </p>
        </motion.div>

        <div className="mb-5 grid gap-5 lg:mb-6 lg:grid-cols-2 lg:gap-6">
          {romanticPackages.map((pkg, index) => (
            <motion.article
              key={pkg.name}
              initial={{
                opacity: 0,
                y: shouldReduceMotion ? 0 : 24,
              }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.18 }}
              transition={{
                duration: LUXURY_DURATION.slow,
                delay: index * 0.09,
                ease: LUXURY_EASING.editorial,
              }}
              className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] shadow-[0_24px_70px_rgba(0,0,0,0.2)]"
            >
              <figure className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={pkg.image}
                  alt={pkg.imageAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-[1.035]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1711]/90 via-black/5 to-transparent" />
                <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-[#173123]/90 px-3.5 py-2 font-eyebrow text-[10px] font-semibold uppercase text-amber-100 shadow-lg backdrop-blur-xl sm:left-6 sm:top-6">
                  <BadgeCheck size={14} />
                  M3 Chair Free
                </div>
                <figcaption className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                  <span className="font-eyebrow text-[10px] font-semibold uppercase text-amber-100/90">
                    {pkg.eyebrow}
                  </span>
                  <h3 className="mt-1 font-display text-3xl font-semibold leading-none tracking-lux-snug text-white sm:text-4xl">
                    {pkg.name}
                  </h3>
                </figcaption>
              </figure>

              <div className="p-5 sm:p-7">
                <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-5">
                  <div>
                    <span className="font-eyebrow text-[10px] font-semibold uppercase text-white/45">
                      Package rate
                    </span>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="font-mono text-sm font-semibold uppercase tracking-lux-wide text-amber-100/75">
                        LKR
                      </span>
                      <span className="font-mono text-4xl font-semibold tabular-nums tracking-[-0.04em] text-white sm:text-5xl">
                        {pkg.price}
                      </span>
                      <span className="font-body text-xs font-medium text-white/50">
                        / {pkg.unit}
                      </span>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 font-body text-[11px] font-medium text-white/65">
                    <Clock3 size={14} className="text-amber-100" />
                    {pkg.timing}
                  </div>
                </div>

                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {pkg.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 font-body text-xs font-medium leading-5 text-white/72"
                    >
                      <span className="mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-full bg-amber-100 text-forest">
                        <Check size={10} strokeWidth={3} />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                  <Link
                    href={`/book?package=${encodeURIComponent(pkg.bookingName)}`}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-amber-100 px-5 font-body text-xs font-semibold uppercase tracking-[0.1em] text-forest transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-100"
                  >
                    Book this package
                    <ArrowUpRight size={15} />
                  </Link>
                  <a
                    href={`https://wa.me/94756657000?text=${encodeURIComponent(
                      `Hello Kekulama Eco Cabana, I'd like to reserve the ${pkg.name} package with the complimentary M3 Tantra Chair.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-5 font-body text-xs font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    <MessageCircle size={15} />
                    WhatsApp reserve
                  </a>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

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

        <motion.div
          {...reveal}
          className="mt-5 overflow-hidden rounded-[2rem] border border-amber-100/20 bg-[#0d1c15] shadow-[0_28px_90px_rgba(0,0,0,0.24)] lg:mt-6"
        >
          <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
            <motion.figure
              className="group relative min-h-[360px] overflow-hidden sm:min-h-[480px] lg:min-h-[600px]"
              whileHover={shouldReduceMotion ? undefined : { scale: 1.008 }}
              transition={{ duration: 0.7, ease: LUXURY_EASING.quintOut }}
            >
              <Image
                src="/images/m3-tantra-chair-cabana.webp"
                alt="Complimentary M3 Tantra Chair inside Kekulama Eco Cabana"
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-[1.025]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07110c]/70 via-transparent to-black/5 lg:bg-gradient-to-r lg:from-transparent lg:to-[#07110c]/20" />

              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.85, rotate: -4 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.55, ease: LUXURY_EASING.quintOut }}
                className="absolute left-5 top-5 rounded-2xl border border-white/25 bg-[#173123]/90 px-4 py-3 text-white shadow-xl backdrop-blur-xl sm:left-7 sm:top-7"
              >
                <div className="flex items-center gap-2">
                  <BadgeCheck size={18} className="text-amber-200" />
                  <span className="font-eyebrow text-[10px] font-bold uppercase tracking-[0.2em] text-amber-100">
                    Complimentary
                  </span>
                </div>
                <strong className="mt-0.5 block font-display text-2xl font-medium">
                  100% FREE
                </strong>
              </motion.div>
            </motion.figure>

            <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-12 xl:p-14">
              <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-amber-100/15 bg-amber-100/[0.07] px-3.5 py-2 font-eyebrow text-[10px] font-bold uppercase tracking-[0.22em] text-amber-100">
                <Armchair size={14} />
                A signature comfort feature
              </div>

              <h3 className="font-display text-4xl font-medium leading-[1.04] tracking-[-0.02em] text-white sm:text-5xl">
                M3 Tantra Chair,
                <span className="block font-serif italic text-amber-100">
                  included free.
                </span>
              </h3>

              <p className="mt-5 max-w-xl font-body text-sm font-normal leading-7 text-white/70 sm:text-base">
                Enjoy the sculptural M3 relaxation chair inside your private
                cabana at no additional charge. It is included with the A/C Day
                Out and Night Out stays for a more comfortable, discreet escape.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {[
                  {
                    icon: Sun,
                    label: "A/C Day Out",
                    price: "LKR 8,000",
                  },
                  {
                    icon: Moon,
                    label: "A/C Night Out",
                    price: "LKR 9,000",
                  },
                ].map(({ icon: Icon, label, price }, index) => (
                  <motion.div
                    key={label}
                    initial={shouldReduceMotion ? false : { opacity: 0, x: 14 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.7 }}
                    transition={{
                      delay: 0.12 + index * 0.08,
                      duration: 0.5,
                      ease: LUXURY_EASING.quintOut,
                    }}
                    className="rounded-2xl border border-white/10 bg-white/[0.055] p-4 transition-colors hover:bg-white/[0.08]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-white/75">
                        <Icon size={16} className="text-amber-100" />
                        <span className="font-body text-xs font-semibold uppercase tracking-[0.1em]">
                          {label}
                        </span>
                      </div>
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 font-eyebrow text-[9px] font-bold uppercase tracking-[0.12em] text-forest">
                        Chair Free
                      </span>
                    </div>
                    <p className="mt-3 font-mono text-2xl font-semibold tabular-nums tracking-[-0.03em] text-white">{price}</p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                {[
                  { icon: Leaf, label: "All-day relaxation" },
                  { icon: Coffee, label: "Unlimited tea & coffee" },
                  { icon: Wifi, label: "Starlink connected" },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-3 text-center"
                  >
                    <Icon size={18} className="text-amber-100" />
                    <span className="font-body text-[10px] font-medium leading-4 text-white/60 sm:text-[11px]">
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
                <Link
                  href="/book?package=Day%20Out%20%E2%80%94%20A%2FC"
                  className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-amber-100 px-5 font-body text-xs font-bold uppercase tracking-[0.14em] text-forest transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-100"
                >
                  Reserve with free chair
                  <ArrowUpRight size={15} />
                </Link>
                <a
                  href="https://wa.me/94756657000?text=Hello%20Kekulama%20Eco%20Cabana%2C%20I%27d%20like%20to%20book%20a%20package%20with%20the%20complimentary%20M3%20Tantra%20Chair."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-5 font-body text-xs font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <MessageCircle size={15} />
                  Ask on WhatsApp
                </a>
              </div>

              <p className="mt-4 text-center font-body text-[10px] leading-4 text-white/40 sm:text-left">
                Complimentary chair access is included with confirmed A/C Day
                Out and Night Out reservations, subject to availability.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

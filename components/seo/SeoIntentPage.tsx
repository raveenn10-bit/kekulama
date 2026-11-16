import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock3,
  Heart,
  MapPin,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

export interface SeoFaq {
  question: string;
  answer: string;
}

interface SeoIntentPageProps {
  eyebrow: string;
  title: string;
  accent: string;
  intro: string;
  heroImage: string;
  heroAlt: string;
  packageName: string;
  price: string;
  priceNote: string;
  bookingPackage: string;
  features: string[];
  highlights: Array<{ title: string; copy: string }>;
  faqs: SeoFaq[];
  relatedHref: string;
  relatedLabel: string;
}

export default function SeoIntentPage({
  eyebrow,
  title,
  accent,
  intro,
  heroImage,
  heroAlt,
  packageName,
  price,
  priceNote,
  bookingPackage,
  features,
  highlights,
  faqs,
  relatedHref,
  relatedLabel,
}: SeoIntentPageProps) {
  const whatsappText = `Hello Kekulama Eco Cabana, I'd like to check availability for ${packageName}.`;

  return (
    <div className="bg-[#f4f1ea] text-sage-900">
      <section className="relative overflow-hidden bg-[#13261d] pb-16 pt-32 text-white sm:pb-20 sm:pt-40 lg:pb-24">
        <div className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-mint-400/15 blur-[110px]" />
        <div className="container-custom relative z-10 grid items-center gap-9 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-4 py-2 font-eyebrow text-[10px] font-bold uppercase tracking-[0.2em] text-amber-100">
              <Heart size={13} className="fill-amber-100/50" />
              {eyebrow}
            </div>
            <h1 className="font-display text-4xl font-medium leading-[1.02] tracking-[-0.025em] text-white sm:text-5xl lg:text-6xl">
              {title}
              <span className="block font-serif italic text-amber-100">
                {accent}
              </span>
            </h1>
            <p className="mt-6 max-w-xl font-body text-sm leading-7 text-white/72 sm:text-base">
              {intro}
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/book?package=${encodeURIComponent(bookingPackage)}`}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-amber-100 px-6 font-body text-xs font-bold uppercase tracking-[0.12em] text-forest transition-colors hover:bg-white"
              >
                Check availability
                <ArrowRight size={15} />
              </Link>
              <a
                href={`https://wa.me/94756657000?text=${encodeURIComponent(whatsappText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-6 font-body text-xs font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-white/10"
              >
                <MessageCircle size={15} />
                Ask on WhatsApp
              </a>
            </div>

            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 font-body text-[11px] text-white/58">
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={13} className="text-amber-100" />
                Pinnaduwa, Galle
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 size={13} className="text-amber-100" />
                12 minutes to Galle Fort
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-amber-100" />
                Private direct booking
              </span>
            </div>
          </div>

          <figure className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_28px_90px_rgba(0,0,0,0.32)]">
            <Image
              src={heroImage}
              alt={heroAlt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07110c]/80 via-transparent to-transparent" />
            <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-7">
              <div>
                <span className="font-eyebrow text-[9px] font-semibold uppercase tracking-[0.18em] text-amber-100">
                  {packageName}
                </span>
                <p className="mt-1 font-mono text-3xl font-semibold text-white sm:text-4xl">
                  LKR {price}
                </p>
                <p className="mt-1 font-body text-[11px] text-white/65">{priceNote}</p>
              </div>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
          <div className="rounded-[2rem] border border-sage-200 bg-white p-6 shadow-soft sm:p-8">
            <span className="font-eyebrow text-[10px] font-bold uppercase tracking-[0.2em] text-mint-700">
              Package includes
            </span>
            <h2 className="mt-2 font-display text-3xl font-medium text-forest sm:text-4xl">
              Everything for an easy escape
            </h2>
            <ul className="mt-6 grid gap-3">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm leading-6 text-sage-700">
                  <span className="mt-1 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-mint-100 text-forest">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {highlights.map((highlight) => (
              <article key={highlight.title} className="rounded-[1.5rem] border border-sage-200/80 bg-white/75 p-6">
                <h2 className="font-display text-2xl font-medium text-forest">
                  {highlight.title}
                </h2>
                <p className="mt-3 font-body text-sm leading-7 text-sage-700">
                  {highlight.copy}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-sage-200/80 bg-white/70 py-14 sm:py-20">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <span className="font-eyebrow text-[10px] font-bold uppercase tracking-[0.22em] text-mint-700">
              Helpful booking answers
            </span>
            <h2 className="mt-2 font-display text-3xl font-medium text-forest sm:text-4xl">
              Frequently asked questions
            </h2>
          </div>
          <div className="mx-auto mt-8 grid max-w-4xl gap-4">
            {faqs.map((faq) => (
              <article key={faq.question} className="rounded-2xl border border-sage-200 bg-white p-6">
                <h3 className="font-display text-xl font-medium text-forest">{faq.question}</h3>
                <p className="mt-2 font-body text-sm leading-7 text-sage-700">{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="container-custom">
          <div className="rounded-[2rem] bg-forest p-7 text-center text-white sm:p-10">
            <h2 className="font-display text-3xl font-medium text-white sm:text-4xl">
              Ready to plan your Galle escape?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/68">
              Check your preferred date online or message the host directly for availability and arrangement details.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href={`/book?package=${encodeURIComponent(bookingPackage)}`}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-amber-100 px-6 text-xs font-bold uppercase tracking-[0.12em] text-forest"
              >
                Reserve {packageName}
                <ArrowRight size={15} />
              </Link>
              <Link
                href={relatedHref}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] px-6 text-xs font-semibold uppercase tracking-[0.1em] text-white"
              >
                {relatedLabel}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

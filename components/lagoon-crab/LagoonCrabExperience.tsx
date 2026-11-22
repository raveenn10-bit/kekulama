"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Check, ChevronDown, Clock3, MapPin, MessageCircle, Play, Sparkles, X } from "lucide-react";
import { LUXURY_EASING } from "@/lib/motion";

const enquiryText = encodeURIComponent("Hello Kekulama Eco Cabana, I would like to enquire about your Sri Lankan Lagoon Crab experience. Please share availability, serving details and today's price.");
const whatsappHref = `https://wa.me/94756657000?text=${enquiryText}`;

const gallery = [
  { src: "/images/lagoon-crab/clay-pot-crab-curry.webp", alt: "Illustrative overhead presentation of Sri Lankan lagoon crab curry with rice", label: "Clay-pot presentation" },
  { src: "/images/lagoon-crab/lagoon-crab-curry-closeup.webp", alt: "Illustrative macro close-up of Sri Lankan lagoon crab curry", label: "Rich local flavour" },
  { src: "/images/lagoon-crab/lagoon-crab-serving-detail.webp", alt: "Illustrative serving detail of lagoon crab curry", label: "A table arranged for you" },
  { src: "/images/lagoon-crab/sri-lankan-spice-details.webp", alt: "Illustrative display of Sri Lankan spices beside crab curry", label: "Southern spice notes" },
  { src: "/images/lagoon-crab/romantic-crab-dining.webp", alt: "Illustrative romantic crab dining table in a tropical setting", label: "Intimate tropical dining" },
];

const faqs = [
  { question: "Is lagoon crab available every day?", answer: "Availability can vary. Please contact the Kekulama host before your stay to confirm current availability, serving details and today’s price." },
  { question: "Is the crab meal included in every cabana package?", answer: "No. The lagoon crab experience is an optional dining enquiry and must be discussed and confirmed separately with the host." },
  { question: "Can I request the experience for a romantic stay?", answer: "You may ask the host about arranging it alongside a confirmed couple or honeymoon stay. The exact setup remains subject to availability and confirmation." },
  { question: "Is Kekulama located beside a lagoon?", answer: "No. Kekulama Eco Cabana is in Pinnaduwa, Galle, in a green tea-garden setting. Lagoon crab describes the culinary experience, not the property location." },
];

const reveal = (reduced: boolean | null) => ({
  initial: { opacity: 0, y: reduced ? 0 : 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.75, ease: LUXURY_EASING.quintOut },
});

export default function LagoonCrabExperience() {
  const shouldReduceMotion = useReducedMotion();
  const [selectedImage, setSelectedImage] = useState<(typeof gallery)[number] | null>(null);

  useEffect(() => {
    if (!selectedImage) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setSelectedImage(null);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [selectedImage]);

  return (
    <div className="overflow-hidden bg-[#f7f1e7] text-[#26352f]">
      <section className="relative min-h-[92svh] overflow-hidden bg-[#10271f] text-white">
        <Image src="/images/lagoon-crab/lagoon-crab-hero.webp" alt="Illustrative Sri Lankan lagoon crab curry presented in a terracotta clay pot" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,24,18,.9)_0%,rgba(8,24,18,.64)_48%,rgba(8,24,18,.18)_100%)]" />
        <motion.div initial={{ scale: 1 }} animate={shouldReduceMotion ? undefined : { scale: 1.04 }} transition={{ duration: 14, ease: "linear" }} className="absolute inset-0 bg-[radial-gradient(circle_at_72%_28%,rgba(231,189,114,.15),transparent_32%)]" />
        <div className="container-custom relative z-10 flex min-h-[92svh] items-end pb-16 pt-32 sm:items-center sm:pb-20 sm:pt-40">
          <motion.div initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: LUXURY_EASING.editorial }} className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#e7bd72]/35 bg-black/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f2d59f] backdrop-blur-md"><Sparkles size={14} aria-hidden="true" /> A southern Sri Lankan dining enquiry</div>
            <h1 className="font-display text-[clamp(3.1rem,8vw,7.2rem)] font-normal leading-[.92] tracking-[-.045em] text-white">Lagoon Crab<span className="block text-[#e7bd72]">in Galle.</span></h1>
            <p className="mt-7 max-w-2xl text-base font-light leading-8 text-white/80 sm:text-xl">An intimate Sri Lankan crab dining arrangement to enquire about during your private Kekulama escape in Pinnaduwa.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#e7bd72] px-7 py-3 text-sm font-semibold text-[#10271f] transition hover:bg-[#f1d59f]"><MessageCircle size={18} aria-hidden="true" /> Ask for today&apos;s price</a>
              <a href="#discover" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-7 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/10">Discover the experience <ChevronDown size={18} aria-hidden="true" /></a>
            </div>
            <p className="mt-5 text-xs leading-5 text-white/55">Hero and gallery visuals are illustrative marketing imagery created for this culinary presentation.</p>
          </motion.div>
        </div>
      </section>

      <section id="discover" className="section-padding">
        <div className="container-custom grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <motion.div {...reveal(shouldReduceMotion)}>
            <span className="luxury-eyebrow text-[#9a542f]">Discover the experience</span>
            <h2 className="mt-5 font-display text-4xl font-normal leading-tight text-[#17382b] sm:text-5xl">Bold island flavour,<span className="block text-[#a85f36]">quietly presented.</span></h2>
            <p className="mt-6 text-base leading-8 text-[#526259] sm:text-lg">Ask about a Sri Lankan lagoon crab meal arranged around your confirmed stay. The experience is designed as a relaxed, private dining moment with the tropical warmth and attentive direct-host support that define Kekulama.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {["Direct availability confirmation", "Today’s price shared by the host", "Serving details discussed before arrival", "Optional addition to a confirmed stay"].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-[#d9cbb7] bg-white/60 p-4"><span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#17382b] text-[#f3cf8c]"><Check size={14} aria-hidden="true" /></span><span className="text-sm font-medium leading-6 text-[#344a40]">{item}</span></div>
              ))}
            </div>
          </motion.div>
          <motion.div {...reveal(shouldReduceMotion)} className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-2xl sm:rounded-[2.75rem]"><Image src="/images/lagoon-crab/lagoon-crab-curry-closeup.webp" alt="Illustrative close-up of Sri Lankan lagoon crab curry" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" /></div>
            <div className="absolute -bottom-5 -left-3 max-w-[14rem] rounded-2xl border border-white/70 bg-white/90 p-5 shadow-xl backdrop-blur-md sm:-left-8"><p className="font-display text-xl text-[#17382b]">Ask. Confirm. Savour.</p><p className="mt-1 text-xs leading-5 text-[#66736c]">Current details come directly from the host.</p></div>
          </motion.div>
        </div>
      </section>

      <section className="bg-[#10271f] py-16 text-white sm:py-24">
        <div className="container-custom">
          <motion.div {...reveal(shouldReduceMotion)} className="mb-9 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div><span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e7bd72]">Cinematic preview</span><h2 className="mt-3 font-display text-4xl font-normal text-white sm:text-5xl">A slower look at the table.</h2></div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-white/55"><Play size={15} aria-hidden="true" /> Short visual preview</div>
          </motion.div>
          <motion.div {...reveal(shouldReduceMotion)} className="overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-2xl">
            <video className="hidden aspect-video w-full object-cover md:block" autoPlay={!shouldReduceMotion} muted loop playsInline controls poster="/images/lagoon-crab/lagoon-crab-hero.webp" preload="metadata" aria-label="Illustrative cinematic lagoon crab presentation"><source src="/videos/lagoon-crab-gemini-desktop.mp4" type="video/mp4" /></video>
            <video className="aspect-[9/16] max-h-[78svh] w-full object-cover md:hidden" autoPlay={!shouldReduceMotion} muted loop playsInline controls poster="/images/lagoon-crab/lagoon-crab-vertical.webp" preload="metadata" aria-label="Vertical illustrative lagoon crab presentation"><source src="/videos/lagoon-crab-reel-9x16.mp4" type="video/mp4" /></video>
          </motion.div>
          <p className="mt-4 text-center text-xs leading-5 text-white/50">Illustrative motion presentation; food appearance and arrangements may vary.</p>
        </div>
      </section>

      <section className="section-padding bg-[#efe4d4]">
        <div className="container-custom">
          <motion.div {...reveal(shouldReduceMotion)} className="mx-auto mb-10 max-w-2xl text-center"><span className="luxury-eyebrow text-[#9a542f]">Visual story</span><h2 className="mt-4 font-display text-4xl font-normal text-[#17382b] sm:text-5xl">Details worth slowing down for.</h2><p className="mt-5 text-sm leading-7 text-[#637068] sm:text-base">Tap any image for a closer view. These are illustrative marketing visuals, not documentary photographs of a guaranteed setup.</p></motion.div>
          <div className="grid auto-rows-[220px] gap-4 sm:grid-cols-2 sm:auto-rows-[280px] lg:grid-cols-12">
            {gallery.map((image, index) => (
              <motion.button key={image.src} type="button" onClick={() => setSelectedImage(image)} initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.65, delay: index * 0.06, ease: LUXURY_EASING.quintOut }} whileHover={shouldReduceMotion ? undefined : { y: -4 }} className={`group relative overflow-hidden rounded-[1.6rem] text-left shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#17382b] ${index === 0 ? "sm:row-span-2 lg:col-span-7" : index === 4 ? "lg:col-span-7" : "lg:col-span-5"}`} aria-label={`Open image: ${image.label}`}>
                <Image src={image.src} alt={image.alt} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 58vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" /><div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" /><span className="absolute bottom-5 left-5 text-sm font-semibold tracking-wide text-white">{image.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-[#f7f1e7]">
        <div className="container-custom grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-20">
          <motion.div {...reveal(shouldReduceMotion)}>
            <span className="luxury-eyebrow text-[#9a542f]">Enquiry & location</span><h2 className="mt-5 font-display text-4xl font-normal text-[#17382b] sm:text-5xl">Plan the dining moment with your host.</h2>
            <p className="mt-6 text-base leading-8 text-[#5b6962]">Kekulama is located in Pinnaduwa, Galle—not beside a lagoon. Contact the host to discuss crab availability and how the experience could fit your confirmed cabana stay.</p>
            <div className="mt-8 space-y-4">
              <div className="flex gap-4 rounded-2xl border border-[#ded1bf] bg-white/65 p-5"><MapPin className="mt-1 shrink-0 text-[#a85f36]" size={20} aria-hidden="true" /><div><p className="font-semibold text-[#263d33]">Kekulama Eco Cabana</p><p className="mt-1 text-sm leading-6 text-[#66736c]">416/1, Pinnaduwa, Galle 80000, Sri Lanka</p></div></div>
              <div className="flex gap-4 rounded-2xl border border-[#ded1bf] bg-white/65 p-5"><Clock3 className="mt-1 shrink-0 text-[#a85f36]" size={20} aria-hidden="true" /><div><p className="font-semibold text-[#263d33]">Availability by direct confirmation</p><p className="mt-1 text-sm leading-6 text-[#66736c]">Ask before arrival for current serving options and today&apos;s price.</p></div></div>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#17382b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#24523f]"><MessageCircle size={18} aria-hidden="true" /> Enquire on WhatsApp</a>
              <a href="https://maps.app.goo.gl/SjnALMB1tAHYKzkM6" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#bfae98] px-6 py-3 text-sm font-semibold text-[#17382b] transition hover:bg-white">Open Google Maps <ArrowUpRight size={17} aria-hidden="true" /></a>
            </div>
          </motion.div>
          <motion.div {...reveal(shouldReduceMotion)} className="rounded-[2rem] bg-[#17382b] p-7 text-white shadow-xl sm:p-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e7bd72]">Before you enquire</p><h3 className="mt-3 font-display text-3xl font-normal text-white">Share three simple details.</h3>
            <div className="mt-8 space-y-5">
              {[["Your preferred date", "So the host can check both cabana and dining availability."], ["Number of guests", "To discuss a suitable serving arrangement."], ["Your selected stay", "Day out, overnight or romantic package, if already chosen."]].map(([title, copy], index) => (
                <div key={title} className="flex gap-4 border-b border-white/10 pb-5 last:border-0 last:pb-0"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#e7bd72]/40 text-sm text-[#e7bd72]">{index + 1}</span><div><p className="font-semibold text-white">{title}</p><p className="mt-1 text-sm leading-6 text-white/60">{copy}</p></div></div>
              ))}
            </div>
            <div className="mt-9 rounded-2xl border border-[#e7bd72]/25 bg-[#e7bd72]/10 p-5"><p className="font-display text-2xl text-[#f3d49a]">Ask for today&apos;s price</p><p className="mt-2 text-sm leading-6 text-white/65">No fixed rate is published because availability and serving arrangements can change.</p></div>
          </motion.div>
        </div>
      </section>

      <section className="bg-[#efe4d4] py-16 sm:py-24">
        <div className="container-custom grid gap-12 lg:grid-cols-[.75fr_1.25fr] lg:gap-20">
          <motion.div {...reveal(shouldReduceMotion)}><span className="luxury-eyebrow text-[#9a542f]">Helpful answers</span><h2 className="mt-5 font-display text-4xl font-normal text-[#17382b] sm:text-5xl">Lagoon crab FAQs.</h2></motion.div>
          <motion.div {...reveal(shouldReduceMotion)} className="divide-y divide-[#cdbda8] border-y border-[#cdbda8]">
            {faqs.map((faq) => <details key={faq.question} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-[#263d33] marker:content-none sm:text-lg">{faq.question}<ChevronDown className="shrink-0 transition-transform group-open:rotate-180" size={19} aria-hidden="true" /></summary><p className="max-w-2xl pt-4 text-sm leading-7 text-[#627068] sm:text-base">{faq.answer}</p></details>)}
          </motion.div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#a95e35] py-20 text-white sm:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,226,170,.26),transparent_28%)]" />
        <motion.div {...reveal(shouldReduceMotion)} className="container-custom relative z-10 text-center"><p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ffe2ad]">A memorable addition to your Galle escape</p><h2 className="mx-auto mt-5 max-w-4xl font-display text-4xl font-normal leading-tight text-white sm:text-6xl">Ready to ask about lagoon crab?</h2><p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/80">Message the Kekulama host for availability, serving details and today&apos;s price, or explore the private cabana packages first.</p><div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row"><a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#17382b] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#10271f]"><MessageCircle size={18} aria-hidden="true" /> Enquire now</a><Link href="/#packages" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/35 bg-white/10 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/20">Explore stay packages <ArrowUpRight size={17} aria-hidden="true" /></Link></div></motion.div>
      </section>

      <AnimatePresence>
        {selectedImage && (
          <motion.div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label={selectedImage.label} onClick={() => setSelectedImage(null)}>
            <button type="button" onClick={() => setSelectedImage(null)} className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition hover:bg-white/20" aria-label="Close image viewer" autoFocus><X size={20} aria-hidden="true" /></button>
            <motion.div initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.98 }} transition={{ duration: 0.35, ease: LUXURY_EASING.quintOut }} className="relative h-[78vh] w-full max-w-5xl overflow-hidden rounded-2xl" onClick={(event) => event.stopPropagation()}><Image src={selectedImage.src} alt={selectedImage.alt} fill sizes="100vw" className="object-contain" /></motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

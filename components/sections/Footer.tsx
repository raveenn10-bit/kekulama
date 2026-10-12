"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Facebook, Instagram, Music2, Home, MapPin, Lock } from "lucide-react";
import { siteData } from "@/data/siteData";
import { LUXURY_EASING } from "@/lib/motion";

export function Footer() {
  const { contact, nav } = siteData;
  const shouldReduceMotion = useReducedMotion();

  const photoStrip = [
    { src: "/images/hero.jpg", alt: "Cabana & Tea Estate Panorama", caption: "Tea Estate Panorama" },
    { src: "/images/loft-bedroom.jpg", alt: "Loft Bedroom Sanctuary", caption: "Loft Bedroom" },
    { src: "/images/cabana-garden.jpg", alt: "Garden Pathway & Flora", caption: "Garden Pathways" },
    { src: "/images/interior-lamps.jpg", alt: "Interior Living & Amber Lamps", caption: "Handmade Timber Details" },
    { src: "/images/cabana-trees.jpg", alt: "Cabana Nestled in Nature", caption: "Forest Canopy" },
    { src: "/images/cabana-front.jpg", alt: "Front Verandah & Lawn", caption: "Verandah Relaxation" },
    { src: "/images/interior-kitchen.jpg", alt: "Kitchenette & Living Area", caption: "Kitchenette & Comforts" },
    { src: "/images/entrance.jpg", alt: "Stone Stepping Pathway", caption: "Sanctuary Entrance" },
    { src: "/images/cabana-below.jpg", alt: "Estate Valley View", caption: "Valley Vistas" },
    { src: "/images/door-vines.jpg", alt: "Timber Door & Tropical Flora", caption: "Living Architecture" },
  ];

  // Duplicate for a seamless infinite loop ticker
  const duplicatedPhotos = [...photoStrip, ...photoStrip];

  const highlights = [
    "Eco Cabana Stays",
    "Tea Estate Walks",
    "Loft Bedroom Retreats",
    "Private Sanctuary",
    "Galle Day Tours",
    "Direct Nature Access",
  ];

  return (
    <footer className="bg-sand-50/80 border-t border-sage-200/80 text-sage-900 overflow-hidden">
      {/* Infinite Auto-Scrolling Photography Strip with Smooth Marquee */}
      <div className="relative w-full overflow-hidden bg-forest-dark py-2 group cursor-pointer">
        {/* Soft edge gradient fades for luxury editorial feel */}
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-24 bg-gradient-to-r from-forest-dark to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-24 bg-gradient-to-l from-forest-dark to-transparent z-10 pointer-events-none" />

        <div className="animate-marquee gap-2 sm:gap-2.5 px-1 flex items-center">
          {duplicatedPhotos.map((photo, i) => (
            <div
              key={i}
              className="relative w-[190px] sm:w-[260px] md:w-[310px] h-[135px] sm:h-[180px] md:h-[210px] flex-shrink-0 rounded-2xl overflow-hidden group/item shadow-sm border border-white/10"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 640px) 190px, (max-width: 768px) 260px, 310px"
                className="object-cover group-hover/item:scale-108 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/75 via-transparent to-transparent opacity-60 group-hover/item:opacity-30 transition-opacity duration-300" />
              
              {/* Subtle caption reveal on hover */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 text-left">
                <span className="font-eyebrow text-[9px] sm:text-[9.5px] uppercase tracking-[0.24em] text-white/90 font-medium block drop-shadow-sm">
                  {photo.caption}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container-custom py-14 sm:py-20 md:py-24 flex flex-col items-center text-center">
        {/* Brand Logo & Luxury Name */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: LUXURY_EASING.quintOut }}
          className="flex flex-col items-center mb-8"
        >
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden shadow-soft mb-3.5 border border-mint-300/80">
            <Image
              src="/images/logo.jpg"
              alt="Kekulama Eco Cabana Logo"
              fill
              className="object-cover"
            />
          </div>
          <h2 className="font-display text-2xl sm:text-4xl tracking-[0.22em] text-forest font-normal uppercase">
            Kekulama
          </h2>
          <span className="font-eyebrow text-[10px] sm:text-xs uppercase tracking-[0.34em] text-mint-700 font-normal mt-1">
            Eco Sanctuary · Galle
          </span>
        </motion.div>

        {/* Circular Social & Review Platform Buttons */}
        <div className="flex items-center justify-center gap-2.5 sm:gap-3 mb-8 sm:mb-10 flex-wrap">
          <motion.a
            href={contact.social.tripadvisor || "https://www.tripadvisor.com/Hotel_Review-g297896-d34099769-Reviews-Kekulama_Eco_Cabana-Galle_Galle_District_Southern_Province.html"}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={shouldReduceMotion ? {} : { y: -2, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.25, ease: LUXURY_EASING.quintOut }}
            className="h-10 px-3.5 rounded-full bg-[#00AA6C]/10 border border-[#00AA6C]/30 text-[#00875A] hover:text-white hover:bg-[#00AA6C] hover:border-[#00AA6C] flex items-center gap-1.5 shadow-sm transition-colors active:scale-95 text-xs font-semibold uppercase tracking-wider"
            aria-label="TripAdvisor"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="11" fill="currentColor" />
              <circle cx="8" cy="12" r="2.8" fill="white" />
              <circle cx="8" cy="12" r="1.4" fill="#00AA6C" />
              <circle cx="16" cy="12" r="2.8" fill="white" />
              <circle cx="16" cy="12" r="1.4" fill="#00AA6C" />
              <path d="M12 9.5l-1.8 2.5h3.6l-1.8-2.5z" fill="white" />
            </svg>
            <span>TripAdvisor</span>
          </motion.a>

          <motion.a
            href={contact.bookingcomUrl || "https://www.booking.com/searchresults.html?ss=Kekulama+Eco+Cabana+Galle"}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={shouldReduceMotion ? {} : { y: -2, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.25, ease: LUXURY_EASING.quintOut }}
            className="h-10 px-3.5 rounded-full bg-[#003580]/10 border border-[#003580]/30 text-[#003580] hover:text-white hover:bg-[#003580] hover:border-[#003580] flex items-center gap-1.5 shadow-sm transition-colors active:scale-95 text-xs font-semibold uppercase tracking-wider"
            aria-label="Booking.com"
          >
            <div className="w-4 h-4 rounded-full bg-[#003580] text-white text-[9px] font-bold flex items-center justify-center">
              B.
            </div>
            <span>Booking.com</span>
          </motion.a>

          {[
            { href: contact.social.facebook, icon: Facebook, label: "Facebook" },
            { href: contact.social.instagram, icon: Instagram, label: "Instagram" },
            { href: contact.social.airbnb, icon: Home, label: "Airbnb" },
          ].map((soc, idx) => {
            const Icon = soc.icon;
            return (
              <motion.a
                key={idx}
                href={soc.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={shouldReduceMotion ? {} : { y: -2, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.25, ease: LUXURY_EASING.quintOut }}
                className="w-10 h-10 rounded-full bg-white border border-sage-200 text-sage-700 hover:text-white hover:bg-mint-500 hover:border-mint-500 flex items-center justify-center shadow-sm transition-colors active:scale-95"
                aria-label={soc.label}
              >
                <Icon size={16} strokeWidth={1.5} />
              </motion.a>
            );
          })}
          <motion.a
            href={`https://wa.me/${contact.whatsappRaw}`}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={shouldReduceMotion ? {} : { y: -2, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.25, ease: LUXURY_EASING.quintOut }}
            className="w-10 h-10 rounded-full bg-white border border-sage-200 text-sage-700 hover:text-white hover:bg-[#25D366] hover:border-[#25D366] flex items-center justify-center shadow-sm transition-colors active:scale-95"
            aria-label="WhatsApp"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
          </motion.a>
        </div>

        {/* Navigation Links in Minimalist Horizontal Row */}
        <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-9 mb-7 font-body text-[11px] sm:text-[11.5px] font-semibold uppercase tracking-[0.16em] text-sage-800">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-mint-600 transition-colors py-1 px-1.5"
            >
              {item.label || item.name}
            </Link>
          ))}
        </nav>

        {/* Sub-highlights bulleted list */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-body font-light text-[11px] sm:text-xs text-sage-500 mb-10 max-w-2xl px-2">
          {highlights.map((item, idx) => (
            <React.Fragment key={idx}>
              <span>{item}</span>
              {idx < highlights.length - 1 && (
                <span className="text-sage-300">·</span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Get in Touch CTA Block */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: LUXURY_EASING.quintOut }}
          className="flex flex-col items-center mb-10"
        >
          <span className="font-eyebrow text-[10px] sm:text-[11px] font-normal uppercase tracking-[0.28em] text-bark-dark mb-2">
            Direct Inquiries
          </span>
          <a
            href={`tel:${contact.phoneRaw}`}
            className="font-display text-2xl sm:text-4xl text-forest hover:text-mint-600 transition-colors mb-2 tracking-wide font-normal"
          >
            {contact.phoneDisplay || contact.phone}
          </a>
          <div className="flex items-center justify-center gap-1.5 font-body font-light text-xs text-sage-600 mt-1 px-4 text-center">
            <MapPin size={13} className="text-mint-600 flex-shrink-0" />
            <span>{contact.address}</span>
          </div>
        </motion.div>

        {/* Divider & Copyright */}
        <div className="w-full max-w-4xl border-t border-sage-200/80 pt-6 mt-2 flex flex-col sm:flex-row items-center justify-center sm:justify-between font-body text-xs text-sage-500 gap-3">
          <p>
            Copyright &copy; {new Date().getFullYear()} Kekulama Eco Cabana. All Rights Reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 font-eyebrow text-[10px] uppercase tracking-[0.2em] text-sage-400">
            <Link
              href="/privacy"
              className="hover:text-mint-700 transition-colors py-0.5 px-1.5 rounded hover:bg-mint-50/60"
            >
              Privacy Policy
            </Link>
            <span>·</span>
            <Link
              href="/terms"
              className="hover:text-mint-700 transition-colors py-0.5 px-1.5 rounded hover:bg-mint-50/60"
            >
              Terms of Service
            </Link>
            <span>·</span>
            <Link
              href="/admin"
              className="flex items-center gap-1 hover:text-mint-700 transition-colors py-0.5 px-2 rounded hover:bg-mint-50/60 cursor-pointer"
              title="Staff & Owner Admin Portal"
            >
              <Lock size={11} />
              <span>Owner Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

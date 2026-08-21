import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Music2, Home, MapPin, Phone, Lock } from "lucide-react";
import { siteData } from "@/data/siteData";

export function Footer() {
  const { contact, nav } = siteData;

  const photoStrip = [
    { src: "/images/hero.jpg", alt: "Cabana & Tea Estate" },
    { src: "/images/loft-bedroom.jpg", alt: "Loft Bedroom" },
    { src: "/images/cabana-garden.jpg", alt: "Garden Pathway" },
    { src: "/images/interior-lamps.jpg", alt: "Interior Living Area" },
    { src: "/images/cabana-trees.jpg", alt: "Cabana in Nature" },
    { src: "/images/cabana-front.jpg", alt: "Front Verandah" },
  ];

  const highlights = [
    "Eco Cabana Stays",
    "Tea Estate Walks",
    "Loft Bedroom Retreats",
    "Private Sanctuary",
    "Galle Day Tours",
    "Direct Nature Access",
  ];

  return (
    <footer className="bg-sand-50/70 border-t border-sage-200/80 text-sage-900 overflow-hidden">
      {/* Visual Photography Strip */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 p-1 bg-sage-100/50">
        {photoStrip.map((photo, i) => (
          <div
            key={i}
            className="relative h-24 sm:h-32 md:h-36 overflow-hidden group cursor-pointer"
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 640px) 33vw, 16vw"
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-forest-dark/20 group-hover:bg-forest-dark/0 transition-colors" />
          </div>
        ))}
      </div>

      <div className="container-custom py-16 md:py-20 flex flex-col items-center text-center">
        {/* Brand Logo & Name */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-16 h-16 rounded-full overflow-hidden shadow-soft mb-4 border-2 border-bark/30">
            <Image
              src="/images/logo.jpg"
              alt="Kekulama Eco Cabana Logo"
              fill
              className="object-cover"
            />
          </div>
          <h2 className="font-display text-2xl md:text-3xl tracking-[0.2em] text-forest font-semibold uppercase">
            Kekulama
          </h2>
          <span className="text-xs uppercase tracking-[0.3em] text-bark font-medium mt-1">
            Eco Cabana · Galle
          </span>
        </div>

        {/* Circular Social Media Buttons */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <a
            href={contact.social.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white border border-sage-200 text-sage-700 hover:text-white hover:bg-bark hover:border-bark flex items-center justify-center shadow-sm hover:shadow transition-all hover:scale-105"
            aria-label="Facebook"
          >
            <Facebook size={18} strokeWidth={1.5} />
          </a>
          <a
            href={contact.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white border border-sage-200 text-sage-700 hover:text-white hover:bg-bark hover:border-bark flex items-center justify-center shadow-sm hover:shadow transition-all hover:scale-105"
            aria-label="Instagram"
          >
            <Instagram size={18} strokeWidth={1.5} />
          </a>
          <a
            href={contact.social.tiktok}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white border border-sage-200 text-sage-700 hover:text-white hover:bg-bark hover:border-bark flex items-center justify-center shadow-sm hover:shadow transition-all hover:scale-105"
            aria-label="TikTok"
          >
            <Music2 size={18} strokeWidth={1.5} />
          </a>
          <a
            href={contact.social.airbnb}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white border border-sage-200 text-sage-700 hover:text-white hover:bg-bark hover:border-bark flex items-center justify-center shadow-sm hover:shadow transition-all hover:scale-105"
            aria-label="Airbnb"
          >
            <Home size={18} strokeWidth={1.5} />
          </a>
          <a
            href={`https://wa.me/${contact.whatsappRaw}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white border border-sage-200 text-sage-700 hover:text-white hover:bg-[#25D366] hover:border-[#25D366] flex items-center justify-center shadow-sm hover:shadow transition-all hover:scale-105"
            aria-label="WhatsApp"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
          </a>
        </div>

        {/* Navigation Links in Minimalist Horizontal Row */}
        <nav className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 mb-8 text-xs font-semibold uppercase tracking-[0.18em] text-sage-800">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-bark transition-colors py-1"
            >
              {item.label || item.name}
            </Link>
          ))}
        </nav>

        {/* Sub-highlights bulleted list */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs text-sage-500 mb-12 max-w-2xl">
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
        <div className="flex flex-col items-center mb-12">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-bark mb-3">
            Get in Touch!
          </span>
          <a
            href={`tel:${contact.phoneRaw}`}
            className="text-2xl sm:text-3xl font-display font-semibold text-forest hover:text-bark transition-colors mb-2 tracking-wide"
          >
            {contact.phoneDisplay || contact.phone}
          </a>
          <div className="flex items-center justify-center gap-1.5 text-xs text-sage-600 mt-1">
            <MapPin size={14} className="text-bark" />
            <span>Address: {contact.address}</span>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="w-full max-w-4xl border-t border-sage-200/80 pt-8 mt-2 flex flex-col sm:flex-row items-center justify-center sm:justify-between text-xs text-sage-500 gap-3">
          <p>
            Copyright &copy; {new Date().getFullYear()} Kekulama Eco Cabana. All Rights Reserved.
          </p>
          <div className="flex items-center gap-1 text-sage-400">
            <Lock size={12} />
            <span>Private Eco Retreat · Galle</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Music2, Home, ExternalLink } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { siteData } from "@/data/siteData";
import { LUXURY_EASING, LUXURY_DURATION } from "@/lib/motion";

export default function Contact() {
  const { contact } = siteData;
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="contact" className="section-padding bg-gradient-to-b from-white via-eucalyptus-50/40 to-sand-50">
      <div className="container-custom">
        <SectionHeading
          badge="Get in Touch"
          title="Plan your"
          highlight="escape"
          subtitle="Reach out directly for reservations, package customisation, or driving directions."
        />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 mt-8 sm:mt-12">
          {/* Left Column: Contact Cards */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: LUXURY_DURATION.medium, ease: LUXURY_EASING.quintOut }}
            className="lg:col-span-2 flex flex-col justify-between"
          >
            <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-soft border border-mint-100 flex flex-col gap-3.5 sm:gap-4">
              <a
                href={`tel:${contact.phoneRaw}`}
                className="flex items-start gap-3.5 sm:gap-4 p-2.5 sm:p-3 rounded-2xl hover:bg-mint-50/70 transition-colors border border-transparent hover:border-mint-200 group active:scale-[0.99]"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-mint-100 text-mint-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                  <Phone size={19} strokeWidth={1.75} />
                </div>
                <div>
                  <span className="font-eyebrow text-[10px] sm:text-[10.5px] uppercase tracking-[0.2em] font-normal text-mint-700 block">Direct Call</span>
                  <span className="font-body text-forest font-semibold text-sm sm:text-base">{contact.phoneDisplay || contact.phone}</span>
                </div>
              </a>

              <a
                href={`mailto:${contact.email}`}
                className="flex items-start gap-3.5 sm:gap-4 p-2.5 sm:p-3 rounded-2xl hover:bg-mint-50/70 transition-colors border border-transparent hover:border-mint-200 group active:scale-[0.99]"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-eucalyptus-100 text-eucalyptus-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                  <Mail size={19} strokeWidth={1.75} />
                </div>
                <div>
                  <span className="font-eyebrow text-[10px] sm:text-[10.5px] uppercase tracking-[0.2em] font-normal text-eucalyptus-700 block">Email Inquiries</span>
                  <span className="font-body text-forest font-semibold text-xs sm:text-sm break-all">{contact.email}</span>
                </div>
              </a>

              <div className="flex items-start gap-3.5 sm:gap-4 p-2.5 sm:p-3 rounded-2xl bg-sage-50/60 border border-sage-100">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-sand-200 text-bark-dark flex items-center justify-center flex-shrink-0">
                  <MapPin size={19} strokeWidth={1.75} />
                </div>
                <div>
                  <span className="font-eyebrow text-[10px] sm:text-[10.5px] uppercase tracking-[0.2em] font-normal text-sage-600 block">Location Address</span>
                  <span className="font-body font-light text-sage-800 text-xs sm:text-sm">{contact.address}</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5 sm:gap-4 p-2.5 sm:p-3 rounded-2xl bg-sage-50/60 border border-sage-100">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-mint-100 text-mint-800 flex items-center justify-center flex-shrink-0">
                  <Clock size={19} strokeWidth={1.75} />
                </div>
                <div>
                  <span className="font-eyebrow text-[10px] sm:text-[10.5px] uppercase tracking-[0.2em] font-normal text-sage-600 block">Hours</span>
                  <span className="font-body font-light text-sage-800 text-xs sm:text-sm">Check-in: From 2:00 PM · Check-out: By 10:00 AM</span>
                </div>
              </div>

              {/* Social & Review Channels */}
              <div className="pt-2.5 border-t border-sage-100 flex items-center justify-between flex-wrap gap-2">
                <span className="font-eyebrow text-xs uppercase tracking-wider text-sage-600">Review & Social:</span>
                <div className="flex gap-2 items-center">
                  <a
                    href={contact.social.tripadvisor || "https://www.tripadvisor.com/Hotel_Review-g297896-d34099769-Reviews-Kekulama_Eco_Cabana-Galle_Galle_District_Southern_Province.html"}
                    target="_blank"
                    rel="noreferrer"
                    className="h-9 px-3 rounded-full bg-[#00AA6C]/15 text-[#00875A] hover:bg-[#00AA6C] hover:text-white flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase transition-all active:scale-95 border border-[#00AA6C]/30"
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
                  </a>
                  <a
                    href={contact.bookingcomUrl || "https://www.booking.com/searchresults.html?ss=Kekulama+Eco+Cabana+Galle"}
                    target="_blank"
                    rel="noreferrer"
                    className="h-9 px-3 rounded-full bg-[#003580]/15 text-[#003580] hover:bg-[#003580] hover:text-white flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase transition-all active:scale-95 border border-[#003580]/30"
                    aria-label="Booking.com"
                  >
                    <span className="font-bold text-xs">B.</span>
                    <span>Booking.com</span>
                  </a>
                  <a
                    href={contact.social.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-full bg-sage-100 text-forest hover:bg-mint-500 hover:text-white flex items-center justify-center transition-all active:scale-95"
                    aria-label="Facebook"
                  >
                    <Facebook size={16} />
                  </a>
                  <a
                    href={contact.social.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-full bg-sage-100 text-forest hover:bg-mint-500 hover:text-white flex items-center justify-center transition-all active:scale-95"
                    aria-label="Instagram"
                  >
                    <Instagram size={16} />
                  </a>
                  <a
                    href={contact.social.airbnb}
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-full bg-sage-100 text-forest hover:bg-mint-500 hover:text-white flex items-center justify-center transition-all active:scale-95"
                    aria-label="Airbnb"
                  >
                    <Home size={16} />
                  </a>
                </div>
              </div>
            </div>

            {/* Instant WhatsApp Direct Card */}
            <motion.a
              href={`https://wa.me/${contact.whatsappRaw}?text=Hello%20Kekulama%20Eco%20Cabana,%20I%20would%20like%20to%20inquire%20about%20availability.`}
              target="_blank"
              rel="noreferrer"
              whileHover={shouldReduceMotion ? {} : { y: -1, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-2xl py-3.5 sm:py-4 transition-all duration-300 font-body font-semibold text-xs uppercase tracking-[0.14em] shadow-lg hover:shadow-xl active:scale-[0.98]"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              <span>Instant WhatsApp Booking</span>
            </motion.a>
          </motion.div>

          {/* Right Column: Google Maps Embed Card */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: LUXURY_DURATION.medium, ease: LUXURY_EASING.quintOut, delay: 0.15 }}
            className="lg:col-span-3 rounded-3xl overflow-hidden shadow-soft border-4 border-white h-[320px] sm:h-[380px] lg:h-full min-h-[320px] relative group"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3967!2d80.259783!3d6.0779352!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae1710054f6ee65%3A0x9cfbe90a9ea62167!2sKekulama%20Eco%20Cabana%20galle!5e0!3m2!1sen!2slk!4v1692000000000!5m2!1sen!2slk"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Maps Location"
            />
            
            <a
              href={contact.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-3.5 right-3.5 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-forest shadow-md hover:bg-mint-500 hover:text-white transition-all flex items-center gap-1.5 active:scale-95"
            >
              <span>Google Maps</span>
              <ExternalLink size={12} />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

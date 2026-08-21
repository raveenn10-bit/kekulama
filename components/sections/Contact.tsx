"use client";

import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Music2, Home } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import { siteData } from "@/data/siteData";

export default function Contact() {
  const { contact } = siteData;

  return (
    <section id="contact" className="section-padding bg-sand-50">
      <div className="container-custom">
        <SectionHeading
          badge="Get in Touch"
          title="Plan your"
          highlight="escape"
        />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 mt-16">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-2"
          >
            <div className="flex flex-col">
              <a href={`tel:${contact.phoneRaw}`} className="flex items-start gap-4 py-4 border-b border-sage-100 last:border-0 hover:bg-sage-100/50 transition-colors p-2 -mx-2 rounded-lg">
                <div className="w-10 h-10 rounded-xl bg-bark/10 flex items-center justify-center text-bark flex-shrink-0">
                  <Phone size={20} strokeWidth={1.5} />
                </div>
                <div className="flex flex-col justify-center h-10">
                  <span className="text-sage-700 text-sm">{contact.phone}</span>
                </div>
              </a>

              <a href={`mailto:${contact.email}`} className="flex items-start gap-4 py-4 border-b border-sage-100 last:border-0 hover:bg-sage-100/50 transition-colors p-2 -mx-2 rounded-lg">
                <div className="w-10 h-10 rounded-xl bg-bark/10 flex items-center justify-center text-bark flex-shrink-0">
                  <Mail size={20} strokeWidth={1.5} />
                </div>
                <div className="flex flex-col justify-center h-10">
                  <span className="text-sage-700 text-sm">{contact.email}</span>
                </div>
              </a>

              <div className="flex items-start gap-4 py-4 border-b border-sage-100 last:border-0 p-2 -mx-2">
                <div className="w-10 h-10 rounded-xl bg-bark/10 flex items-center justify-center text-bark flex-shrink-0">
                  <MapPin size={20} strokeWidth={1.5} />
                </div>
                <div className="flex flex-col justify-center min-h-[2.5rem]">
                  <span className="text-sage-700 text-sm">{contact.address}</span>
                </div>
              </div>

              <div className="flex items-start gap-4 py-4 border-b border-sage-100 last:border-0 p-2 -mx-2">
                <div className="w-10 h-10 rounded-xl bg-bark/10 flex items-center justify-center text-bark flex-shrink-0">
                  <Clock size={20} strokeWidth={1.5} />
                </div>
                <div className="flex flex-col justify-center min-h-[2.5rem]">
                  <span className="text-sage-700 text-sm">Check-in: 14:00 | Check-out: 11:00</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <a href={contact.social.facebook} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center hover:bg-bark transition-colors">
                <Facebook size={18} strokeWidth={1.5} />
              </a>
              <a href={contact.social.instagram} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center hover:bg-bark transition-colors">
                <Instagram size={18} strokeWidth={1.5} />
              </a>
              <a href={contact.social.tiktok} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center hover:bg-bark transition-colors">
                <Music2 size={18} strokeWidth={1.5} />
              </a>
              <a href={contact.social.airbnb} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center hover:bg-bark transition-colors">
                <Home size={18} strokeWidth={1.5} />
              </a>
            </div>

            <a
              href={`https://wa.me/${contact.whatsappRaw}`}
              target="_blank"
              rel="noreferrer"
              className="mt-6 w-full flex items-center justify-center gap-2 bg-bark text-white rounded-full py-3.5 hover:bg-bark-dark transition-colors font-medium shadow-lifted"
            >
              Chat on WhatsApp
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="lg:col-span-3 rounded-2xl overflow-hidden shadow-soft h-[400px] lg:h-full min-h-[400px]"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3967!2d80.259783!3d6.0779352!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae1710054f6ee65%3A0x9cfbe90a9ea62167!2sKekulama%20Eco%20Cabana%20galle!5e0!3m2!1sen!2slk!4v1692000000000!5m2!1sen!2slk"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

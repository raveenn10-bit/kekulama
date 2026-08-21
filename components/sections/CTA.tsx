"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { siteData } from "@/data/siteData";

export default function CTA() {
  const { contact } = siteData;

  return (
    <section className="relative w-full">
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/cabana-trees.jpg"
          alt="Lush trees at Kekulama Eco Cabana"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-forest-dark/85"></div>
      </div>

      <div className="relative z-10 py-20 px-5 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-display text-white">
            Ready to reconnect with <span className="italic text-bark">nature</span>?
          </h2>
          <p className="text-lg text-sage-300 mt-4 max-w-lg mx-auto">
            Book your stay directly via WhatsApp for the best rates and personalized service.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
            <a
              href={`https://wa.me/${contact.whatsappRaw}`}
              target="_blank"
              rel="noreferrer"
              className="bg-bark text-white rounded-full px-8 py-3.5 hover:bg-bark-dark transition-colors font-medium shadow-lifted w-full sm:w-auto text-center"
            >
              Book via WhatsApp
            </a>
            <a
              href={`tel:${contact.phoneRaw}`}
              className="border border-white/30 text-white rounded-full px-8 py-3.5 hover:bg-white/10 transition-colors font-medium w-full sm:w-auto text-center"
            >
              Call Us
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

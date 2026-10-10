"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ChevronDown, HelpCircle, MapPin, Sparkles, PhoneCall, CheckCircle } from "lucide-react";
import { LUXURY_EASING, LUXURY_DURATION } from "@/lib/motion";

export interface FAQItem {
  question: string;
  answer: string;
  category: "Location & Travel" | "Booking & Pricing" | "Couples & Amenities";
}

export const faqs: FAQItem[] = [
  {
    question: "Where is Kekulama Eco Cabana located in Galle?",
    answer:
      "Kekulama Eco Cabana is nestled in the tranquil tea hills of Pinnaduwa, Galle (Address: 416/1, Pinnaduwa, Galle 80000, Sri Lanka). We are conveniently located just 2 minutes from the Pinnaduwa Southern Expressway exit (1.5 hours direct drive from Colombo Bandaranaike International Airport) and 12-15 minutes from the historic UNESCO World Heritage Galle Fort and Unawatuna Beach.",
    category: "Location & Travel",
  },
  {
    question: "Is Kekulama Eco Cabana suitable for honeymoons and romantic couples?",
    answer:
      "Yes, absolutely. Kekulama is designed specifically as a secluded, private romantic nature retreat for couples and honeymooners. You enjoy total privacy in a two-level handcrafted timber A-frame cabana with a master loft bedroom overlooking emerald tea hills, birdsong mornings, intimate verandah dining, and ambient evening lighting.",
    category: "Couples & Amenities",
  },
  {
    question: "What are the Day Out and Night Stay package rates in Galle?",
    answer:
      "We offer affordable luxury packages tailored for both foreign travelers and local couples:\n• Day Out (Non A/C): LKR 6,000 / day\n• Day Out (A/C): LKR 8,000 / day\n• Night Stay (Non A/C): LKR 8,000 / night\n• Night Stay (A/C): LKR 9,000 / night\nAll packages include full private cabana access, tea garden views, smart TV, hot water shower, and kitchenette facilities.",
    category: "Booking & Pricing",
  },
  {
    question: "How far is the cabana from Galle Fort, Lighthouse, and beaches?",
    answer:
      "Kekulama Eco Cabana is situated approximately 6 km from Galle Fort (approx. 12 minutes drive), 15 minutes from Unawatuna Beach, and 20 minutes from Jungle Beach and Dalawella Beach. We can easily arrange reliable tuk-tuks, private scooter rentals, or taxi transfers.",
    category: "Location & Travel",
  },
  {
    question: "What modern amenities are provided in the eco cabana?",
    answer:
      "Our cabana seamlessly combines rustic nature living with modern luxury comfort: high-speed Wi-Fi, air conditioning & ceiling fans, 45-inch Smart TV with Netflix & YouTube, JBL Bluetooth sound system, hot water rain shower with booster pump, fully equipped kitchenette with refrigerator and gas cooker, dining verandah, and fresh Ceylon tea/coffee.",
    category: "Couples & Amenities",
  },
  {
    question: "What are the check-in and check-out times?",
    answer:
      "Check-in is from 2:00 PM (14:00) and check-out is by 10:00 AM (10:00). Early check-in or late check-out can often be arranged upon request based on availability. Our hosts provide 24/7 personalized arrival assistance.",
    category: "Booking & Pricing",
  },
  {
    question: "Are traditional Sri Lankan breakfasts and meals available?",
    answer:
      "Yes. We serve authentic Ceylon home-cooked breakfasts including string hoppers, coconut sambol, fresh seasonal tropical fruits, and estate-plucked tea upon prior request. You also have full use of the private kitchenette equipped with cooker and refrigerator.",
    category: "Couples & Amenities",
  },
  {
    question: "How do I book direct for the best rate guarantee?",
    answer:
      "You can book directly with the host via WhatsApp at +94 75 665 7000 for instant date confirmation and the guaranteed lowest direct rates without booking platform commission. We also welcome reservations through Airbnb and Booking.com.",
    category: "Booking & Pricing",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="section-padding bg-[#f4f1ea] relative overflow-hidden">
      {/* Decorative botanical backdrop accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-sage-200/30 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-mint-100/40 rounded-full blur-3xl pointer-events-none -ml-32 -mb-32" />

      <div className="container-custom relative z-10">
        <SectionHeading
          badge="Frequently Asked Questions · Galle, Sri Lanka"
          title="Everything You Need to Know About Staying at Kekulama"
          subtitle="Clear answers on our location, couple packages, travel distances to Galle Fort, and luxury amenities."
        />

        <div className="max-w-3xl mx-auto mt-12 space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? "bg-white/95 border-forest/30 shadow-md shadow-forest/5"
                    : "bg-white/60 hover:bg-white/80 border-sage-200/80"
                }`}
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full px-6 py-5 sm:py-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-display font-medium text-lg sm:text-xl text-forest-dark flex items-center gap-3">
                    <span className="text-forest/60 text-sm font-mono font-normal">
                      0{index + 1}.
                    </span>
                    {faq.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 bg-forest text-white" : "bg-sage-100 text-forest"
                    }`}
                  >
                    <ChevronDown size={18} />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: LUXURY_EASING.quintOut }}
                    >
                      <div className="px-6 pb-6 pt-1 text-sage-800 text-sm sm:text-base leading-relaxed border-t border-sage-100/70 font-body whitespace-pre-line">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Local SEO Trust Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto mt-10 p-6 rounded-2xl bg-forest-dark text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-mint-400/20 text-mint-300 flex items-center justify-center">
              <MapPin size={20} />
            </div>
            <div>
              <p className="font-display text-base sm:text-lg font-medium text-white">
                Visiting Galle Soon?
              </p>
              <p className="text-xs sm:text-sm text-white/70">
                Pinnaduwa Exit · 12 Mins to Galle Fort · UNESCO Heritage & Beach Tours
              </p>
            </div>
          </div>

          <a
            href="https://wa.me/94756657000?text=Hello%20Kekulama%20Eco%20Cabana,%20I%20have%20a%20question%20about%20staying%20in%20Galle."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-mint-500 hover:bg-mint-400 text-forest-dark font-body font-semibold text-xs sm:text-sm transition-all whitespace-nowrap"
          >
            <PhoneCall size={14} />
            Ask via WhatsApp
          </a>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Users,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  Info,
  Clock,
} from "lucide-react";
import { siteData } from "@/data/siteData";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LUXURY_EASING, LUXURY_DURATION } from "@/lib/motion";

export default function RealtimeBookingTable() {
  const { packages, contact } = siteData;
  const shouldReduceMotion = useReducedMotion();

  // Real-time Booking form state
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, []);

  const [checkIn, setCheckIn] = useState<string>(todayStr);
  const [checkOut, setCheckOut] = useState<string>(tomorrowStr);
  const [guests, setGuests] = useState<number>(2);
  const [selectedPkgIndex, setSelectedPkgIndex] = useState<number>(3); // Default Bed & Breakfast

  // Calculate nights
  const nights = useMemo(() => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }, [checkIn, checkOut]);

  const currentPkg = packages[selectedPkgIndex] || packages[0];
  const priceNum = parseInt(currentPkg.price.replace(/,/g, ""), 10) || 11000;
  const totalPrice = (priceNum * (currentPkg.name.includes("Day Out") ? 1 : nights)).toLocaleString();

  // Booking.com property link with date params
  const bookingComLink = `${contact.bookingcomUrl || "https://www.booking.com/searchresults.html?ss=Kekulama+Eco+Cabana+Galle"}&checkin=${checkIn}&checkout=${checkOut}&group_adults=${guests}`;

  // WhatsApp direct booking message
  const whatsappBookingMsg = `Hello Kekulama Eco Cabana, I would like to reserve:
- Package: ${currentPkg.name}
- Check-in: ${checkIn}
- Check-out: ${checkOut} (${nights} night${nights > 1 ? "s" : ""})
- Guests: ${guests}
- Estimated Total: LKR ${totalPrice}
Please confirm availability.`;

  return (
    <section id="booking" className="section-padding bg-[#fbf9f5] relative overflow-hidden">
      {/* Background Soft Natural Tones */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-eucalyptus-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-mint-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="container-custom relative z-10">
        <SectionHeading
          badge="Live Availability & Rates"
          title="Reserve with Booking.com or"
          highlight="Direct Host"
          subtitle="Check real-time dates and compare direct WhatsApp rates with Booking.com. Guaranteed best price on direct bookings."
        />

        {/* ── REAL-TIME INTERACTIVE RESERVATION BAR ── */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: LUXURY_DURATION.medium, ease: LUXURY_EASING.quintOut }}
          className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(20,35,25,0.08)] border border-stone-200/80 mb-12 max-w-5xl mx-auto"
        >
          <div className="flex items-center justify-between gap-4 pb-5 mb-6 border-b border-stone-100 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-eyebrow text-xs uppercase tracking-[0.2em] font-semibold text-forest">
                Real-Time Availability Engine
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-sage-600 font-body">
              <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full font-medium border border-emerald-200">
                <ShieldCheck size={13} className="text-emerald-600" />
                Best Rate Direct Guarantee
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Check-in Date */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 focus-within:border-forest transition-colors">
              <label className="block font-eyebrow text-[10px] uppercase tracking-wider text-sage-500 font-semibold mb-1">
                Check-in Date
              </label>
              <div className="flex items-center gap-2">
                <CalendarIcon size={16} className="text-forest flex-shrink-0" />
                <input
                  type="date"
                  value={checkIn}
                  min={todayStr}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full bg-transparent font-body text-sm text-forest font-medium focus:outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* Check-out Date */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 focus-within:border-forest transition-colors">
              <label className="block font-eyebrow text-[10px] uppercase tracking-wider text-sage-500 font-semibold mb-1">
                Check-out Date
              </label>
              <div className="flex items-center gap-2">
                <CalendarIcon size={16} className="text-forest flex-shrink-0" />
                <input
                  type="date"
                  value={checkOut}
                  min={checkIn || todayStr}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full bg-transparent font-body text-sm text-forest font-medium focus:outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* Guests Selection */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 focus-within:border-forest transition-colors">
              <label className="block font-eyebrow text-[10px] uppercase tracking-wider text-sage-500 font-semibold mb-1">
                Guests
              </label>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-forest flex-shrink-0" />
                <select
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value, 10))}
                  className="w-full bg-transparent font-body text-sm text-forest font-medium focus:outline-none cursor-pointer"
                >
                  <option value={1}>1 Guest</option>
                  <option value={2}>2 Guests (Couple / Friends)</option>
                  <option value={3}>3 Guests</option>
                  <option value={4}>4 Guests (Family / Group)</option>
                </select>
              </div>
            </div>

            {/* Package Choice */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 focus-within:border-forest transition-colors">
              <label className="block font-eyebrow text-[10px] uppercase tracking-wider text-sage-500 font-semibold mb-1">
                Selected Plan
              </label>
              <select
                value={selectedPkgIndex}
                onChange={(e) => setSelectedPkgIndex(parseInt(e.target.value, 10))}
                className="w-full bg-transparent font-body text-sm text-forest font-medium focus:outline-none cursor-pointer"
              >
                {packages.map((pkg, idx) => (
                  <option key={pkg.name} value={idx}>
                    {pkg.name} (LKR {pkg.price})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing Calculation Summary & Dual CTA */}
          <div className="bg-gradient-to-r from-stone-50 via-eucalyptus-50/50 to-stone-50 rounded-2xl p-5 border border-stone-200/80 flex flex-col md:flex-row items-center justify-between gap-5">
            <div>
              <span className="font-eyebrow text-[10.5px] uppercase tracking-wider text-sage-600 block">
                Estimated Rate ({currentPkg.name.includes("Day Out") ? "Day Plan" : `${nights} Night${nights > 1 ? "s" : ""}`}, {guests} Guests)
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-mono text-sm uppercase font-bold text-mint-800">LKR</span>
                <span className="font-display text-3xl sm:text-4xl text-forest font-normal">
                  {totalPrice}
                </span>
                <span className="font-body text-xs text-sage-600 font-light">
                  {currentPkg.timing ? `· ${currentPkg.timing}` : "· Check-in from 2:00 PM"}
                </span>
              </div>
            </div>

            {/* Dual Booking Buttons: Booking.com + Direct WhatsApp */}
            <div className="flex items-center gap-3 w-full md:w-auto flex-wrap sm:flex-nowrap">
              {/* Official Booking.com CTA */}
              <a
                href={bookingComLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#003580] hover:bg-[#00224f] text-white font-body text-xs font-semibold uppercase tracking-[0.14em] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <div className="w-4 h-4 rounded-full bg-white text-[#003580] font-bold text-[10px] flex items-center justify-center">
                  B.
                </div>
                <span>Book on Booking.com</span>
                <ExternalLink size={13} />
              </a>

              {/* Direct WhatsApp VIP Booking */}
              <a
                href={`https://wa.me/${contact.whatsappRaw}?text=${encodeURIComponent(whatsappBookingMsg)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-forest hover:bg-forest-dark text-white font-body text-xs font-semibold uppercase tracking-[0.14em] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Book via WhatsApp</span>
                <ArrowRight size={13} />
              </a>
            </div>
          </div>
        </motion.div>

        {/* ── BOOKING.COM & LIVE PACKAGES COMPARISON TABLE ── */}
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-2xl sm:text-3xl text-forest font-normal">
              Cabana Rates & Plan Comparison
            </h3>
            <span className="font-eyebrow text-xs uppercase tracking-wider text-sage-500 hidden sm:inline-block">
              Sri Lankan Rupees (LKR)
            </span>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-stone-200/80 bg-white shadow-soft">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-stone-100/80 border-b border-stone-200 text-[11px] font-eyebrow uppercase tracking-[0.16em] text-sage-700">
                  <th className="py-4 px-5">Package / Experience</th>
                  <th className="py-4 px-4">Timing</th>
                  <th className="py-4 px-4">Direct Rate</th>
                  <th className="py-4 px-4">Booking.com</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-5 text-right">Instant Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-body text-sm">
                {packages.map((pkg, idx) => {
                  const isPopular = pkg.popular;
                  return (
                    <tr
                      key={pkg.name}
                      className={`hover:bg-stone-50/80 transition-colors ${
                        isPopular ? "bg-emerald-50/30" : ""
                      }`}
                    >
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-forest font-body">
                            {pkg.name}
                          </span>
                          {isPopular && (
                            <span className="font-eyebrow text-[9.5px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                              Top Pick
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-sage-500 block mt-0.5 line-clamp-1">
                          {pkg.features.slice(0, 2).join(" · ")}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-xs text-sage-600 whitespace-nowrap">
                        {pkg.timing || "Day / Night Access"}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-baseline gap-1 font-mono text-forest font-semibold text-sm">
                          <span className="text-[10px] text-sage-500 font-normal">LKR</span>
                          <span>{pkg.price}</span>
                        </div>
                        <span className="text-[10px] text-emerald-700 font-eyebrow uppercase tracking-wider block">
                          Direct VIP
                        </span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-xs text-[#003580] font-semibold bg-[#003580]/10 px-2.5 py-1 rounded-md">
                          <span>Listed</span>
                          <ExternalLink size={10} />
                        </span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-800 font-medium">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>Available</span>
                        </span>
                      </td>

                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <a
                          href={`https://wa.me/${contact.whatsappRaw}?text=Hello%20Kekulama%20Eco%20Cabana,%20I%20want%20to%20reserve%20the%20${encodeURIComponent(
                            pkg.name
                          )}%20package.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-forest text-white hover:bg-mint-600 transition-colors font-body text-xs font-semibold uppercase tracking-wider"
                        >
                          <span>Reserve</span>
                          <ArrowRight size={11} />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── TRUST CARDS (Booking.com, TripAdvisor, Airbnb, Google) ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 max-w-5xl mx-auto">
          {/* Booking.com Partner Card */}
          <a
            href={contact.bookingcomUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-sm hover:border-[#003580] transition-colors flex flex-col items-center text-center group"
          >
            <span className="w-8 h-8 rounded-full bg-[#003580] text-white font-bold text-sm flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              B.
            </span>
            <span className="font-body text-xs font-semibold text-forest">Booking.com</span>
            <span className="font-eyebrow text-[10px] text-sage-500 uppercase tracking-wider mt-0.5">Verified Listing</span>
          </a>

          {/* TripAdvisor 5.0 Star Card */}
          <a
            href={contact.tripadvisorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-sm hover:border-[#00AA6C] transition-colors flex flex-col items-center text-center group"
          >
            <div className="w-8 h-8 rounded-full bg-[#00AA6C] text-white flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Sparkles size={16} />
            </div>
            <span className="font-body text-xs font-semibold text-forest">TripAdvisor</span>
            <span className="font-eyebrow text-[10px] text-[#00875A] uppercase tracking-wider mt-0.5">5.0 ★ Rated</span>
          </a>

          {/* Airbnb Superhost Link */}
          <a
            href={contact.social.airbnb}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-sm hover:border-[#FF5A5F] transition-colors flex flex-col items-center text-center group"
          >
            <span className="w-8 h-8 rounded-full bg-[#FF5A5F] text-white font-bold text-sm flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              A
            </span>
            <span className="font-body text-xs font-semibold text-forest">Airbnb</span>
            <span className="font-eyebrow text-[10px] text-sage-500 uppercase tracking-wider mt-0.5">Direct Rooms</span>
          </a>

          {/* Google Maps Verified Stay */}
          <a
            href={contact.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-sm hover:border-emerald-600 transition-colors flex flex-col items-center text-center group"
          >
            <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              G
            </span>
            <span className="font-body text-xs font-semibold text-forest">Google Maps</span>
            <span className="font-eyebrow text-[10px] text-sage-500 uppercase tracking-wider mt-0.5">5.0 ★ Reviews</span>
          </a>
        </div>
      </div>
    </section>
  );
}

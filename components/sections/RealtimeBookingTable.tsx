"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  AlertTriangle,
  Lock,
  RefreshCw,
  X,
  Phone,
  Mail,
  User,
  Copy,
  Check,
} from "lucide-react";
import { siteData } from "@/data/siteData";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LUXURY_EASING, LUXURY_DURATION } from "@/lib/motion";
import { BookingEvent, isDateBooked, isRangeAvailable, getInitialBookings } from "@/lib/calendarSync";

export default function RealtimeBookingTable() {
  const { packages, contact } = siteData;
  const shouldReduceMotion = useReducedMotion();

  // Active bookings list (fetched live from API or defaults)
  const [bookings, setBookings] = useState<BookingEvent[]>([]);
  const [loadingSync, setLoadingSync] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Just now");

  // Date selection states
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => today.toISOString().split("T")[0], [today]);

  // Default to 2 days from now to avoid tomorrow's Booking.com reservation
  const defaultStartStr = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 2);
    return d.toISOString().split("T")[0];
  }, [today]);

  const defaultEndStr = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 3);
    return d.toISOString().split("T")[0];
  }, [today]);

  const [checkIn, setCheckIn] = useState<string>(defaultStartStr);
  const [checkOut, setCheckOut] = useState<string>(defaultEndStr);
  const [guests, setGuests] = useState<number>(2);
  const [selectedPkgIndex, setSelectedPkgIndex] = useState<number>(3); // Bed & Breakfast

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [bookingSuccessData, setBookingSuccessData] = useState<any | null>(null);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [copiedICal, setCopiedICal] = useState(false);

  // Fetch live availability from API on mount
  const fetchAvailability = async () => {
    setLoadingSync(true);
    try {
      const res = await fetch("/api/availability");
      const data = await res.json();
      if (data.success && data.bookings) {
        setBookings(data.bookings);
        setLastSyncTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      } else {
        setBookings(getInitialBookings());
      }
    } catch {
      setBookings(getInitialBookings());
    } finally {
      setLoadingSync(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  // Calculate nights
  const nights = useMemo(() => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }, [checkIn, checkOut]);

  // Check if selected range is available
  const isAvailable = useMemo(() => {
    return isRangeAvailable(checkIn, checkOut, bookings);
  }, [checkIn, checkOut, bookings]);

  // Find which platform caused the conflict (if any)
  const conflictReason = useMemo(() => {
    if (isAvailable) return null;
    const start = new Date(checkIn).getTime();
    const end = new Date(checkOut).getTime();

    for (const b of bookings) {
      const bStart = new Date(b.startDate).getTime();
      const bEnd = new Date(b.endDate).getTime();
      if (start < bEnd && end > bStart) {
        return b;
      }
    }
    return null;
  }, [isAvailable, checkIn, checkOut, bookings]);

  const currentPkg = packages[selectedPkgIndex] || packages[0];
  const priceNum = parseInt(currentPkg.price.replace(/,/g, ""), 10) || 11000;
  const totalPrice = (priceNum * (currentPkg.name.includes("Day Out") ? 1 : nights)).toLocaleString();

  // Booking.com property link with date params
  const bookingComLink = `${contact.bookingcomUrl || "https://www.booking.com/searchresults.html?ss=Kekulama+Eco+Cabana+Galle"}&checkin=${checkIn}&checkout=${checkOut}&group_adults=${guests}`;

  // Handle direct booking submission
  const handleConfirmReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestPhone.trim()) return;

    setBookingSubmitting(true);
    try {
      const res = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: checkIn,
          endDate: checkOut,
          guestName,
          guestPhone,
          guestEmail,
          packagePlan: currentPkg.name,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBookingSuccessData(data.booking);
        if (data.bookings) {
          setBookings(data.bookings);
        }
      } else {
        alert(data.error || "Unable to complete reservation.");
      }
    } catch {
      alert("Network error while placing reservation.");
    } finally {
      setBookingSubmitting(false);
    }
  };

  // Calendar matrix generator for current month
  const calendarDays = useMemo(() => {
    const days = [];
    const currYear = today.getFullYear();
    const currMonth = today.getMonth();

    // Days in current month
    const totalDays = new Date(currYear, currMonth + 1, 0).getDate();

    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(currYear, currMonth, d);
      const dateStr = dateObj.toISOString().split("T")[0];
      const isPast = dateObj.getTime() < new Date(todayStr).getTime();
      const status = isDateBooked(dateStr, bookings);

      days.push({
        dayNum: d,
        dateStr,
        isPast,
        isBooked: status.booked,
        source: status.source,
        summary: status.summary,
        isToday: dateStr === todayStr,
        isSelected: dateStr >= checkIn && dateStr < checkOut,
      });
    }

    return days;
  }, [today, todayStr, bookings, checkIn, checkOut]);

  const currentMonthName = today.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const copyICalUrl = () => {
    const url = `${window.location.origin}/api/calendar.ics`;
    navigator.clipboard.writeText(url);
    setCopiedICal(true);
    setTimeout(() => setCopiedICal(false), 2500);
  };

  return (
    <section id="booking" className="section-padding bg-[#fbf9f5] relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-eucalyptus-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-mint-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="container-custom relative z-10">
        <SectionHeading
          badge="Live Multi-Channel Sync"
          title="Real-Time Availability &"
          highlight="Instant Booking"
          subtitle="Direct 2-way calendar sync with Booking.com and Airbnb. Booked dates on any platform are locked in real-time."
        />

        {/* ── CHANNEL SYNC STATUS STRIP ── */}
        <div className="max-w-5xl mx-auto -mt-6 mb-8 flex items-center justify-between gap-4 flex-wrap bg-white p-4 rounded-2xl border border-stone-200 shadow-sm text-xs font-body">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1.5 font-semibold text-forest">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Live 2-Way Sync Active:
            </span>
            <span className="inline-flex items-center gap-1 text-[#003580] bg-[#003580]/10 px-2.5 py-0.5 rounded-md font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#003580]" />
              Booking.com
            </span>
            <span className="inline-flex items-center gap-1 text-[#FF5A5F] bg-[#FF5A5F]/10 px-2.5 py-0.5 rounded-md font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A5F]" />
              Airbnb
            </span>
            <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              Direct Website
            </span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sage-500">Synced: {lastSyncTime}</span>
            <button
              onClick={fetchAvailability}
              disabled={loadingSync}
              className="p-1.5 rounded-lg text-sage-600 hover:text-forest hover:bg-stone-100 transition-all cursor-pointer"
              title="Refresh availability"
            >
              <RefreshCw size={14} className={loadingSync ? "animate-spin text-mint-600" : ""} />
            </button>
          </div>
        </div>

        {/* ── REAL-TIME INTERACTIVE RESERVATION ENGINE ── */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: LUXURY_DURATION.medium, ease: LUXURY_EASING.quintOut }}
          className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(20,35,25,0.08)] border border-stone-200/80 mb-12 max-w-5xl mx-auto"
        >
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

          {/* Conflict Alert (if booked by Booking.com, Airbnb, etc.) */}
          {!isAvailable && conflictReason && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3"
            >
              <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">
                  Selected dates are unavailable ({conflictReason.startDate} to {conflictReason.endDate})
                </h4>
                <p className="text-xs text-red-700 mt-0.5">
                  This period is already booked via <strong className="capitalize">{conflictReason.source}</strong> ({conflictReason.summary}). Please select alternative dates on the calendar below.
                </p>
              </div>
            </motion.div>
          )}

          {/* Pricing Calculation Summary & Actions */}
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

            {/* Booking Actions */}
            <div className="flex items-center gap-3 w-full md:w-auto flex-wrap sm:flex-nowrap">
              {/* Official Booking.com CTA */}
              <a
                href={bookingComLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-3.5 rounded-full bg-[#003580] hover:bg-[#00224f] text-white font-body text-xs font-semibold uppercase tracking-[0.14em] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <div className="w-4 h-4 rounded-full bg-white text-[#003580] font-bold text-[10px] flex items-center justify-center">
                  B.
                </div>
                <span>Booking.com</span>
                <ExternalLink size={13} />
              </a>

              {/* Instant Book Direct on Website */}
              <button
                type="button"
                onClick={() => {
                  if (isAvailable) {
                    setIsBookingModalOpen(true);
                  } else {
                    alert("Selected dates are already booked. Please choose available dates.");
                  }
                }}
                disabled={!isAvailable}
                className={`w-full sm:w-auto px-6 py-3.5 rounded-full font-body text-xs font-semibold uppercase tracking-[0.14em] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                  isAvailable
                    ? "bg-forest hover:bg-forest-dark text-white active:scale-98"
                    : "bg-stone-300 text-stone-500 cursor-not-allowed"
                }`}
              >
                <Lock size={13} />
                <span>{isAvailable ? "Instant Book Direct" : "Dates Booked"}</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── LIVE INTERACTIVE MONTHLY AVAILABILITY CALENDAR ── */}
        <div className="max-w-5xl mx-auto mb-12 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-soft">
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <div>
              <span className="font-eyebrow text-xs uppercase tracking-wider text-sage-500">
                Monthly Live Calendar
              </span>
              <h3 className="font-display text-2xl sm:text-3xl text-forest font-normal">
                {currentMonthName} Availability
              </h3>
            </div>

            {/* Calendar Legend */}
            <div className="flex items-center gap-4 text-xs font-body flex-wrap">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <span className="w-3 h-3 rounded-md bg-emerald-100 border border-emerald-300 inline-block" />
                Available
              </span>
              <span className="flex items-center gap-1.5 text-[#003580]">
                <span className="w-3 h-3 rounded-md bg-blue-100 border border-blue-400 inline-block" />
                Booking.com
              </span>
              <span className="flex items-center gap-1.5 text-[#FF5A5F]">
                <span className="w-3 h-3 rounded-md bg-red-100 border border-red-400 inline-block" />
                Airbnb
              </span>
              <span className="flex items-center gap-1.5 text-purple-700">
                <span className="w-3 h-3 rounded-md bg-purple-100 border border-purple-400 inline-block" />
                Direct Booked
              </span>
            </div>
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-2 sm:gap-3 text-center">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="font-eyebrow text-[11px] uppercase tracking-wider text-sage-500 py-1 font-semibold">
                {day}
              </div>
            ))}

            {calendarDays.map((day) => {
              const isBCom = day.source === "booking.com";
              const isAbnb = day.source === "airbnb";
              const isDirect = day.source === "direct";

              let bgClass = "bg-stone-50 hover:bg-emerald-50 border-stone-200 text-forest cursor-pointer";
              let badgeText = "";

              if (day.isPast) {
                bgClass = "bg-stone-100/50 border-stone-100 text-stone-400 cursor-not-allowed";
              } else if (day.isBooked) {
                if (isBCom) {
                  bgClass = "bg-blue-50 border-blue-300 text-[#003580] cursor-not-allowed";
                  badgeText = "Booking.com";
                } else if (isAbnb) {
                  bgClass = "bg-red-50 border-red-300 text-[#FF5A5F] cursor-not-allowed";
                  badgeText = "Airbnb";
                } else {
                  bgClass = "bg-purple-50 border-purple-300 text-purple-800 cursor-not-allowed";
                  badgeText = "Reserved";
                }
              } else if (day.isSelected) {
                bgClass = "bg-emerald-600 text-white border-emerald-700 shadow-sm";
              }

              return (
                <div
                  key={day.dayNum}
                  onClick={() => {
                    if (!day.isPast && !day.isBooked) {
                      setCheckIn(day.dateStr);
                      const nextDay = new Date(day.dateStr);
                      nextDay.setDate(nextDay.getDate() + 1);
                      setCheckOut(nextDay.toISOString().split("T")[0]);
                    }
                  }}
                  className={`min-h-[64px] sm:min-h-[74px] p-2 rounded-2xl border flex flex-col justify-between transition-all ${bgClass}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs sm:text-sm font-semibold">
                      {day.dayNum}
                    </span>
                    {day.isToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-mint-500" title="Today" />
                    )}
                  </div>

                  {badgeText ? (
                    <span className="text-[9px] font-eyebrow uppercase tracking-tight font-bold py-0.5 px-1 rounded truncate block">
                      {badgeText}
                    </span>
                  ) : !day.isPast ? (
                    <span className="text-[9px] font-body text-emerald-700 sm:block hidden">
                      Available
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 2-WAY ICAL SYNC EXPORT FOR BOOKING.COM & AIRBNB ── */}
        <div className="max-w-5xl mx-auto bg-stone-100/90 rounded-3xl p-6 sm:p-7 border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <RefreshCw size={15} className="text-forest" />
              <h4 className="font-display text-lg text-forest font-semibold">
                Booking.com & Airbnb 2-Way Calendar Sync URL
              </h4>
            </div>
            <p className="text-xs text-sage-600 font-body mt-1 max-w-xl">
              Paste this standard iCal feed URL into your <strong>Booking.com Extranet (Calendar Sync)</strong> and <strong>Airbnb (Import Calendar)</strong> so reservations made on this site automatically block Booking.com & Airbnb!
            </p>
          </div>

          <button
            onClick={copyICalUrl}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-forest text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-colors flex-shrink-0 cursor-pointer"
          >
            {copiedICal ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span>{copiedICal ? "iCal URL Copied!" : "Copy iCal Feed URL"}</span>
          </button>
        </div>
      </div>

      {/* ── INSTANT WEBSITE RESERVATION MODAL ── */}
      <AnimatePresence>
        {isBookingModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            onClick={() => {
              if (!bookingSubmitting) setIsBookingModalOpen(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-200 relative overflow-hidden"
            >
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              {!bookingSuccessData ? (
                <>
                  <span className="font-eyebrow text-xs uppercase tracking-[0.2em] text-mint-700 font-semibold mb-1 block">
                    Instant Direct Reservation
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl text-forest font-normal mb-4">
                    Confirm Your Cabana Stay
                  </h3>

                  {/* Summary Box */}
                  <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 mb-5 text-xs font-body space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-sage-600">Plan:</span>
                      <strong className="text-forest">{currentPkg.name}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sage-600">Dates:</span>
                      <span className="text-forest font-mono">{checkIn} → {checkOut} ({nights} night{nights > 1 ? "s" : ""})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sage-600">Guests:</span>
                      <span className="text-forest">{guests} Guests</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-stone-200 text-sm font-semibold">
                      <span>Total (LKR):</span>
                      <span className="text-emerald-800 font-mono">Rs {totalPrice}</span>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleConfirmReservation} className="space-y-4 font-body">
                    <div>
                      <label className="block text-xs font-semibold text-forest mb-1">
                        Full Name *
                      </label>
                      <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-stone-300 focus-within:border-forest bg-white">
                        <User size={16} className="text-stone-400" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. Liam Smith / Kasun Perera"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          className="w-full text-sm focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-forest mb-1">
                        Phone / WhatsApp Number *
                      </label>
                      <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-stone-300 focus-within:border-forest bg-white">
                        <Phone size={16} className="text-stone-400" />
                        <input
                          type="tel"
                          required
                          placeholder="e.g. +94 75 665 7000 / +44 7911 123456"
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value)}
                          className="w-full text-sm focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-forest mb-1">
                        Email Address (Optional)
                      </label>
                      <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-stone-300 focus-within:border-forest bg-white">
                        <Mail size={16} className="text-stone-400" />
                        <input
                          type="email"
                          placeholder="e.g. guest@example.com"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          className="w-full text-sm focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={bookingSubmitting}
                      className="w-full py-4 rounded-full bg-forest hover:bg-forest-dark text-white font-semibold text-xs uppercase tracking-widest transition-all shadow-md mt-2 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {bookingSubmitting ? (
                        <span>Locking Dates Across Channels...</span>
                      ) : (
                        <>
                          <Lock size={14} />
                          <span>Confirm & Lock Dates Across Sync</span>
                        </>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                /* Success Confirmation */
                <div className="text-center py-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} />
                  </div>
                  <span className="font-eyebrow text-xs uppercase tracking-wider text-emerald-700 font-semibold block">
                    Reservation Confirmed
                  </span>
                  <h3 className="font-display text-3xl text-forest font-normal mt-1 mb-2">
                    Booking Reference #{bookingSuccessData.id}
                  </h3>
                  <p className="font-body text-xs text-sage-600 max-w-sm mx-auto mb-6">
                    Dates <strong>{bookingSuccessData.startDate} to {bookingSuccessData.endDate}</strong> are now locked on the calendar and synced across Booking.com and Airbnb.
                  </p>

                  {bookingSuccessData.registrationToken && (
                    <a
                      href={`/guest/register?token=${bookingSuccessData.registrationToken}`}
                      className="w-full py-3.5 rounded-full bg-forest hover:bg-forest-dark text-white font-body font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md mb-2.5 transition-all"
                    >
                      <User size={14} />
                      <span>Complete Guest Registration (NIC / Passport)</span>
                    </a>
                  )}

                  <a
                    href={`https://wa.me/${contact.whatsappRaw}?text=${encodeURIComponent(
                      `Hello Kekulama Eco Cabana, I just placed reservation #${bookingSuccessData.id} for ${guestName} (${bookingSuccessData.startDate} to ${bookingSuccessData.endDate}). Please confirm details.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3.5 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-body font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg mb-3"
                  >
                    <span>Finalize with Host via WhatsApp</span>
                    <ExternalLink size={14} />
                  </a>

                  <button
                    onClick={() => {
                      setIsBookingModalOpen(false);
                      setBookingSuccessData(null);
                    }}
                    className="text-xs text-sage-500 hover:text-forest underline cursor-pointer"
                  >
                    Close & View Calendar
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

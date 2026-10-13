"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Users,
  CheckCircle2,
  ShieldCheck,
  Upload,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Info,
  Clock,
  AlertCircle,
  FileText,
  Lock,
  Phone,
  Mail,
  Home,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Eye,
  FileCheck2,
} from "lucide-react";
import { siteData } from "@/data/siteData";
import { LUXURY_EASING } from "@/lib/motion";

interface UploadedDoc {
  documentId: string;
  docType: "nic_front" | "nic_back" | "passport_page";
  fileName: string;
  fileSize: number;
}

const PACKAGE_OPTIONS = [
  {
    name: "Bed & Breakfast (B/B)",
    rateLkr: 11000,
    tag: "Most Popular",
    desc: "Overnight A/C stay + authentic Sri Lankan breakfast + tea estate sunrise tour",
  },
  {
    name: "Half Board (H/B)",
    rateLkr: 13000,
    tag: "Recommended",
    desc: "A/C stay + gourmet breakfast + traditional dinner under tropical stars",
  },
  {
    name: "Full Board (F/B)",
    rateLkr: 15000,
    tag: "All Inclusive",
    desc: "Full luxury experience with daily breakfast, lunch, and dinner included",
  },
  {
    name: "Night Stay — A/C",
    rateLkr: 9000,
    tag: "Room Only",
    desc: "Overnight air-conditioned stay with hot shower, kitchenette, and smart amenities",
  },
  {
    name: "Night Stay — Non A/C",
    rateLkr: 8000,
    tag: "Eco Nature",
    desc: "Overnight timber loft stay with refreshing natural mountain breezes",
  },
  {
    name: "Day Out — A/C",
    rateLkr: 8000,
    tag: "Day Use",
    desc: "Full daytime cabana access (10:00 AM - 5:00 PM) with A/C & smart TV",
  },
  {
    name: "Day Out — Non A/C",
    rateLkr: 6000,
    tag: "Day Retreat",
    desc: "Day room access, verandah views, tea garden strolls, and kitchenette use",
  },
];

const CURRENCY_RATES = {
  LKR: { symbol: "LKR ", rate: 1 },
  USD: { symbol: "$", rate: 0.0033 },
  EUR: { symbol: "€", rate: 0.0031 },
};

function DirectBookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [step, setStep] = useState<number>(1);
  const [currency, setCurrency] = useState<"LKR" | "USD" | "EUR">("LKR");

  // Step 1: Stay & Room
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, []);

  const [checkIn, setCheckIn] = useState<string>(searchParams.get("checkIn") || todayStr);
  const [checkOut, setCheckOut] = useState<string>(searchParams.get("checkOut") || tomorrowStr);
  const [adults, setAdults] = useState<number>(() => {
    const parsed = Number(searchParams.get("guests") || searchParams.get("adults"));
    return parsed > 0 && parsed <= 6 ? parsed : 2;
  });
  const [children, setChildren] = useState<number>(0);
  const [packagePlan, setPackagePlan] = useState<string>(
    searchParams.get("package") || "Bed & Breakfast (B/B)"
  );

  // Availability state
  const [lockedDates, setLockedDates] = useState<string[]>([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [dateConflictError, setDateConflictError] = useState<string | null>(null);

  // Step 2: Guest Details
  const [guestName, setGuestName] = useState<string>("");
  const [guestEmail, setGuestEmail] = useState<string>("");
  const [guestPhone, setGuestPhone] = useState<string>("+94 ");
  const [country, setCountry] = useState<string>("Sri Lanka");
  const [specialRequests, setSpecialRequests] = useState<string>("");

  // Step 3: Identity Verification
  const [guestCategory, setGuestCategory] = useState<"sri_lankan" | "international">("sri_lankan");
  const [idNumber, setIdNumber] = useState<string>("");
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Step 4: Submission
  const [termsAgreed, setTermsAgreed] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Step 5: Confirmed Response
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);

  // Fetch occupied dates on mount
  useEffect(() => {
    async function loadAvailability() {
      setCheckingAvailability(true);
      try {
        const res = await fetch("/api/availability");
        const data = await res.json();
        if (data.success && Array.isArray(data.lockedDates)) {
          setLockedDates(data.lockedDates);
        }
      } catch (err) {
        console.warn("Failed to load availability:", err);
      } finally {
        setCheckingAvailability(false);
      }
    }
    loadAvailability();
  }, []);

  // Calculate stay nights
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [checkIn, checkOut]);

  // Selected package details
  const selectedPkg = useMemo(() => {
    return PACKAGE_OPTIONS.find((p) => p.name === packagePlan) || PACKAGE_OPTIONS[0];
  }, [packagePlan]);

  const totalAmountLkr = useMemo(() => {
    return (selectedPkg?.rateLkr || 11000) * nights;
  }, [selectedPkg, nights]);

  // Verify whether selected range overlaps with locked nights
  useEffect(() => {
    if (!checkIn || !checkOut || checkIn >= checkOut) {
      setDateConflictError("Check-out date must be after check-in date.");
      return;
    }

    const cur = new Date(checkIn);
    const end = new Date(checkOut);
    let conflict = false;

    while (cur < end) {
      const curStr = cur.toISOString().split("T")[0];
      if (lockedDates.includes(curStr)) {
        conflict = true;
        break;
      }
      cur.setDate(cur.getDate() + 1);
    }

    if (conflict) {
      setDateConflictError(
        "One or more nights within your selected dates are already booked. Please choose alternative dates."
      );
    } else {
      setDateConflictError(null);
    }
  }, [checkIn, checkOut, lockedDates]);

  // Format prices according to currency toggle
  const formatPrice = (lkrAmount: number) => {
    const curConfig = CURRENCY_RATES[currency];
    const converted = lkrAmount * curConfig.rate;
    if (currency === "LKR") {
      return `${curConfig.symbol}${Math.round(converted).toLocaleString()}`;
    }
    return `${curConfig.symbol}${Math.round(converted)}`;
  };

  // Upload handler for NIC / Passport
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    docType: "nic_front" | "nic_back" | "passport_page"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File exceeds maximum allowed size of 5 MB.");
      return;
    }

    setUploadError(null);
    setUploadingDoc(docType);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("docType", docType);
      formData.append("intent", "direct_booking");

      const res = await fetch("/api/guest/documents/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload document");
      }

      setUploadedDocs((prev) => [
        ...prev.filter((d) => d.docType !== docType),
        {
          documentId: data.documentId,
          docType,
          fileName: file.name,
          fileSize: file.size,
        },
      ]);
    } catch (err: any) {
      setUploadError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploadingDoc(null);
    }
  };

  // Submit complete booking
  const handleFinalSubmit = async () => {
    if (!termsAgreed) {
      setSubmitError("Please accept the terms and conditions and privacy notice to complete your booking.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        checkIn,
        checkOut,
        guestName,
        guestEmail,
        guestPhone,
        country,
        adults,
        children,
        packagePlan,
        specialRequests,
        totalAmount: totalAmountLkr,
        source: "website",
        idType: guestCategory === "sri_lankan" ? "nic" : "passport",
        idNumber,
        idDocumentIds: uploadedDocs.map((d) => d.documentId),
      };

      const res = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Unable to reserve booking.");
      }

      setConfirmedBooking(data.booking);
      setStep(5);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setSubmitError(err.message || "Failed to place booking. Please check details or contact us.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1611] text-white pt-24 pb-20 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-mint-500/15 via-emerald-600/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-eyebrow uppercase tracking-[0.25em] text-mint-300 hover:text-white transition-colors mb-3"
          >
            <ArrowLeft size={13} />
            <span>Return to Kekulama Home</span>
          </Link>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal tracking-wide text-white">
            Reserve Your Sanctuary
          </h1>
          <p className="font-body text-xs sm:text-sm text-sage-300 max-w-lg mx-auto mt-2">
            Direct online booking for our exclusive A-Frame Eco Cabana in Pinnaduwa, Galle. Enjoy best-rate guarantee and personal host coordination.
          </p>

          {/* Currency Toggle */}
          <div className="inline-flex items-center bg-white/5 border border-white/10 rounded-full p-1 mt-4">
            {(["LKR", "USD", "EUR"] as const).map((curr) => (
              <button
                key={curr}
                onClick={() => setCurrency(curr)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                  currency === curr
                    ? "bg-mint-500 text-forest-dark font-bold shadow-sm"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {curr}
              </button>
            ))}
          </div>
        </div>

        {/* Step Progress Bar */}
        {step < 5 && (
          <div className="mb-8">
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              {[
                { s: 1, title: "Stay & Dates" },
                { s: 2, title: "Guest Details" },
                { s: 3, title: "ID Verification" },
                { s: 4, title: "Review & Confirm" },
              ].map(({ s, title }) => (
                <div
                  key={s}
                  onClick={() => s < step && setStep(s)}
                  className={`flex flex-col items-center gap-1.5 py-2 px-1 rounded-xl transition-all ${
                    s < step ? "cursor-pointer text-mint-300" : ""
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all ${
                      step === s
                        ? "bg-mint-400 text-forest-dark ring-4 ring-mint-400/20"
                        : step > s
                        ? "bg-mint-700 text-white"
                        : "bg-white/10 text-white/50"
                    }`}
                  >
                    {step > s ? <Check size={14} /> : `0${s}`}
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs font-medium uppercase tracking-wider ${
                      step === s ? "text-white font-bold" : "text-white/50"
                    }`}
                  >
                    {title}
                  </span>
                </div>
              ))}
            </div>
            <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden mt-2">
              <div
                className="bg-gradient-to-r from-mint-500 to-mint-300 h-full transition-all duration-500"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Step 1: Stay & Room Selection */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Cabana Showcase Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 backdrop-blur-md">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-5 relative h-52 sm:h-60 rounded-xl overflow-hidden border border-white/10">
                  <Image
                    src="/images/cabana-front.jpg"
                    alt="Kekulama A-Frame Eco Cabana"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute top-2.5 left-2.5 bg-forest-dark/85 backdrop-blur-sm border border-mint-300/40 px-2.5 py-1 rounded-full text-[10px] font-bold text-mint-300 uppercase tracking-widest">
                    Single Exclusive Unit
                  </div>
                </div>

                <div className="md:col-span-7 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-eyebrow text-xs uppercase tracking-widest text-mint-300">
                      Accommodation
                    </span>
                    <span className="text-white/30">·</span>
                    <span className="text-xs text-sage-300">cabana-01</span>
                  </div>

                  <h3 className="font-display text-2xl sm:text-3xl font-normal text-white">
                    A-Frame Eco Cabana
                  </h3>

                  <p className="text-xs text-sage-200 leading-relaxed font-body">
                    Dual-level timber cabana nestled in lush private tea estates. Includes private verandah, loft bedroom with panoramic nature vistas, kitchenette, smart entertainment, and hot shower.
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-white/80 font-body">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-mint-400" />
                      <span>Loft Bedroom</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-mint-400" />
                      <span>Hot Water Booster</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-mint-400" />
                      <span>Private Kitchenette</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-mint-400" />
                      <span>Tea Garden Verandah</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dates & Occupancy Form */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 backdrop-blur-md space-y-5">
              <h4 className="font-display text-lg text-white font-normal border-b border-white/10 pb-3">
                Select Your Stay Dates & Guests
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-mint-200 uppercase tracking-wider mb-1.5">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/20 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-mint-400"
                  />
                  <span className="text-[10px] text-white/50 mt-1 block">Check-in from 2:00 PM</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-mint-200 uppercase tracking-wider mb-1.5">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    min={checkIn || todayStr}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/20 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-mint-400"
                  />
                  <span className="text-[10px] text-white/50 mt-1 block">Check-out by 11:00 AM</span>
                </div>
              </div>

              {dateConflictError && (
                <div className="p-3.5 bg-rose-950/60 border border-rose-500/50 rounded-xl text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="text-rose-400 shrink-0" />
                  <span>{dateConflictError}</span>
                </div>
              )}

              {/* Occupancy Selectors */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-mint-200 uppercase tracking-wider mb-1.5">
                    Adults (Ages 13+)
                  </label>
                  <select
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/20 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-mint-400"
                  >
                    {[1, 2, 3, 4].map((num) => (
                      <option key={num} value={num} className="bg-slate-900 text-white">
                        {num} {num === 1 ? "Adult" : "Adults"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-mint-200 uppercase tracking-wider mb-1.5">
                    Children (Ages 0-12)
                  </label>
                  <select
                    value={children}
                    onChange={(e) => setChildren(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/20 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-mint-400"
                  >
                    {[0, 1, 2].map((num) => (
                      <option key={num} value={num} className="bg-slate-900 text-white">
                        {num} {num === 1 ? "Child" : "Children"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Package Plan Selection */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 backdrop-blur-md space-y-4">
              <h4 className="font-display text-lg text-white font-normal border-b border-white/10 pb-3 flex items-center justify-between">
                <span>Choose Package Plan</span>
                <span className="text-xs text-mint-300 font-mono font-semibold">
                  {nights} Night(s) Stay
                </span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PACKAGE_OPTIONS.map((pkg) => {
                  const isSelected = packagePlan === pkg.name;
                  return (
                    <div
                      key={pkg.name}
                      onClick={() => setPackagePlan(pkg.name)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                        isSelected
                          ? "bg-mint-500/15 border-mint-400 ring-2 ring-mint-400/30"
                          : "bg-black/30 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-white">{pkg.name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-mint-300">
                          {pkg.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-sage-300 leading-relaxed mb-3">{pkg.desc}</p>
                      <div className="flex items-baseline justify-between pt-2 border-t border-white/5">
                        <span className="text-[10px] text-white/50 uppercase">Rate per night</span>
                        <span className="font-mono text-sm font-bold text-mint-300">
                          {formatPrice(pkg.rateLkr)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total Estimate & Step 1 Action */}
            <div className="bg-gradient-to-r from-mint-950/60 to-forest-dark border border-mint-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-mint-200 block">Calculated Total for {nights} Night(s):</span>
                <span className="font-display text-2xl sm:text-3xl font-bold text-mint-300">
                  {formatPrice(totalAmountLkr)}
                </span>
                <span className="text-[11px] text-sage-300 block">
                  Pay upon arrival. Zero upfront card booking fee.
                </span>
              </div>

              <button
                disabled={Boolean(dateConflictError)}
                onClick={() => {
                  if (!dateConflictError) setStep(2);
                }}
                className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-mint-500 to-mint-600 hover:from-mint-400 hover:to-mint-500 text-forest-dark font-bold text-xs uppercase tracking-wider rounded-full shadow-glow flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                <span>Continue to Guest Details</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Guest Information */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 backdrop-blur-md space-y-4">
              <h4 className="font-display text-lg text-white font-normal border-b border-white/10 pb-3">
                Guest Contact Information
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-mint-200 uppercase tracking-wider mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Priyantha Jayasuriya"
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/20 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-mint-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-mint-200 uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="e.g. guest@example.com"
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/20 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-mint-400"
                  />
                  <span className="text-[10px] text-white/50 mt-1 block">
                    Your booking reference and stay details will be sent here.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-mint-200 uppercase tracking-wider mb-1.5">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+94 77 123 4567"
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/20 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-mint-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-mint-200 uppercase tracking-wider mb-1.5">
                    Country of Residence
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Sri Lanka, United Kingdom, Germany..."
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/20 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-mint-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-mint-200 uppercase tracking-wider mb-1.5">
                  Special Requests or Dietary Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g., Honeymoon arrangement, vegetarian breakfast preferences, approximate arrival time..."
                  className="w-full px-4 py-2.5 bg-black/40 border border-white/20 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-mint-400"
                />
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-full border border-white/20 hover:bg-white/10 text-xs font-semibold text-white/80 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>

              <button
                disabled={!guestName.trim() || !guestEmail.trim() || guestPhone.length < 9}
                onClick={() => setStep(3)}
                className="px-7 py-3 bg-gradient-to-r from-mint-500 to-mint-600 hover:from-mint-400 hover:to-mint-500 text-forest-dark font-bold text-xs uppercase tracking-wider rounded-full shadow-glow flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                <span>Continue to Identity Verification</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Identity Verification */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Privacy & Security Guarantee Banner */}
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex items-start gap-3">
              <ShieldCheck size={20} className="text-mint-400 shrink-0 mt-0.5" />
              <div className="text-xs text-sage-200 leading-relaxed">
                <span className="font-bold text-white block">Sri Lankan Tourism & Guest Safety Regulation:</span>
                Under local hospitality compliance, guest identification is collected for safety and rapid check-in checkouts. Your documents are encrypted via military-grade AES-256-GCM and stored in a private cloud vault with strict owner-only access.
              </div>
            </div>

            {/* Resident Type Switcher */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 backdrop-blur-md space-y-5">
              <h4 className="font-display text-lg text-white font-normal border-b border-white/10 pb-3">
                Select Identification Type
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setGuestCategory("sri_lankan")}
                  className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                    guestCategory === "sri_lankan"
                      ? "bg-mint-500/15 border-mint-400 ring-2 ring-mint-400/30 text-white font-bold"
                      : "bg-black/30 border-white/10 text-white/70 hover:border-white/20"
                  }`}
                >
                  <span className="block text-sm">Sri Lankan Citizen</span>
                  <span className="text-[10px] text-mint-300 uppercase tracking-wider mt-0.5 block">
                    National Identity Card (NIC)
                  </span>
                </div>

                <div
                  onClick={() => setGuestCategory("international")}
                  className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                    guestCategory === "international"
                      ? "bg-mint-500/15 border-mint-400 ring-2 ring-mint-400/30 text-white font-bold"
                      : "bg-black/30 border-white/10 text-white/70 hover:border-white/20"
                  }`}
                >
                  <span className="block text-sm">International Guest</span>
                  <span className="text-[10px] text-mint-300 uppercase tracking-wider mt-0.5 block">
                    Passport Photo Page
                  </span>
                </div>
              </div>

              {/* ID Number Field */}
              <div>
                <label className="block text-xs font-semibold text-mint-200 uppercase tracking-wider mb-1.5">
                  {guestCategory === "sri_lankan" ? "NIC Number" : "Passport Number"} (Optional if uploading image)
                </label>
                <input
                  type="text"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder={guestCategory === "sri_lankan" ? "e.g. 199012345678 or 901234567V" : "e.g. N1234567"}
                  className="w-full px-4 py-2.5 bg-black/40 border border-white/20 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-mint-400"
                />
              </div>

              {/* Document Upload Area */}
              <div className="space-y-4 pt-2">
                <div className="text-xs font-semibold text-white/90">
                  Upload ID Photo or Scan (JPEG, PNG, WebP or PDF · Max 5MB):
                </div>

                {uploadError && (
                  <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-200 text-xs flex items-center gap-2">
                    <AlertCircle size={15} className="text-rose-400 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {guestCategory === "sri_lankan" ? (
                    <>
                      {/* NIC Front */}
                      <div className="p-4 bg-black/40 border border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center text-center space-y-2">
                        <Upload size={20} className="text-mint-400" />
                        <span className="text-xs font-semibold text-white">NIC Front Side</span>
                        {uploadedDocs.find((d) => d.docType === "nic_front") ? (
                          <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-bold">
                            <CheckCircle2 size={13} /> Uploaded & Encrypted
                          </span>
                        ) : (
                          <label className="inline-block px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold cursor-pointer transition-all">
                            {uploadingDoc === "nic_front" ? (
                              <RefreshCw size={12} className="animate-spin inline mr-1" />
                            ) : null}
                            <span>{uploadingDoc === "nic_front" ? "Encrypting..." : "Select File"}</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,application/pdf"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, "nic_front")}
                              disabled={uploadingDoc !== null}
                            />
                          </label>
                        )}
                      </div>

                      {/* NIC Back */}
                      <div className="p-4 bg-black/40 border border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center text-center space-y-2">
                        <Upload size={20} className="text-mint-400" />
                        <span className="text-xs font-semibold text-white">NIC Back Side</span>
                        {uploadedDocs.find((d) => d.docType === "nic_back") ? (
                          <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-bold">
                            <CheckCircle2 size={13} /> Uploaded & Encrypted
                          </span>
                        ) : (
                          <label className="inline-block px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold cursor-pointer transition-all">
                            {uploadingDoc === "nic_back" ? (
                              <RefreshCw size={12} className="animate-spin inline mr-1" />
                            ) : null}
                            <span>{uploadingDoc === "nic_back" ? "Encrypting..." : "Select File"}</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,application/pdf"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, "nic_back")}
                              disabled={uploadingDoc !== null}
                            />
                          </label>
                        )}
                      </div>
                    </>
                  ) : (
                    /* Passport Page */
                    <div className="sm:col-span-2 p-5 bg-black/40 border border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center text-center space-y-2">
                      <Upload size={22} className="text-mint-400" />
                      <span className="text-xs font-semibold text-white">Passport Photo Page</span>
                      <span className="text-[11px] text-white/50">Clear image of your identification and photo page</span>
                      {uploadedDocs.find((d) => d.docType === "passport_page") ? (
                        <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-bold">
                          <CheckCircle2 size={14} /> Passport Page Securely Encrypted
                        </span>
                      ) : (
                        <label className="inline-block px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold cursor-pointer transition-all mt-1">
                          {uploadingDoc === "passport_page" ? (
                            <RefreshCw size={13} className="animate-spin inline mr-1" />
                          ) : null}
                          <span>{uploadingDoc === "passport_page" ? "Encrypting & Storing..." : "Choose Passport File"}</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,application/pdf"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, "passport_page")}
                            disabled={uploadingDoc !== null}
                          />
                        </label>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-white/40 italic">
                  Tip: You can also choose to complete ID verification at arrival or via your registration portal link.
                </div>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-full border border-white/20 hover:bg-white/10 text-xs font-semibold text-white/80 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>

              <button
                onClick={() => setStep(4)}
                className="px-7 py-3 bg-gradient-to-r from-mint-500 to-mint-600 hover:from-mint-400 hover:to-mint-500 text-forest-dark font-bold text-xs uppercase tracking-wider rounded-full shadow-glow flex items-center gap-2 cursor-pointer transition-all"
              >
                <span>Review Booking & Pricing</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Review Booking & Pricing */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 backdrop-blur-md space-y-5">
              <h4 className="font-display text-lg text-white font-normal border-b border-white/10 pb-3 flex items-center justify-between">
                <span>Summary of Your Reservation</span>
                <span className="text-xs text-mint-300 font-mono">Step 4 of 4</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-body">
                <div className="p-4 bg-black/30 rounded-xl space-y-2 border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-mint-200 tracking-wider block">
                    Stay Details
                  </span>
                  <div>
                    <span className="text-white/50 block">Accommodation:</span>
                    <strong className="text-white text-sm">A-Frame Eco Cabana (cabana-01)</strong>
                  </div>
                  <div>
                    <span className="text-white/50 block">Check-in:</span>
                    <strong className="text-white">{checkIn} (from 2:00 PM)</strong>
                  </div>
                  <div>
                    <span className="text-white/50 block">Check-out:</span>
                    <strong className="text-white">{checkOut} (until 11:00 AM)</strong>
                  </div>
                  <div>
                    <span className="text-white/50 block">Duration & Guests:</span>
                    <strong className="text-white">
                      {nights} Night(s) · {adults} Adult(s) {children > 0 ? `· ${children} Child(ren)` : ""}
                    </strong>
                  </div>
                  <div>
                    <span className="text-white/50 block">Package Plan:</span>
                    <strong className="text-mint-300">{packagePlan}</strong>
                  </div>
                </div>

                <div className="p-4 bg-black/30 rounded-xl space-y-2 border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-mint-200 tracking-wider block">
                    Guest & Security
                  </span>
                  <div>
                    <span className="text-white/50 block">Primary Guest:</span>
                    <strong className="text-white">{guestName}</strong>
                  </div>
                  <div>
                    <span className="text-white/50 block">Contact Phone:</span>
                    <strong className="text-white">{guestPhone}</strong>
                  </div>
                  <div>
                    <span className="text-white/50 block">Email Address:</span>
                    <strong className="text-white">{guestEmail}</strong>
                  </div>
                  <div>
                    <span className="text-white/50 block">Country:</span>
                    <strong className="text-white">{country || "Sri Lanka"}</strong>
                  </div>
                  <div>
                    <span className="text-white/50 block">ID Documents:</span>
                    <strong className="text-mint-300">
                      {uploadedDocs.length > 0
                        ? `${uploadedDocs.length} Document(s) Encrypted`
                        : "Verification at Check-in"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="p-4 bg-black/40 rounded-xl border border-white/10 space-y-2 text-xs">
                <div className="flex justify-between text-white/70">
                  <span>
                    {selectedPkg?.name} ({formatPrice(selectedPkg?.rateLkr || 11000)} × {nights} nights)
                  </span>
                  <span>{formatPrice(totalAmountLkr)}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Eco Estate Maintenance & Linen</span>
                  <span className="text-emerald-400 font-semibold">Included</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Taxes & Service Charge</span>
                  <span className="text-emerald-400 font-semibold">Included</span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between items-baseline font-bold">
                  <span className="text-sm text-white">Total Amount Due</span>
                  <span className="font-display text-2xl text-mint-300">{formatPrice(totalAmountLkr)}</span>
                </div>
              </div>

              {/* Conditions & Policies */}
              <div className="space-y-3 pt-2 text-xs text-sage-300 leading-relaxed font-body">
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-mint-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Payment Policy:</strong> No advance payment is charged now. You may settle in cash (LKR, USD, EUR) or direct bank transfer upon arrival.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-mint-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Cancellation Policy:</strong> Free cancellation up to 48 hours prior to check-in.
                  </span>
                </div>
              </div>

              {/* Agreement Checkbox */}
              <div className="pt-3 border-t border-white/10">
                <label className="flex items-start gap-3 cursor-pointer text-xs text-white/90">
                  <input
                    type="checkbox"
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-white/20 bg-black/50 text-mint-500 focus:ring-mint-400 cursor-pointer"
                  />
                  <span>
                    I agree to the{" "}
                    <Link href="/terms" target="_blank" className="text-mint-300 underline">
                      Terms of Service
                    </Link>{" "}
                    and acknowledge the{" "}
                    <Link href="/privacy" target="_blank" className="text-mint-300 underline">
                      Privacy Policy
                    </Link>
                    . I confirm the details provided are accurate.
                  </span>
                </label>
              </div>

              {submitError && (
                <div className="p-3.5 bg-rose-950/60 border border-rose-500/50 rounded-xl text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="text-rose-400 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                disabled={submitting}
                onClick={() => setStep(3)}
                className="px-5 py-2.5 rounded-full border border-white/20 hover:bg-white/10 text-xs font-semibold text-white/80 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>

              <button
                disabled={!termsAgreed || submitting}
                onClick={handleFinalSubmit}
                className="px-8 py-4 bg-gradient-to-r from-mint-500 to-mint-600 hover:from-mint-400 hover:to-mint-500 text-forest-dark font-bold text-xs uppercase tracking-wider rounded-full shadow-glow flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>Placing Reservation...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    <span>Confirm & Submit Booking</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 5: Booking Submitted Successfully */}
        {step === 5 && confirmedBooking && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="bg-white/5 border border-mint-500/40 rounded-3xl p-6 sm:p-10 backdrop-blur-xl text-center space-y-6 shadow-2xl">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tr from-mint-500 to-emerald-400 rounded-full flex items-center justify-center mx-auto text-forest-dark shadow-glow">
                <Check size={36} strokeWidth={3} />
              </div>

              <div>
                <span className="font-eyebrow text-xs uppercase tracking-[0.3em] text-mint-300 font-bold block mb-1">
                  Reservation Received
                </span>
                <h2 className="font-display text-3xl sm:text-4xl text-white font-normal">
                  Thank You, {confirmedBooking.guestName || guestName}!
                </h2>
                <p className="font-body text-xs sm:text-sm text-sage-200 max-w-md mx-auto mt-2">
                  Your booking request has been successfully submitted. We have sent a confirmation email to{" "}
                  <strong className="text-mint-300">{confirmedBooking.guestEmail || guestEmail}</strong>.
                </p>
              </div>

              {/* Reference Card */}
              <div className="bg-black/40 border border-white/10 rounded-2xl p-5 max-w-md mx-auto space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 block">
                  Your Booking Reference
                </span>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-mint-300 tracking-wider">
                  #{confirmedBooking.id}
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Clock size={12} />
                  <span>Awaiting Host Review (Confirmed within 24h)</span>
                </div>
              </div>

              {/* Stay Breakdown Card */}
              <div className="bg-white/5 rounded-2xl p-4 sm:p-5 max-w-lg mx-auto text-left text-xs font-body space-y-2 border border-white/5">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-white/60">Cabana:</span>
                  <span className="text-white font-semibold">A-Frame Eco Cabana</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-white/60">Dates:</span>
                  <span className="text-white font-semibold">
                    {confirmedBooking.checkIn} → {confirmedBooking.checkOut} ({confirmedBooking.nights} Nights)
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-white/60">Guests:</span>
                  <span className="text-white font-semibold">
                    {confirmedBooking.adults} Adults {confirmedBooking.children ? `, ${confirmedBooking.children} Children` : ""}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-white/60">Package:</span>
                  <span className="text-mint-300 font-semibold">{confirmedBooking.packagePlan}</span>
                </div>
                <div className="flex justify-between py-1 pt-2 font-bold text-sm">
                  <span className="text-white">Total Amount Due:</span>
                  <span className="text-mint-300 font-mono">
                    LKR {(confirmedBooking.totalAmount || totalAmountLkr).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                <a
                  href={`https://wa.me/94756657000?text=Hello%20Kekulama,%20I%20have%20submitted%20booking%20request%20%23${confirmedBooking.id}%20for%20${guestName}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-full font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Phone size={14} />
                  <span>Message Host on WhatsApp</span>
                </a>

                <Link
                  href="/"
                  className="w-full sm:w-auto px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-full font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                >
                  <Home size={14} />
                  <span>Return to Homepage</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function DirectBookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0d1611] flex items-center justify-center text-white text-xs">
          <RefreshCw size={24} className="animate-spin text-mint-400" />
        </div>
      }
    >
      <DirectBookingContent />
    </Suspense>
  );
}

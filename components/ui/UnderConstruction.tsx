"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Facebook, Instagram, Music2, Home, Star, MapPin, Sparkles, Eye, ArrowRight } from "lucide-react";
import { siteData } from "@/data/siteData";

// 18 hours in milliseconds = 18 * 60 * 60 * 1000 = 64,800,000 ms
const COUNTDOWN_DURATION_MS = 18 * 60 * 60 * 1000;
const STORAGE_KEY = "kekulama_launch_target_time";

export default function UnderConstruction({ onPreview }: { onPreview?: () => void }) {
  const { contact } = siteData;
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 18,
    minutes: 0,
    seconds: 0,
  });
  const [progressPercent, setProgressPercent] = useState(88);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Get or initialize launch target timestamp
    let targetTime: number;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        targetTime = parseInt(stored, 10);
      } else {
        targetTime = Date.now() + COUNTDOWN_DURATION_MS;
        localStorage.setItem(STORAGE_KEY, targetTime.toString());
      }
    } catch {
      targetTime = Date.now() + COUNTDOWN_DURATION_MS;
    }

    const calculateTime = () => {
      const diff = targetTime - Date.now();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        setProgressPercent(100);
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTimeLeft({ hours, minutes, seconds });

      // Progress advances from 85% to 99%
      const elapsed = COUNTDOWN_DURATION_MS - diff;
      const progress = 85 + Math.min(14, (elapsed / COUNTDOWN_DURATION_MS) * 14);
      setProgressPercent(Math.round(progress));
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-[100dvh] w-full relative flex flex-col justify-between items-center text-white p-6 sm:p-10 overflow-hidden bg-forest-dark selection:bg-mint-400 selection:text-forest-dark">
      {/* ── Background Video & Ambient Dark Glass Layer ── */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover object-center filter blur-md scale-105 opacity-40"
        >
          <source src="/videos/hero-drone.mp4" type="video/mp4" />
        </video>
        {/* Soft Radial Ambient Lighting */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0e1713]/85 via-[#13221b]/90 to-[#0a120e]/95 backdrop-blur-xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-mint-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ── Top Header Navigation Bar ── */}
      <header className="w-full max-w-6xl relative z-10 flex items-center justify-between pt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-mint-500/20 border border-mint-400/30 flex items-center justify-center text-mint-300">
            <Sparkles size={16} />
          </div>
          <div>
            <span className="font-display text-lg tracking-wide text-white block leading-none">
              Kekulama
            </span>
            <span className="font-eyebrow text-[9px] uppercase tracking-[0.25em] text-mint-300 font-light">
              Eco Cabana · Galle
            </span>
          </div>
        </div>

        {/* Home / Preview Button */}
        {onPreview ? (
          <button
            onClick={onPreview}
            className="font-eyebrow text-xs uppercase tracking-[0.2em] text-sage-300 hover:text-white transition-colors flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10"
          >
            <Eye size={13} className="text-mint-300" />
            <span>Preview Site</span>
          </button>
        ) : (
          <span className="font-eyebrow text-xs uppercase tracking-[0.25em] text-sage-400 font-normal">
            HOME
          </span>
        )}
      </header>

      {/* ── Center Content: Under Construction & Countdown ── */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center my-auto py-10 max-w-2xl mx-auto w-full">
        {/* Top Mini Pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-mint-200 text-xs font-medium mb-6 shadow-sm"
        >
          <div className="w-2 h-2 rounded-full bg-mint-400 animate-ping" />
          <span className="font-eyebrow uppercase tracking-[0.2em] text-[10px] sm:text-xs">
            System Upgrades in Progress
          </span>
        </motion.div>

        {/* Big Bold Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-display uppercase tracking-[0.08em] text-white font-bold leading-none mb-4 drop-shadow-md"
        >
          UNDER <br /> CONSTRUCTION
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="font-eyebrow uppercase tracking-[0.3em] text-xs sm:text-sm text-sage-300 font-light mb-8"
        >
          SITE NEARLY READY
        </motion.p>

        {/* ── 18-Hour Live Countdown Timer Boxes ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="grid grid-cols-3 gap-3 sm:gap-4 max-w-sm w-full mb-8"
        >
          {/* Hours */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl py-3 px-2 flex flex-col items-center">
            <span className="font-mono text-2xl sm:text-4xl font-bold text-mint-300">
              {String(timeLeft.hours).padStart(2, "0")}
            </span>
            <span className="font-eyebrow text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-sage-400 mt-1">
              Hours
            </span>
          </div>

          {/* Minutes */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl py-3 px-2 flex flex-col items-center">
            <span className="font-mono text-2xl sm:text-4xl font-bold text-mint-300">
              {String(timeLeft.minutes).padStart(2, "0")}
            </span>
            <span className="font-eyebrow text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-sage-400 mt-1">
              Minutes
            </span>
          </div>

          {/* Seconds */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl py-3 px-2 flex flex-col items-center">
            <span className="font-mono text-2xl sm:text-4xl font-bold text-mint-300">
              {String(timeLeft.seconds).padStart(2, "0")}
            </span>
            <span className="font-eyebrow text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-sage-400 mt-1">
              Seconds
            </span>
          </div>
        </motion.div>

        {/* ── Progress Bar matching User's Image ── */}
        <div className="w-full max-w-md mb-8">
          <div className="relative w-full h-2.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-sky-400 via-mint-400 to-sky-300 rounded-full shadow-[0_0_12px_rgba(56,189,248,0.8)] relative overflow-hidden"
            >
              {/* Shimmer stripe */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 animate-shimmer" />
            </motion.div>
          </div>
          <div className="flex justify-between items-center text-[11px] font-mono text-sage-400 mt-2 px-1">
            <span>0%</span>
            <span className="text-mint-300 font-semibold">{progressPercent}% Ready</span>
            <span>100%</span>
          </div>
        </div>

        {/* ── Direct WhatsApp Action Button ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="flex flex-col sm:flex-row items-center gap-3.5"
        >
          <a
            href={`https://wa.me/${contact.whatsappRaw}?text=Hello%20Kekulama%20Eco%20Cabana,%20I%20saw%20your%20website%20is%20updating%20and%20would%20like%20to%20inquire%20about%20a%20booking.`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3.5 rounded-full bg-sky-500 hover:bg-sky-400 text-white font-body font-semibold text-xs uppercase tracking-[0.16em] transition-all shadow-lg hover:shadow-sky-500/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <MessageCircle size={15} />
            <span>Book / Inquire via WhatsApp</span>
          </a>

          <a
            href={`tel:${contact.phoneRaw}`}
            className="px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-body font-semibold text-xs uppercase tracking-[0.16em] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Call: {contact.phoneDisplay}</span>
          </a>
        </motion.div>
      </main>

      {/* ── Bottom Section: Circular Social Links & Footer ── */}
      <footer className="w-full max-w-6xl relative z-10 flex flex-col items-center pt-6 pb-2 text-center">
        {/* Circular Social Icons matching User's Image */}
        <div className="flex items-center justify-center gap-3.5 sm:gap-4 mb-5">
          {/* Facebook */}
          <a
            href={contact.social.facebook}
            target="_blank"
            rel="noreferrer"
            className="w-11 h-11 rounded-full border border-white/30 bg-white/5 hover:bg-white/20 hover:border-white/60 text-white flex items-center justify-center transition-all duration-300 active:scale-95 shadow-sm"
            aria-label="Facebook"
          >
            <Facebook size={18} />
          </a>

          {/* Instagram */}
          <a
            href={contact.social.instagram}
            target="_blank"
            rel="noreferrer"
            className="w-11 h-11 rounded-full border border-white/30 bg-white/5 hover:bg-white/20 hover:border-white/60 text-white flex items-center justify-center transition-all duration-300 active:scale-95 shadow-sm"
            aria-label="Instagram"
          >
            <Instagram size={18} />
          </a>

          {/* TripAdvisor */}
          <a
            href={contact.social.tripadvisor || "https://www.tripadvisor.com/Hotel_Review-g297896-d34099769-Reviews-Kekulama_Eco_Cabana-Galle_Galle_District_Southern_Province.html"}
            target="_blank"
            rel="noreferrer"
            className="w-11 h-11 rounded-full border border-white/30 bg-white/5 hover:bg-white/20 hover:border-white/60 text-white flex items-center justify-center transition-all duration-300 active:scale-95 shadow-sm"
            aria-label="TripAdvisor"
          >
            <Star size={18} className="text-amber-300 fill-amber-300" />
          </a>

          {/* TikTok */}
          <a
            href={contact.social.tiktok}
            target="_blank"
            rel="noreferrer"
            className="w-11 h-11 rounded-full border border-white/30 bg-white/5 hover:bg-white/20 hover:border-white/60 text-white flex items-center justify-center transition-all duration-300 active:scale-95 shadow-sm"
            aria-label="TikTok"
          >
            <Music2 size={18} />
          </a>

          {/* Google Maps Location */}
          <a
            href={contact.googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="w-11 h-11 rounded-full border border-white/30 bg-white/5 hover:bg-white/20 hover:border-white/60 text-white flex items-center justify-center transition-all duration-300 active:scale-95 shadow-sm"
            aria-label="Google Maps"
          >
            <MapPin size={18} className="text-mint-300" />
          </a>
        </div>

        {/* Copyright */}
        <p className="font-body text-xs text-sage-400 font-light">
          © {new Date().getFullYear()} Kekulama Eco Cabana · Pinnaduwa, Galle, Sri Lanka. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

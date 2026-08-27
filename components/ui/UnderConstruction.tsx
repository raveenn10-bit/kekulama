"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2,
  VolumeX,
  Sparkles,
  Layers,
  Facebook,
  Instagram,
  Phone,
  Mail,
  MapPin,
  Star,
  Music2,
  Lock,
  KeyRound,
  X,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { siteData } from "@/data/siteData";

// 18 hours in milliseconds
const COUNTDOWN_DURATION_MS = 18 * 60 * 60 * 1000;
const STORAGE_KEY = "kekulama_launch_target_time";
const AUTH_PASSWORD = "0770663154";

const SCENES = [
  { id: 1, type: "video", src: "/videos/hero-drone.mp4", name: "Drone Aerial View" },
  { id: 2, type: "image", src: "/images/hero.jpg", name: "Twilight Cabana Sanctuary" },
  { id: 3, type: "image", src: "/images/cabana-garden.jpg", name: "Lush Tea Estate Gardens" },
  { id: 4, type: "image", src: "/images/cabana-trees.jpg", name: "Canopy Retreat" },
];

export default function UnderConstruction({ onUnlock }: { onUnlock?: () => void }) {
  const { contact, about } = siteData;
  const [mounted, setMounted] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [inputPassword, setInputPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 18,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    setMounted(true);

    // Audio setup
    const audio = new Audio("/audio/forest-ambience.mp3");
    audio.loop = true;
    audio.volume = 0.45;
    audioRef.current = audio;

    // Check direct URL password access: ?pass=0770663154
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlPass = params.get("pass") || params.get("password") || params.get("unlock");
      if (urlPass === AUTH_PASSWORD) {
        try {
          sessionStorage.setItem("kekulama_admin_unlocked", "true");
        } catch {}
        if (onUnlock) onUnlock();
        return;
      }
    }

    // Initialize 18-hour countdown target
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
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => {
      clearInterval(interval);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [onUnlock]);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isAudioPlaying) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsAudioPlaying(true)).catch(() => {});
    }
  };

  const nextScene = () => {
    setCurrentSceneIdx((prev) => (prev + 1) % SCENES.length);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPassword === AUTH_PASSWORD) {
      setErrorMsg("");
      setShowPasswordModal(false);
      try {
        sessionStorage.setItem("kekulama_admin_unlocked", "true");
      } catch {}
      if (onUnlock) onUnlock();
    } else {
      setErrorMsg("Incorrect passcode. Please try again.");
    }
  };

  if (!mounted) return null;

  const currentScene = SCENES[currentSceneIdx];

  return (
    <div className="min-h-[100dvh] w-full relative flex flex-col justify-between items-center text-white p-4 sm:p-8 md:p-10 overflow-hidden bg-black selection:bg-mint-400 selection:text-black">
      {/* ── Dynamic Background Scene (Video / Image with Dark Atmospheric Fade) ── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <AnimatePresence mode="wait">
          {currentScene.type === "video" ? (
            <motion.video
              key="scene-video"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover object-center filter blur-[1px] scale-105"
            >
              <source src={currentScene.src} type="video/mp4" />
            </motion.video>
          ) : (
            <motion.div
              key={currentScene.src}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 0.45, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0 w-full h-full"
            >
              <Image
                src={currentScene.src}
                alt={currentScene.name}
                fill
                priority
                className="object-cover object-center filter blur-[1px]"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dark Vignette & Atmospheric Fog Overlay matching Reference Screenshot */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.85)_100%)]" />
      </div>

      {/* ── Top Header Navigation Bar ── */}
      <header className="w-full max-w-7xl relative z-20 flex items-center justify-between pt-2">
        {/* Brand Logo & Name */}
        <div
          onClick={() => setShowPasswordModal(true)}
          className="flex items-center gap-3 cursor-pointer group"
          title="Kekulama Eco Cabana (Click for Admin)"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/30 bg-black/40 flex-shrink-0 group-hover:scale-105 transition-transform shadow-md">
            <Image
              src="/images/logo.jpg"
              alt="Kekulama Logo"
              width={40}
              height={40}
              className="object-cover w-full h-full"
            />
          </div>
          <div>
            <span className="font-display tracking-[0.2em] text-white text-base sm:text-lg font-bold block leading-none">
              KEKULAMA
            </span>
            <span className="font-eyebrow text-[9px] uppercase tracking-[0.28em] text-sage-300 font-light block mt-1">
              ECO CABANA & SANCTUARY
            </span>
          </div>
        </div>

        {/* Right Navigation Controls */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Sound On / Off Pill Button */}
          <button
            onClick={toggleAudio}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-[10px] sm:text-xs font-eyebrow uppercase tracking-[0.16em] text-sage-200 hover:text-white transition-all backdrop-blur-md cursor-pointer"
          >
            {isAudioPlaying ? (
              <>
                <Volume2 size={13} className="text-mint-300 animate-pulse" />
                <span>Sound On</span>
              </>
            ) : (
              <>
                <VolumeX size={13} className="text-sage-400" />
                <span>Sound Off</span>
              </>
            )}
          </button>

          {/* Scene Switcher Pill Button */}
          <button
            onClick={nextScene}
            className="hidden sm:flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-[10px] sm:text-xs font-eyebrow uppercase tracking-[0.16em] text-sage-200 hover:text-white transition-all backdrop-blur-md cursor-pointer"
            title="Switch Background View"
          >
            <Layers size={13} className="text-mint-300" />
            <span>Scene {currentSceneIdx + 1}/{SCENES.length}</span>
          </button>

          {/* About Modal Link */}
          <button
            onClick={() => setShowAboutModal(true)}
            className="font-eyebrow text-[11px] sm:text-xs uppercase tracking-[0.22em] text-sage-300 hover:text-white transition-colors cursor-pointer px-1 py-1"
          >
            ABOUT
          </button>

          {/* Contact Modal Link */}
          <button
            onClick={() => setShowContactModal(true)}
            className="font-eyebrow text-[11px] sm:text-xs uppercase tracking-[0.22em] text-sage-300 hover:text-white transition-colors cursor-pointer px-1 py-1"
          >
            CONTACT
          </button>
        </div>
      </header>

      {/* ── Main Center Stage: COMING SOON + 18-Hour Countdown ── */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center my-auto py-10 max-w-4xl mx-auto w-full">
        {/* Top Status Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-sage-200 text-[10px] sm:text-xs font-eyebrow uppercase tracking-[0.25em] mb-8 shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shadow-[0_0_8px_#34d399] animate-pulse" />
          <span>GRAND LAUNCH IN 18 HOURS</span>
        </motion.div>

        {/* ── Giant Bold "COMING SOON" Typography (Exact Match) ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1 }}
          className="mb-6"
        >
          <h1 className="font-display font-black text-5xl sm:text-7xl md:text-8xl lg:text-[100px] tracking-[0.18em] uppercase text-white leading-[1.05] drop-shadow-2xl">
            COMING <br />
            SOON
          </h1>
        </motion.div>

        {/* Subtitle Editorial Paragraph */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="max-w-xl mx-auto mb-10 px-4"
        >
          <p className="font-body text-xs sm:text-sm md:text-base text-sage-300 leading-relaxed font-light">
            We are currently crafting our new luxury eco-stay experience.
            <br />
            We will be live in 18 hours. Click on <span className="font-medium text-white underline decoration-mint-400 underline-offset-4">&quot;Notify Me&quot;</span> to be ready for the Grand Day!
          </p>
        </motion.div>

        {/* ── 3 Countdown Cards with Colon Separators (Exact Match) ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="flex items-center justify-center gap-3 sm:gap-6 mb-10"
        >
          {/* Hours Card */}
          <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-2xl w-20 sm:w-28 py-3.5 sm:py-4 flex flex-col items-center justify-center shadow-2xl">
            <span className="font-mono text-2xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
              {String(timeLeft.hours).padStart(2, "0")}
            </span>
            <span className="font-eyebrow text-[8.5px] sm:text-[10px] uppercase tracking-[0.25em] text-sage-400 font-medium mt-1">
              HOURS
            </span>
          </div>

          {/* Colon Separator */}
          <span className="text-xl sm:text-3xl font-mono text-sage-400 font-light pb-2">
            :
          </span>

          {/* Minutes Card */}
          <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-2xl w-20 sm:w-28 py-3.5 sm:py-4 flex flex-col items-center justify-center shadow-2xl">
            <span className="font-mono text-2xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
              {String(timeLeft.minutes).padStart(2, "0")}
            </span>
            <span className="font-eyebrow text-[8.5px] sm:text-[10px] uppercase tracking-[0.25em] text-sage-400 font-medium mt-1">
              MINUTES
            </span>
          </div>

          {/* Colon Separator */}
          <span className="text-xl sm:text-3xl font-mono text-sage-400 font-light pb-2">
            :
          </span>

          {/* Seconds Card */}
          <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-2xl w-20 sm:w-28 py-3.5 sm:py-4 flex flex-col items-center justify-center shadow-2xl">
            <span className="font-mono text-2xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
              {String(timeLeft.seconds).padStart(2, "0")}
            </span>
            <span className="font-eyebrow text-[8.5px] sm:text-[10px] uppercase tracking-[0.25em] text-sage-400 font-medium mt-1">
              SECONDS
            </span>
          </div>
        </motion.div>

        {/* ── NOTIFY ME CTA Button (Exact Match) ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
        >
          <a
            href={`https://wa.me/${contact.whatsappRaw}?text=Hello%20Kekulama%20Eco%20Cabana,%20please%20notify%20me%20when%20the%20official%20website%20is%20live%20and%20share%20room%20availability.`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl bg-black/60 hover:bg-white/15 border border-white/30 hover:border-white/60 text-white font-eyebrow font-medium text-xs sm:text-sm uppercase tracking-[0.25em] transition-all duration-300 shadow-2xl active:scale-95 group cursor-pointer"
          >
            <span>NOTIFY ME</span>
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </main>

      {/* ── Footer: Copyright + Circular Social Icons (Exact Match) ── */}
      <footer className="w-full max-w-7xl relative z-20 flex flex-col items-center pt-6 pb-2 text-center">
        {/* Top Copyright line */}
        <p
          onClick={() => setShowPasswordModal(true)}
          className="font-eyebrow text-[10px] sm:text-xs uppercase tracking-[0.25em] text-sage-400 font-normal mb-4 cursor-pointer hover:text-white transition-colors"
        >
          WEBSITE BY KEKULAMA ECO CABANA. ALL RIGHTS RESERVED.
        </p>

        {/* Circular Pill Social / Contact Icons */}
        <div className="flex items-center justify-center gap-3.5 sm:gap-4">
          {/* TripAdvisor */}
          <a
            href={contact.social.tripadvisor || "https://www.tripadvisor.com/Hotel_Review-g297896-d34099769-Reviews-Kekulama_Eco_Cabana-Galle_Galle_District_Southern_Province.html"}
            target="_blank"
            rel="noreferrer"
            className="w-10 h-10 rounded-full border border-white/30 bg-black/50 hover:bg-white/20 hover:border-white/70 text-white flex items-center justify-center transition-all duration-300 active:scale-95 shadow-sm"
            aria-label="TripAdvisor"
          >
            <Star size={16} className="text-amber-300 fill-amber-300" />
          </a>

          {/* Facebook */}
          <a
            href={contact.social.facebook}
            target="_blank"
            rel="noreferrer"
            className="w-10 h-10 rounded-full border border-white/30 bg-black/50 hover:bg-white/20 hover:border-white/70 text-white flex items-center justify-center transition-all duration-300 active:scale-95 shadow-sm"
            aria-label="Facebook"
          >
            <Facebook size={16} />
          </a>

          {/* WhatsApp / Phone */}
          <a
            href={`tel:${contact.phoneRaw}`}
            className="w-10 h-10 rounded-full border border-white/30 bg-black/50 hover:bg-white/20 hover:border-white/70 text-white flex items-center justify-center transition-all duration-300 active:scale-95 shadow-sm"
            aria-label="Phone"
          >
            <Phone size={16} />
          </a>

          {/* Email */}
          <a
            href={`mailto:${contact.email}`}
            className="w-10 h-10 rounded-full border border-white/30 bg-black/50 hover:bg-white/20 hover:border-white/70 text-white flex items-center justify-center transition-all duration-300 active:scale-95 shadow-sm"
            aria-label="Email"
          >
            <Mail size={16} />
          </a>
        </div>
      </footer>

      {/* ── ABOUT MODAL DRAWER ── */}
      <AnimatePresence>
        {showAboutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6"
            onClick={() => setShowAboutModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0e1713] border border-white/20 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative max-h-[85vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowAboutModal(false)}
                className="absolute top-5 right-5 text-sage-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              <span className="font-eyebrow text-[10px] uppercase tracking-[0.26em] text-mint-300 mb-2 block">
                Our Sanctuary
              </span>
              <h2 className="font-display text-2xl sm:text-3xl text-white font-normal mb-4">
                Kekulama Eco Cabana
              </h2>

              <div className="space-y-3.5 text-xs sm:text-sm text-sage-300 font-light leading-relaxed mb-6 font-body">
                {about.paragraphs.map((para: string, idx: number) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-2.5 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2.5 text-xs text-sage-200">
                  <CheckCircle2 size={16} className="text-mint-400" />
                  <span>Secluded 2-Story A-Frame Timber Cabana</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-sage-200">
                  <CheckCircle2 size={16} className="text-mint-400" />
                  <span>Surrounded by tranquil tea estate hills</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-sage-200">
                  <CheckCircle2 size={16} className="text-mint-400" />
                  <span>Just 12 minutes from Galle UNESCO Fort</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CONTACT MODAL DRAWER ── */}
      <AnimatePresence>
        {showContactModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6"
            onClick={() => setShowContactModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0e1713] border border-white/20 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative"
            >
              <button
                onClick={() => setShowContactModal(false)}
                className="absolute top-5 right-5 text-sage-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              <span className="font-eyebrow text-[10px] uppercase tracking-[0.26em] text-mint-300 mb-2 block">
                Get In Touch
              </span>
              <h2 className="font-display text-2xl sm:text-3xl text-white font-normal mb-5">
                Contact Sanctuary
              </h2>

              <div className="space-y-4">
                <a
                  href={`tel:${contact.phoneRaw}`}
                  className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-mint-500/20 text-mint-300 flex items-center justify-center flex-shrink-0">
                    <Phone size={18} />
                  </div>
                  <div>
                    <span className="font-eyebrow text-[9.5px] uppercase tracking-wider text-sage-400 block">Phone</span>
                    <span className="font-body text-white font-semibold text-sm">{contact.phoneDisplay}</span>
                  </div>
                </a>

                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-mint-500/20 text-mint-300 flex items-center justify-center flex-shrink-0">
                    <Mail size={18} />
                  </div>
                  <div>
                    <span className="font-eyebrow text-[9.5px] uppercase tracking-wider text-sage-400 block">Email</span>
                    <span className="font-body text-white font-semibold text-xs sm:text-sm break-all">{contact.email}</span>
                  </div>
                </a>

                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="w-10 h-10 rounded-xl bg-mint-500/20 text-mint-300 flex items-center justify-center flex-shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <span className="font-eyebrow text-[9.5px] uppercase tracking-wider text-sage-400 block">Location</span>
                    <span className="font-body text-sage-200 text-xs sm:text-sm">{contact.address}</span>
                  </div>
                </div>
              </div>

              <a
                href={`https://wa.me/${contact.whatsappRaw}?text=Hello%20Kekulama%20Eco%20Cabana,%20I%20would%20like%20to%20inquire%20about%20a%20stay.`}
                target="_blank"
                rel="noreferrer"
                className="mt-6 w-full py-3.5 rounded-xl bg-gradient-to-r from-mint-500 to-mint-600 hover:from-mint-600 hover:to-mint-700 text-white font-body font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-glow"
              >
                <span>Instant WhatsApp Inquiry</span>
                <ExternalLink size={14} />
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PASSCODE ADMIN UNLOCK MODAL ── */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#111e18] border border-mint-400/30 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative text-center"
            >
              <button
                onClick={() => setShowPasswordModal(false)}
                className="absolute top-4 right-4 text-sage-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-mint-500/20 border border-mint-400/30 text-mint-300 flex items-center justify-center mx-auto mb-4">
                <KeyRound size={22} />
              </div>

              <h3 className="font-display text-2xl text-white font-normal mb-1">
                Admin Passcode
              </h3>
              <p className="font-body text-xs text-sage-400 mb-5">
                Enter passcode to unlock the website preview.
              </p>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <input
                    type="password"
                    autoFocus
                    value={inputPassword}
                    onChange={(e) => {
                      setInputPassword(e.target.value);
                      setErrorMsg("");
                    }}
                    placeholder="Enter passcode"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-sage-500 text-center font-mono tracking-widest text-lg focus:outline-none focus:border-mint-400 focus:ring-1 focus:ring-mint-400 transition-all"
                  />
                  {errorMsg && (
                    <span className="font-body text-xs text-red-400 mt-2 block">
                      {errorMsg}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-mint-500 to-mint-600 hover:from-mint-600 hover:to-mint-700 text-white font-body font-semibold text-xs uppercase tracking-wider transition-all shadow-glow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock size={14} />
                  <span>Unlock Full Site</span>
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

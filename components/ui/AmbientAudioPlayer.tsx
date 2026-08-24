"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Trees } from "lucide-react";
import { LUXURY_EASING } from "@/lib/motion";

export default function AmbientAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(0.45); // soothing luxury ambient volume
  const [showNotification, setShowNotification] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasStartedRef = useRef(false);

  // Smooth volume fade helper
  const fadeVolume = useCallback((targetVol: number, durationMs = 800, onComplete?: () => void) => {
    if (!audioRef.current) return;
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

    const startVol = audioRef.current.volume;
    const steps = 20;
    const stepTime = durationMs / steps;
    const delta = (targetVol - startVol) / steps;
    let currentStep = 0;

    fadeIntervalRef.current = setInterval(() => {
      if (!audioRef.current) {
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
        return;
      }
      currentStep++;
      const newVol = Math.min(1, Math.max(0, startVol + delta * currentStep));
      audioRef.current.volume = newVol;

      if (currentStep >= steps) {
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
        audioRef.current.volume = targetVol;
        if (onComplete) onComplete();
      }
    }, stepTime);
  }, []);

  const playAudio = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = 0;
    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          hasStartedRef.current = true;
          fadeVolume(volume, 1200);
        })
        .catch(() => {
          // Autoplay restricted by browser until first gesture
          setIsPlaying(false);
        });
    }
  }, [fadeVolume, volume]);

  const pauseAudio = useCallback(() => {
    if (!audioRef.current) return;
    fadeVolume(0, 500, () => {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    });
  }, [fadeVolume]);

  const togglePlay = () => {
    setShowNotification(false);
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  // Immediate autoplay on mount & fallback to first interaction
  useEffect(() => {
    // 1. Try immediate autoplay
    playAudio();

    // 2. Fallback: on earliest user interaction (scroll, touch, click, keydown)
    const handleEarliestGesture = () => {
      if (!hasStartedRef.current && audioRef.current && audioRef.current.paused) {
        playAudio();
      }
    };

    window.addEventListener("click", handleEarliestGesture, { passive: true });
    window.addEventListener("touchstart", handleEarliestGesture, { passive: true });
    window.addEventListener("pointerdown", handleEarliestGesture, { passive: true });
    window.addEventListener("scroll", handleEarliestGesture, { passive: true, once: true });
    window.addEventListener("keydown", handleEarliestGesture, { passive: true });

    return () => {
      window.removeEventListener("click", handleEarliestGesture);
      window.removeEventListener("touchstart", handleEarliestGesture);
      window.removeEventListener("pointerdown", handleEarliestGesture);
      window.removeEventListener("scroll", handleEarliestGesture);
      window.removeEventListener("keydown", handleEarliestGesture);
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    };
  }, [playAudio]);

  // Hide helper toast after 6 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(false);
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <audio
        ref={audioRef}
        src="/audio/forest-ambience.mp3"
        autoPlay
        loop
        preload="none"
        playsInline
      />

      <div className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom,0))] left-4 sm:left-6 z-50 flex items-center gap-2.5">
        {/* Ambient Sound Trigger Button */}
        <motion.button
          onClick={togglePlay}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.3, ease: LUXURY_EASING.quintOut }}
          className={`flex items-center gap-2.5 px-3.5 sm:px-4 py-2.5 rounded-full backdrop-blur-xl shadow-lifted border transition-all duration-300 cursor-pointer ${
            isPlaying
              ? "bg-forest/90 text-white border-mint-400/40 shadow-glow"
              : "bg-white/90 text-forest border-eucalyptus-200/90 hover:border-mint-400"
          }`}
          aria-label={isPlaying ? "Mute nature sounds" : "Play nature sounds"}
        >
          {/* Animated Equalizer Waveform */}
          <div className="flex items-end gap-[2px] h-3.5 w-3.5 justify-center">
            {isPlaying ? (
              <>
                <motion.span
                  animate={{ height: ["4px", "14px", "6px", "12px", "4px"] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-[2.5px] bg-mint-400 rounded-full"
                />
                <motion.span
                  animate={{ height: ["8px", "4px", "14px", "6px", "8px"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                  className="w-[2.5px] bg-mint-300 rounded-full"
                />
                <motion.span
                  animate={{ height: ["12px", "6px", "4px", "14px", "12px"] }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                  className="w-[2.5px] bg-mint-400 rounded-full"
                />
              </>
            ) : (
              <>
                <span className="w-[2.5px] h-[3px] bg-sage-400 rounded-full" />
                <span className="w-[2.5px] h-[6px] bg-sage-400 rounded-full" />
                <span className="w-[2.5px] h-[3px] bg-sage-400 rounded-full" />
              </>
            )}
          </div>

          <span className="font-body text-xs font-semibold tracking-wide flex items-center gap-1.5">
            <span className="hidden sm:inline">Forest Ambience</span>
            <span className="sm:hidden">Nature Sound</span>
            <span
              className={`text-[10px] font-eyebrow uppercase tracking-[0.16em] px-1.5 py-0.5 rounded-full ${
                isPlaying
                  ? "bg-mint-400/30 text-mint-200"
                  : "bg-sage-100 text-sage-600"
              }`}
            >
              {isPlaying ? "ON" : "OFF"}
            </span>
          </span>

          {isPlaying ? (
            <Volume2 size={15} className="text-mint-300" />
          ) : (
            <VolumeX size={15} className="text-sage-400" />
          )}
        </motion.button>

        {/* Initial helper toast */}
        <AnimatePresence>
          {showNotification && !isPlaying && (
            <motion.div
              initial={{ opacity: 0, x: -10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -10, scale: 0.95 }}
              transition={{ duration: 0.4, ease: LUXURY_EASING.quintOut }}
              className="hidden md:flex items-center gap-2 bg-forest-dark/95 backdrop-blur-md text-white px-3.5 py-2 rounded-2xl shadow-lifted border border-white/10 text-xs"
            >
              <Trees size={14} className="text-mint-300" />
              <span className="font-body text-[11px] text-eucalyptus-100">
                Tap anywhere to hear Ceylon forest sounds
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

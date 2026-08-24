"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Cloud, CloudRain, CloudLightning, CloudDrizzle, Wind, Droplets, Sparkles } from "lucide-react";
import { useLiveWeather, LiveWeatherData } from "@/hooks/useLiveWeather";

/* ─────────────────────────────────────────────
   Deterministic Star System
   ───────────────────────────────────────────── */
const STARS = Array.from({ length: 45 }, (_, i) => ({
  x: ((i * 7 + 13) * 17) % 100,
  y: ((i * 11 + 7) * 23) % 65,
  size: 1 + (i % 3),
  delay: ((i * 3) % 7) * 0.5,
  twinkle: 2.5 + (i % 4) * 0.8,
}));

/* ─────────────────────────────────────────────
   Deterministic Volumetric Cloud Puffs
   ───────────────────────────────────────────── */
const CLOUD_LAYERS = [
  { id: 1, y: 12, scale: 1.1, baseSpeed: 90, opacity: 0.75, delay: 0 },
  { id: 2, y: 22, scale: 0.85, baseSpeed: 130, opacity: 0.6, delay: -45 },
  { id: 3, y: 8, scale: 1.4, baseSpeed: 70, opacity: 0.85, delay: -20 },
  { id: 4, y: 30, scale: 0.7, baseSpeed: 160, opacity: 0.5, delay: -90 },
  { id: 5, y: 18, scale: 1.2, baseSpeed: 105, opacity: 0.7, delay: -60 },
];

/* ─────────────────────────────────────────────
   Rain Streaks System
   ───────────────────────────────────────────── */
const RAIN_DROPS = Array.from({ length: 40 }, (_, i) => ({
  x: (i * 2.5 + ((i * 13) % 7)) % 100,
  duration: 0.6 + ((i * 3) % 5) * 0.1,
  delay: ((i * 7) % 10) * 0.08,
  length: 24 + (i % 16),
  opacity: 0.35 + ((i % 4) * 0.15),
}));

/* ─────────────────────────────────────────────
   Parabolic arc position helper
   ───────────────────────────────────────────── */
function getArcPosition(progress: number) {
  const x = 8 + progress * 84;
  const y = 88 - Math.sin(progress * Math.PI) * 72;
  return { x, y };
}

type SkyPhase = "dawn" | "sunrise" | "morning" | "midday" | "afternoon" | "sunset" | "dusk" | "night";

function getSkyPhase(t: number): SkyPhase {
  if (t >= 4.5 && t < 5.5) return "dawn";
  if (t >= 5.5 && t < 7) return "sunrise";
  if (t >= 7 && t < 11) return "morning";
  if (t >= 11 && t < 14) return "midday";
  if (t >= 14 && t < 16.5) return "afternoon";
  if (t >= 16.5 && t < 18) return "sunset";
  if (t >= 18 && t < 19.5) return "dusk";
  return "night";
}

export default function DynamicSky() {
  const [mounted, setMounted] = useState(false);
  const [timeDecimal, setTimeDecimal] = useState(12);
  const [lightning, setLightning] = useState(false);
  const { weather } = useLiveWeather();

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      const now = new Date();
      setTimeDecimal(now.getHours() + now.getMinutes() / 60);
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  // Thunderstorm lightning simulator
  useEffect(() => {
    if (weather.condition !== "Thunderstorm") return;

    let lightningTimeout: ReturnType<typeof setTimeout> | null = null;
    const triggerLightning = () => {
      setLightning(true);
      setTimeout(() => setLightning(false), 120);
      setTimeout(() => {
        setLightning(true);
        setTimeout(() => setLightning(false), 80);
      }, 200);

      const nextInterval = 4000 + Math.random() * 8000;
      lightningTimeout = setTimeout(triggerLightning, nextInterval);
    };

    lightningTimeout = setTimeout(triggerLightning, 3000);
    return () => {
      if (lightningTimeout) clearTimeout(lightningTimeout);
    };
  }, [weather.condition]);

  const phase = useMemo(() => getSkyPhase(timeDecimal), [timeDecimal]);
  const isNight = phase === "night" || phase === "dusk" || phase === "dawn";

  // Dynamic base sky gradient based on time + live weather
  const skyGradient = useMemo(() => {
    if (weather.condition === "Thunderstorm") {
      return "linear-gradient(to bottom, #0f1422 0%, #171d31 35%, #232c45 70%, #1a2238 100%)";
    }
    if (weather.condition === "Rain") {
      return isNight
        ? "linear-gradient(to bottom, #0a0d18 0%, #121829 40%, #1a243a 80%, #101626 100%)"
        : "linear-gradient(to bottom, #465366 0%, #63758d 40%, #8799b0 75%, #a8b8cc 100%)";
    }
    if (weather.condition === "Drizzle") {
      return isNight
        ? "linear-gradient(to bottom, #0e1222 0%, #182035 45%, #222e48 85%, #141a2c 100%)"
        : "linear-gradient(to bottom, #506177 0%, #71849d 40%, #95a8bf 75%, #b9c8db 100%)";
    }

    // Default time-based gradients
    switch (phase) {
      case "dawn":
        return "linear-gradient(to bottom, #1a1a2e 0%, #16213e 20%, #2d4059 45%, #e8a87c 75%, #d4a574 100%)";
      case "sunrise":
        return "linear-gradient(to bottom, #4a6fa5 0%, #7fb3d3 25%, #ffd4a2 55%, #ff9a5c 80%, #ff6b35 100%)";
      case "morning":
        return "linear-gradient(to bottom, #5b9bd5 0%, #87ceeb 35%, #b0e0e6 65%, #e0f0ff 100%)";
      case "midday":
        return "linear-gradient(to bottom, #4a90d9 0%, #6bb3e0 30%, #87ceeb 60%, #d4edfc 100%)";
      case "afternoon":
        return "linear-gradient(to bottom, #5a9fd4 0%, #87b8d9 30%, #d4b896 65%, #e8c89e 100%)";
      case "sunset":
        return "linear-gradient(to bottom, #2d3561 0%, #8b5e83 25%, #e07c5a 55%, #ff8c42 80%, #ffd166 100%)";
      case "dusk":
        return "linear-gradient(to bottom, #1a1a2e 0%, #2d3561 25%, #5c4d7d 50%, #c06c84 75%, #e88c6a 100%)";
      case "night":
      default:
        return "linear-gradient(to bottom, #0a0a1a 0%, #0f1729 25%, #162447 50%, #1a1a3e 75%, #0f0f23 100%)";
    }
  }, [phase, weather.condition, isNight]);

  // Sun calculations
  const sunPos = useMemo(() => {
    if (timeDecimal >= 5.5 && timeDecimal <= 18) {
      const progress = (timeDecimal - 5.5) / 12.5;
      return { ...getArcPosition(progress), visible: true, progress };
    }
    return { x: -20, y: 100, visible: false, progress: 0 };
  }, [timeDecimal]);

  // Moon calculations
  const moonPos = useMemo(() => {
    let progress: number;
    if (timeDecimal >= 18) progress = (timeDecimal - 18) / 12;
    else if (timeDecimal < 6) progress = (timeDecimal + 6) / 12;
    else return { x: -20, y: 100, visible: false, progress: 0 };
    return { ...getArcPosition(progress), visible: true, progress };
  }, [timeDecimal]);

  // Cloud tint calculation
  const cloudTint = useMemo(() => {
    if (weather.condition === "Thunderstorm") return "rgba(40, 48, 65, 0.85)";
    if (weather.condition === "Rain") return "rgba(90, 105, 125, 0.75)";
    if (phase === "sunrise") return "rgba(255, 210, 180, 0.85)";
    if (phase === "sunset") return "rgba(255, 175, 140, 0.85)";
    if (phase === "dusk" || phase === "dawn") return "rgba(160, 140, 180, 0.7)";
    if (isNight) return "rgba(30, 42, 65, 0.65)";
    return "rgba(255, 255, 255, 0.8)";
  }, [phase, weather.condition, isNight]);

  // Cloud drift duration based on live wind speed (faster wind = shorter duration)
  const cloudSpeedMultiplier = useMemo(() => {
    const speed = Math.max(5, weather.windSpeed);
    return 20 / speed; // baseline at 20 km/h
  }, [weather.windSpeed]);

  if (!mounted) return null;

  const isRaining = weather.condition === "Rain" || weather.condition === "Drizzle" || weather.condition === "Thunderstorm";
  const isMisty = weather.condition === "Mist" || weather.condition === "Haze" || weather.condition === "Fog";

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* ── Sky Base Gradient ── */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{ background: skyGradient }}
      />

      {/* ── Lightning flash overlay ── */}
      {lightning && (
        <div className="absolute inset-0 bg-white/40 z-30 transition-opacity duration-75" />
      )}

      {/* ── Sun with Cloud Attenuation ── */}
      {sunPos.visible && (
        <div
          className="absolute transition-all duration-700"
          style={{
            left: `${sunPos.x}%`,
            top: `${sunPos.y}%`,
            transform: "translate(-50%, -50%)",
            opacity: weather.cloudCoverage > 80 ? 0.35 : weather.cloudCoverage > 50 ? 0.65 : 1,
          }}
        >
          {/* Outer Atmospheric Flare */}
          <div
            className="absolute rounded-full blur-3xl"
            style={{
              width: "180px",
              height: "180px",
              left: "-72px",
              top: "-72px",
              background: phase === "sunset" || phase === "sunrise"
                ? "radial-gradient(circle, rgba(255,140,60,0.4) 0%, rgba(255,100,40,0.15) 50%, transparent 70%)"
                : "radial-gradient(circle, rgba(255,220,100,0.35) 0%, rgba(255,180,50,0.12) 50%, transparent 70%)",
            }}
          />
          {/* Sun Core */}
          <div
            className="rounded-full"
            style={{
              width: "36px",
              height: "36px",
              background: "radial-gradient(circle at 35% 35%, #ffffff, #fff3b0 40%, #f59e0b 100%)",
              boxShadow: "0 0 45px rgba(251,191,36,0.65), 0 0 90px rgba(245,158,11,0.35)",
            }}
          />
        </div>
      )}

      {/* ── Moon with Craters & Glow ── */}
      {moonPos.visible && (
        <div
          className="absolute transition-all duration-700"
          style={{
            left: `${moonPos.x}%`,
            top: `${moonPos.y}%`,
            transform: "translate(-50%, -50%)",
            opacity: weather.cloudCoverage > 85 ? 0.3 : 1,
          }}
        >
          <div
            className="absolute rounded-full blur-2xl"
            style={{
              width: "140px",
              height: "140px",
              left: "-56px",
              top: "-56px",
              background: "radial-gradient(circle, rgba(210,225,245,0.28) 0%, rgba(180,205,235,0.1) 50%, transparent 70%)",
            }}
          />
          <div
            className="rounded-full relative overflow-hidden"
            style={{
              width: "28px",
              height: "28px",
              background: "radial-gradient(circle at 38% 35%, #f4f8ff, #d8e2ee, #b0c0d4)",
              boxShadow: "0 0 35px rgba(215,230,250,0.4), 0 0 70px rgba(180,205,235,0.2)",
            }}
          >
            <div className="absolute rounded-full w-1.5 h-1.5 top-1.5 left-2 bg-slate-400/40" />
            <div className="absolute rounded-full w-1 h-1 top-3.5 left-4 bg-slate-400/35" />
            <div className="absolute rounded-full w-1 h-1 top-2.5 left-1.5 bg-slate-400/30" />
          </div>
        </div>
      )}

      {/* ── Twinkling Stars (dimmed when cloudy) ── */}
      {isNight && (
        <div
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: Math.max(0.1, 1 - (weather.cloudCoverage / 100) * 0.85) }}
        >
          {STARS.map((star, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white animate-pulse"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: 0.65,
                animationDuration: `${star.twinkle}s`,
                animationDelay: `${star.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* ── Multi-Layer Volumetric Clouds (Modulated by Live Cloud Coverage & Wind) ── */}
      {weather.cloudCoverage > 15 && (
        <div className="absolute inset-0 overflow-hidden">
          {CLOUD_LAYERS.map((layer) => {
            const duration = layer.baseSpeed * cloudSpeedMultiplier;
            return (
              <div
                key={layer.id}
                className="absolute w-[450px] sm:w-[650px] h-[160px] sm:h-[220px] rounded-full filter blur-xl"
                style={{
                  top: `${layer.y}%`,
                  background: `radial-gradient(ellipse at center, ${cloudTint} 0%, transparent 70%)`,
                  opacity: layer.opacity * (weather.cloudCoverage / 70),
                  animation: `cloudDrift ${duration}s linear infinite`,
                  animationDelay: `${layer.delay}s`,
                  transform: `scale(${layer.scale})`,
                }}
              />
            );
          })}
        </div>
      )}

      {/* ── Live Rain Streaks System (Slanted by Wind) ── */}
      {isRaining && (
        <div className="absolute inset-0 overflow-hidden z-20 pointer-events-none">
          {RAIN_DROPS.map((drop, i) => (
            <div
              key={i}
              className="absolute bg-gradient-to-b from-white/20 via-sky-200/50 to-transparent rounded-full"
              style={{
                left: `${drop.x}%`,
                top: "-10%",
                width: "1.5px",
                height: `${drop.length}px`,
                opacity: drop.opacity * weather.rainIntensity,
                transform: `rotate(${weather.windDeg > 180 ? 12 : -12}deg)`,
                animation: `rainFall ${drop.duration}s linear infinite`,
                animationDelay: `${drop.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* ── Tropical Mist / Fog Atmospheric Layer ── */}
      {isMisty && (
        <div
          className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white/25 via-emerald-100/10 to-transparent blur-2xl z-10 pointer-events-none"
        />
      )}
    </div>
  );
}

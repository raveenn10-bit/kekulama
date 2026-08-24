"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useLiveWeather } from "@/hooks/useLiveWeather";

/* ─────────────────────────────────────────────
   Realistic Multi-Puff Cloud Shapes
   ───────────────────────────────────────────── */
const CLOUDS = [
  { id: 1, top: "5%", scale: 1.3, duration: 65, delay: 0, opacity: 0.92, zIndex: 3 },
  { id: 2, top: "14%", scale: 0.95, duration: 95, delay: -25, opacity: 0.88, zIndex: 2 },
  { id: 3, top: "24%", scale: 1.45, duration: 55, delay: -45, opacity: 0.95, zIndex: 4 },
  { id: 4, top: "35%", scale: 0.8, duration: 110, delay: -70, opacity: 0.82, zIndex: 1 },
  { id: 5, top: "8%", scale: 1.15, duration: 75, delay: -15, opacity: 0.90, zIndex: 3 },
  { id: 6, top: "20%", scale: 1.05, duration: 85, delay: -50, opacity: 0.85, zIndex: 2 },
  { id: 7, top: "42%", scale: 0.75, duration: 125, delay: -85, opacity: 0.78, zIndex: 1 },
  { id: 8, top: "2%", scale: 1.5, duration: 50, delay: -35, opacity: 0.94, zIndex: 4 },
];

/* ─────────────────────────────────────────────
   Deterministic Star System
   ───────────────────────────────────────────── */
const STARS = Array.from({ length: 60 }, (_, i) => ({
  x: ((i * 7 + 13) * 17) % 100,
  y: ((i * 11 + 7) * 23) % 70,
  size: 1.2 + (i % 3) * 0.8,
  delay: ((i * 3) % 7) * 0.5,
  twinkle: 2.2 + (i % 4) * 0.7,
}));

/* ─────────────────────────────────────────────
   Rain Streaks System
   ───────────────────────────────────────────── */
const RAIN_DROPS = Array.from({ length: 50 }, (_, i) => ({
  x: (i * 2 + ((i * 11) % 7)) % 100,
  duration: 0.55 + ((i * 3) % 5) * 0.08,
  delay: ((i * 7) % 10) * 0.06,
  length: 28 + (i % 20),
  opacity: 0.45 + ((i % 4) * 0.15),
}));

function getArcPosition(progress: number) {
  const x = 6 + progress * 88;
  const y = 85 - Math.sin(progress * Math.PI) * 70;
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

  // Lightning simulator for thunderstorms
  useEffect(() => {
    if (weather.condition !== "Thunderstorm") return;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const trigger = () => {
      setLightning(true);
      setTimeout(() => setLightning(false), 100);
      setTimeout(() => {
        setLightning(true);
        setTimeout(() => setLightning(false), 70);
      }, 180);

      timeout = setTimeout(trigger, 4000 + Math.random() * 7000);
    };

    timeout = setTimeout(trigger, 2500);
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [weather.condition]);

  const phase = useMemo(() => getSkyPhase(timeDecimal), [timeDecimal]);
  const isNight = phase === "night" || phase === "dusk" || phase === "dawn";

  // Vivid, High-Opacity Sky Gradient
  const skyGradient = useMemo(() => {
    if (weather.condition === "Thunderstorm") {
      return "linear-gradient(to bottom, #111728 0%, #1e2842 35%, #2a375a 70%, #1a233a 100%)";
    }
    if (weather.condition === "Rain") {
      return isNight
        ? "linear-gradient(to bottom, #0c1020 0%, #162038 40%, #202d4c 80%, #141c30 100%)"
        : "linear-gradient(to bottom, #3b495c 0%, #586b84 40%, #7b91ad 75%, #a0b6d1 100%)";
    }
    if (weather.condition === "Drizzle") {
      return isNight
        ? "linear-gradient(to bottom, #10162c 0%, #1d2745 45%, #2b3960 85%, #182038 100%)"
        : "linear-gradient(to bottom, #485b73 0%, #68809e 40%, #8ca6c6 75%, #b4cde8 100%)";
    }

    switch (phase) {
      case "dawn":
        return "linear-gradient(to bottom, #191932 0%, #202b54 25%, #3d4a78 50%, #f0a370 78%, #d9925e 100%)";
      case "sunrise":
        return "linear-gradient(to bottom, #3864a6 0%, #6da6d4 25%, #ffc885 55%, #ff8a43 80%, #f25524 100%)";
      case "morning":
        return "linear-gradient(to bottom, #2b7bc6 0%, #5eaee8 35%, #92d3f5 65%, #c8ebff 100%)";
      case "midday":
        return "linear-gradient(to bottom, #1d6fb8 0%, #469fe0 30%, #73c2f0 60%, #b8e4fc 100%)";
      case "afternoon":
        return "linear-gradient(to bottom, #2d7ebf 0%, #63a9d9 30%, #c4ab85 65%, #e8bc82 100%)";
      case "sunset":
        return "linear-gradient(to bottom, #242954 0%, #7d4d77 25%, #d96238 55%, #f57a28 80%, #f7c14a 100%)";
      case "dusk":
        return "linear-gradient(to bottom, #14142a 0%, #252d57 25%, #4e3d70 50%, #b85b77 75%, #e07758 100%)";
      case "night":
      default:
        return "linear-gradient(to bottom, #060714 0%, #0c142b 25%, #132247 50%, #17173d 75%, #0b0b1f 100%)";
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

  // Cloud Styling & Lighting based on Sun/Moon phase
  const cloudStyles = useMemo(() => {
    if (weather.condition === "Thunderstorm") {
      return {
        body: "linear-gradient(180deg, #3d475c 0%, #252c3c 100%)",
        shadow: "rgba(15, 20, 30, 0.9)",
        highlight: "rgba(80, 95, 120, 0.4)",
      };
    }
    if (weather.condition === "Rain") {
      return {
        body: "linear-gradient(180deg, #68798e 0%, #455364 100%)",
        shadow: "rgba(35, 45, 58, 0.8)",
        highlight: "rgba(130, 150, 175, 0.5)",
      };
    }
    if (phase === "sunrise") {
      return {
        body: "linear-gradient(180deg, #fff3e6 0%, #ffc099 50%, #f07b46 100%)",
        shadow: "rgba(180, 70, 30, 0.6)",
        highlight: "rgba(255, 240, 220, 0.95)",
      };
    }
    if (phase === "sunset") {
      return {
        body: "linear-gradient(180deg, #ffe0cc 0%, #f79968 50%, #d44d28 100%)",
        shadow: "rgba(150, 40, 20, 0.7)",
        highlight: "rgba(255, 225, 180, 0.95)",
      };
    }
    if (phase === "dusk" || phase === "dawn") {
      return {
        body: "linear-gradient(180deg, #cfbde0 0%, #8d73a8 50%, #584173 100%)",
        shadow: "rgba(40, 25, 60, 0.7)",
        highlight: "rgba(235, 215, 250, 0.85)",
      };
    }
    if (isNight) {
      return {
        body: "linear-gradient(180deg, #2b3958 0%, #192338 50%, #0e1624 100%)",
        shadow: "rgba(5, 10, 20, 0.85)",
        highlight: "rgba(100, 130, 180, 0.6)",
      };
    }
    // Daylight clear/bright
    return {
      body: "linear-gradient(180deg, #ffffff 0%, #e8f4fc 60%, #c4e0f5 100%)",
      shadow: "rgba(70, 120, 170, 0.35)",
      highlight: "rgba(255, 255, 255, 1)",
    };
  }, [phase, weather.condition, isNight]);

  // Wind multiplier for speed
  const speedMult = useMemo(() => {
    const spd = Math.max(8, weather.windSpeed);
    return 18 / spd;
  }, [weather.windSpeed]);

  if (!mounted) return null;

  const isRaining = weather.condition === "Rain" || weather.condition === "Drizzle" || weather.condition === "Thunderstorm";

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* ── High-Contrast Vibrant Sky Base Gradient ── */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{ background: skyGradient, opacity: 0.95 }}
      />

      {/* ── Lightning flash ── */}
      {lightning && (
        <div className="absolute inset-0 bg-white/60 z-30 transition-opacity duration-75" />
      )}

      {/* ── Sun with Radiant Corona Flare ── */}
      {sunPos.visible && (
        <div
          className="absolute transition-all duration-700 z-10"
          style={{
            left: `${sunPos.x}%`,
            top: `${sunPos.y}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          {/* Intense Outer Flare */}
          <div
            className="absolute rounded-full blur-3xl"
            style={{
              width: "260px",
              height: "260px",
              left: "-108px",
              top: "-108px",
              background: phase === "sunset" || phase === "sunrise"
                ? "radial-gradient(circle, rgba(255,120,40,0.65) 0%, rgba(255,80,20,0.3) 45%, transparent 70%)"
                : "radial-gradient(circle, rgba(255,230,120,0.6) 0%, rgba(255,190,60,0.25) 45%, transparent 70%)",
            }}
          />
          {/* Sun Core */}
          <div
            className="rounded-full relative"
            style={{
              width: "44px",
              height: "44px",
              background: "radial-gradient(circle at 35% 35%, #ffffff, #fff4b8 35%, #f59e0b 80%, #d97706 100%)",
              boxShadow: "0 0 50px rgba(251,191,36,0.9), 0 0 100px rgba(245,158,11,0.6), 0 0 150px rgba(217,119,6,0.35)",
            }}
          />
        </div>
      )}

      {/* ── Moon with Glowing Halo ── */}
      {moonPos.visible && (
        <div
          className="absolute transition-all duration-700 z-10"
          style={{
            left: `${moonPos.x}%`,
            top: `${moonPos.y}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            className="absolute rounded-full blur-2xl"
            style={{
              width: "180px",
              height: "180px",
              left: "-72px",
              top: "-72px",
              background: "radial-gradient(circle, rgba(220,235,255,0.45) 0%, rgba(180,210,245,0.18) 50%, transparent 70%)",
            }}
          />
          <div
            className="rounded-full relative overflow-hidden"
            style={{
              width: "36px",
              height: "36px",
              background: "radial-gradient(circle at 38% 35%, #ffffff, #e0ebf8 45%, #b4c6dc 100%)",
              boxShadow: "0 0 40px rgba(225,240,255,0.7), 0 0 80px rgba(180,210,250,0.35)",
            }}
          >
            <div className="absolute rounded-full w-2 h-2 top-2 left-2.5 bg-slate-400/50" />
            <div className="absolute rounded-full w-1.5 h-1.5 top-4.5 left-5 bg-slate-400/40" />
            <div className="absolute rounded-full w-1.5 h-1.5 top-3.5 left-2 bg-slate-400/35" />
          </div>
        </div>
      )}

      {/* ── Twinkling Night Stars ── */}
      {isNight && (
        <div className="absolute inset-0 z-0">
          {STARS.map((star, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white animate-pulse"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: 0.85,
                animationDuration: `${star.twinkle}s`,
                animationDelay: `${star.delay}s`,
                boxShadow: "0 0 4px rgba(255,255,255,0.9)",
              }}
            />
          ))}
        </div>
      )}

      {/* ── Prominent Volumetric Multi-Puff Cumulus Clouds ── */}
      <div className="absolute inset-0 overflow-hidden z-20 pointer-events-none">
        {CLOUDS.map((cloud) => {
          const duration = cloud.duration * speedMult;
          return (
            <div
              key={cloud.id}
              className="absolute"
              style={{
                top: cloud.top,
                opacity: cloud.opacity,
                zIndex: cloud.zIndex,
                animation: `cloudDrift ${duration}s linear infinite`,
                animationDelay: `${cloud.delay}s`,
                transform: `scale(${cloud.scale})`,
              }}
            >
              {/* Sculpted Cumulus Cloud Cluster */}
              <div className="relative w-[340px] sm:w-[480px] h-[130px] sm:h-[160px]">
                {/* Main center puff */}
                <div
                  className="absolute w-[180px] sm:w-[240px] h-[110px] sm:h-[140px] rounded-full left-[80px] sm:left-[120px] top-0 filter blur-[2px]"
                  style={{
                    background: cloudStyles.body,
                    boxShadow: `inset 0 8px 18px ${cloudStyles.highlight}, 0 14px 28px ${cloudStyles.shadow}`,
                  }}
                />
                {/* Left puff */}
                <div
                  className="absolute w-[130px] sm:w-[170px] h-[90px] sm:h-[115px] rounded-full left-0 top-[25px] sm:top-[30px] filter blur-[2px]"
                  style={{
                    background: cloudStyles.body,
                    boxShadow: `inset 0 6px 14px ${cloudStyles.highlight}, 0 10px 20px ${cloudStyles.shadow}`,
                  }}
                />
                {/* Right puff */}
                <div
                  className="absolute w-[150px] sm:w-[200px] h-[95px] sm:h-[125px] rounded-full right-0 top-[20px] sm:top-[25px] filter blur-[2px]"
                  style={{
                    background: cloudStyles.body,
                    boxShadow: `inset 0 6px 14px ${cloudStyles.highlight}, 0 12px 22px ${cloudStyles.shadow}`,
                  }}
                />
                {/* Bottom soft mist puff */}
                <div
                  className="absolute w-[280px] sm:w-[380px] h-[70px] sm:h-[90px] rounded-full left-[30px] sm:left-[50px] bottom-0 filter blur-[6px]"
                  style={{
                    background: cloudStyles.body,
                    opacity: 0.9,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Live Rain Streaks System ── */}
      {isRaining && (
        <div className="absolute inset-0 overflow-hidden z-25 pointer-events-none">
          {RAIN_DROPS.map((drop, i) => (
            <div
              key={i}
              className="absolute bg-gradient-to-b from-white/40 via-sky-200/70 to-transparent rounded-full shadow-sm"
              style={{
                left: `${drop.x}%`,
                top: "-10%",
                width: "2px",
                height: `${drop.length}px`,
                opacity: drop.opacity * Math.max(0.6, weather.rainIntensity),
                transform: `rotate(${weather.windDeg > 180 ? 14 : -14}deg)`,
                animation: `rainFall ${drop.duration}s linear infinite`,
                animationDelay: `${drop.delay}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

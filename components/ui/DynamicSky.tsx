"use client";

import React, { useState, useEffect, useMemo } from "react";

/* ─────────────────────────────────────────────
   Deterministic stars (avoids hydration mismatch)
   ───────────────────────────────────────────── */
const STARS = Array.from({ length: 50 }, (_, i) => ({
  x: ((i * 7 + 13) * 17) % 100,
  y: ((i * 11 + 7) * 23) % 70,
  size: 1 + (i % 3),
  delay: ((i * 3) % 7) * 0.6,
  twinkle: 2.5 + (i % 4) * 0.8,
}));

/* ─────────────────────────────────────────────
   Arc position helper
   Sun/Moon travel a parabolic arc across the sky
   progress: 0 → rise (left), 0.5 → zenith (top), 1 → set (right)
   ───────────────────────────────────────────── */
function getArcPosition(progress: number) {
  const x = 8 + progress * 84;                        // 8% → 92% horizontal
  const y = 88 - Math.sin(progress * Math.PI) * 72;   // arc peaking at ~16% from top
  return { x, y };
}

/* ─────────────────────────────────────────────
   Sky phase from decimal hour
   ───────────────────────────────────────────── */
type SkyPhase = "dawn" | "sunrise" | "morning" | "midday" | "afternoon" | "sunset" | "dusk" | "night";

function getSkyPhase(t: number): SkyPhase {
  if (t >= 4.5 && t < 5.5) return "dawn";
  if (t >= 5.5 && t < 7)   return "sunrise";
  if (t >= 7 && t < 11)    return "morning";
  if (t >= 11 && t < 14)   return "midday";
  if (t >= 14 && t < 16.5) return "afternoon";
  if (t >= 16.5 && t < 18) return "sunset";
  if (t >= 18 && t < 19.5) return "dusk";
  return "night";
}

/* ─────────────────────────────────────────────
   Gradient palettes per phase
   ───────────────────────────────────────────── */
const SKY_GRADIENTS: Record<SkyPhase, string> = {
  dawn:      "linear-gradient(to bottom, #1a1a2e 0%, #16213e 20%, #2d4059 45%, #e8a87c 75%, #d4a574 100%)",
  sunrise:   "linear-gradient(to bottom, #4a6fa5 0%, #7fb3d3 25%, #ffd4a2 55%, #ff9a5c 80%, #ff6b35 100%)",
  morning:   "linear-gradient(to bottom, #5b9bd5 0%, #87ceeb 35%, #b0e0e6 65%, #e0f0ff 100%)",
  midday:    "linear-gradient(to bottom, #4a90d9 0%, #6bb3e0 30%, #87ceeb 60%, #d4edfc 100%)",
  afternoon: "linear-gradient(to bottom, #5a9fd4 0%, #87b8d9 30%, #d4b896 65%, #e8c89e 100%)",
  sunset:    "linear-gradient(to bottom, #2d3561 0%, #8b5e83 25%, #e07c5a 55%, #ff8c42 80%, #ffd166 100%)",
  dusk:      "linear-gradient(to bottom, #1a1a2e 0%, #2d3561 25%, #5c4d7d 50%, #c06c84 75%, #e88c6a 100%)",
  night:     "linear-gradient(to bottom, #0a0a1a 0%, #0f1729 25%, #162447 50%, #1a1a3e 75%, #0f0f23 100%)",
};

/* ═══════════════════════════════════════════════
   DynamicSky Component
   ═══════════════════════════════════════════════ */
export default function DynamicSky() {
  const [mounted, setMounted] = useState(false);
  const [timeDecimal, setTimeDecimal] = useState(12);

  useEffect(() => {
    setMounted(true);
    const update = () => {
      const now = new Date();
      setTimeDecimal(now.getHours() + now.getMinutes() / 60);
    };
    update();
    const timer = setInterval(update, 30000); // update every 30s
    return () => clearInterval(timer);
  }, []);

  /* — Sky phase & gradient — */
  const phase = useMemo(() => getSkyPhase(timeDecimal), [timeDecimal]);
  const skyGradient = SKY_GRADIENTS[phase];
  const isNight = phase === "night" || phase === "dusk" || phase === "dawn";

  /* — Sun position (visible ~5:30 AM → 18:00) — */
  const sunPos = useMemo(() => {
    if (timeDecimal >= 5.5 && timeDecimal <= 18) {
      const progress = (timeDecimal - 5.5) / 12.5;
      return { ...getArcPosition(progress), visible: true, progress };
    }
    return { x: -20, y: 100, visible: false, progress: 0 };
  }, [timeDecimal]);

  /* — Moon position (visible ~18:00 → 6:00) — */
  const moonPos = useMemo(() => {
    let progress: number;
    if (timeDecimal >= 18) {
      progress = (timeDecimal - 18) / 12;
    } else if (timeDecimal < 6) {
      progress = (timeDecimal + 6) / 12;
    } else {
      return { x: -20, y: 100, visible: false, progress: 0 };
    }
    return { ...getArcPosition(progress), visible: true, progress };
  }, [timeDecimal]);

  /* — Sun glow intensity (stronger at horizon, softer at zenith) — */
  const sunGlowOpacity = useMemo(() => {
    if (!sunPos.visible) return 0;
    const horizonFactor = 1 - Math.sin(sunPos.progress * Math.PI) * 0.5;
    return horizonFactor;
  }, [sunPos]);

  /* — Sun color (golden at horizon, white-ish at zenith) — */
  const sunColor = useMemo(() => {
    if (!sunPos.visible) return "#fbbf24";
    if (phase === "sunrise") return "#ff8c42";
    if (phase === "sunset") return "#ff6b35";
    return "#fbbf24";
  }, [sunPos.visible, phase]);

  // Respect prefers-reduced-motion
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* ── Sky gradient ── */}
      <div
        className="absolute inset-0"
        style={{
          background: skyGradient,
          transition: "background 60s ease-in-out",
        }}
      />

      {/* ── Sun ── */}
      {sunPos.visible && (
        <div
          className="absolute"
          style={{
            left: `${sunPos.x}%`,
            top: `${sunPos.y}%`,
            transform: "translate(-50%, -50%)",
            transition: reducedMotion ? "none" : "left 30s linear, top 30s linear",
          }}
        >
          {/* Atmospheric glow ring */}
          <div
            className="absolute rounded-full blur-3xl"
            style={{
              width: "160px",
              height: "160px",
              left: "-64px",
              top: "-64px",
              background: `radial-gradient(circle, ${sunColor}30 0%, ${sunColor}10 50%, transparent 70%)`,
              opacity: sunGlowOpacity,
              transition: "opacity 30s ease",
            }}
          />
          {/* Mid glow */}
          <div
            className="absolute rounded-full blur-xl"
            style={{
              width: "80px",
              height: "80px",
              left: "-24px",
              top: "-24px",
              background: `radial-gradient(circle, ${sunColor}50 0%, ${sunColor}20 60%, transparent 100%)`,
              transition: "background 30s ease",
            }}
          />
          {/* Sun core */}
          <div
            className="rounded-full shadow-lg"
            style={{
              width: "32px",
              height: "32px",
              background: `radial-gradient(circle at 35% 35%, #fff9e6, ${sunColor}, #f59e0b)`,
              boxShadow: `0 0 40px ${sunColor}60, 0 0 80px ${sunColor}30`,
              transition: "background 30s ease, box-shadow 30s ease",
            }}
          />
        </div>
      )}

      {/* ── Moon ── */}
      {moonPos.visible && (
        <div
          className="absolute"
          style={{
            left: `${moonPos.x}%`,
            top: `${moonPos.y}%`,
            transform: "translate(-50%, -50%)",
            transition: reducedMotion ? "none" : "left 30s linear, top 30s linear",
          }}
        >
          {/* Moon glow */}
          <div
            className="absolute rounded-full blur-2xl"
            style={{
              width: "120px",
              height: "120px",
              left: "-48px",
              top: "-48px",
              background: "radial-gradient(circle, rgba(200,210,230,0.2) 0%, rgba(150,170,200,0.08) 50%, transparent 70%)",
            }}
          />
          {/* Moon body */}
          <div
            className="rounded-full relative overflow-hidden"
            style={{
              width: "26px",
              height: "26px",
              background: "radial-gradient(circle at 40% 35%, #f0f4ff, #d4dce8, #b8c4d4)",
              boxShadow: "0 0 30px rgba(200,215,240,0.35), 0 0 60px rgba(180,200,230,0.15)",
            }}
          >
            {/* Moon craters */}
            <div
              className="absolute rounded-full"
              style={{
                width: "5px",
                height: "5px",
                top: "6px",
                left: "8px",
                background: "rgba(180,190,210,0.5)",
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                width: "3px",
                height: "3px",
                top: "14px",
                left: "15px",
                background: "rgba(180,190,210,0.4)",
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                width: "4px",
                height: "4px",
                top: "10px",
                left: "5px",
                background: "rgba(180,190,210,0.35)",
              }}
            />
          </div>
        </div>
      )}

      {/* ── Stars (night / dusk / dawn) ── */}
      {isNight && (
        <div className="absolute inset-0">
          {STARS.map((star, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: phase === "dawn" || phase === "dusk" ? 0.25 : 0.55,
                animation: reducedMotion
                  ? "none"
                  : `twinkle ${star.twinkle}s ease-in-out ${star.delay}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      {/* ── Horizon glow (sunrise / sunset) ── */}
      {(phase === "sunrise" || phase === "sunset") && (
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: "40%",
            background:
              phase === "sunrise"
                ? "radial-gradient(ellipse at 30% 100%, rgba(255,150,80,0.25) 0%, transparent 60%)"
                : "radial-gradient(ellipse at 70% 100%, rgba(255,100,50,0.3) 0%, transparent 60%)",
            transition: "background 60s ease",
          }}
        />
      )}
    </div>
  );
}

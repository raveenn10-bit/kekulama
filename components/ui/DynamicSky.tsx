"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useLiveWeather } from "@/hooks/useLiveWeather";

/* ─────────────────────────────────────────────
   3D Volumetric Cloud Clusters with 3D Depth
   ───────────────────────────────────────────── */
const CLOUDS_3D = [
  { id: 1, top: "4%", scale: 1.4, duration: 60, delay: 0, depthZ: 80, blur: "1px", opacity: 0.95 },
  { id: 2, top: "14%", scale: 0.9, duration: 90, delay: -22, depthZ: -40, blur: "3px", opacity: 0.85 },
  { id: 3, top: "22%", scale: 1.5, duration: 52, delay: -40, depthZ: 100, blur: "0px", opacity: 0.98 },
  { id: 4, top: "34%", scale: 0.75, duration: 110, delay: -65, depthZ: -80, blur: "4px", opacity: 0.75 },
  { id: 5, top: "7%", scale: 1.2, duration: 70, delay: -12, depthZ: 40, blur: "2px", opacity: 0.90 },
  { id: 6, top: "18%", scale: 1.05, duration: 80, delay: -48, depthZ: 0, blur: "2px", opacity: 0.88 },
  { id: 7, top: "40%", scale: 0.7, duration: 120, delay: -80, depthZ: -100, blur: "5px", opacity: 0.70 },
  { id: 8, top: "1%", scale: 1.6, duration: 46, delay: -30, depthZ: 120, blur: "0px", opacity: 0.96 },
];

const STARS = Array.from({ length: 65 }, (_, i) => ({
  x: ((i * 7 + 13) * 17) % 100,
  y: ((i * 11 + 7) * 23) % 70,
  size: 1.2 + (i % 3) * 0.8,
  delay: ((i * 3) % 7) * 0.5,
  twinkle: 2.2 + (i % 4) * 0.7,
}));

const RAIN_DROPS = Array.from({ length: 55 }, (_, i) => ({
  x: (i * 1.9 + ((i * 11) % 7)) % 100,
  duration: 0.5 + ((i * 3) % 5) * 0.08,
  delay: ((i * 7) % 10) * 0.05,
  length: 32 + (i % 24),
  opacity: 0.5 + ((i % 4) * 0.15),
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
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
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

    // Subtle 3D Parallax on pointer move
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 15;
      setMouseOffset({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      clearInterval(timer);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Lightning simulator
  useEffect(() => {
    if (weather.condition !== "Thunderstorm") return;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const trigger = () => {
      setLightning(true);
      setTimeout(() => setLightning(false), 90);
      setTimeout(() => {
        setLightning(true);
        setTimeout(() => setLightning(false), 60);
      }, 160);

      timeout = setTimeout(trigger, 3500 + Math.random() * 6000);
    };

    timeout = setTimeout(trigger, 2000);
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [weather.condition]);

  const phase = useMemo(() => getSkyPhase(timeDecimal), [timeDecimal]);
  const isNight = phase === "night" || phase === "dusk" || phase === "dawn";

  // Vivid 3D Sky Gradients
  const skyGradient = useMemo(() => {
    if (weather.condition === "Thunderstorm") {
      return "linear-gradient(to bottom, #0f1424 0%, #1c263e 35%, #253352 70%, #151d2f 100%)";
    }
    if (weather.condition === "Rain") {
      return isNight
        ? "linear-gradient(to bottom, #090d1c 0%, #131d33 40%, #1c2a47 80%, #0f1728 100%)"
        : "linear-gradient(to bottom, #384659 0%, #52657d 40%, #758ca6 75%, #9ab1cc 100%)";
    }
    if (weather.condition === "Drizzle") {
      return isNight
        ? "linear-gradient(to bottom, #0d1326 0%, #1a243e 45%, #263556 85%, #131a2d 100%)"
        : "linear-gradient(to bottom, #42556d 0%, #607796 40%, #839dbd 75%, #a9c3df 100%)";
    }

    switch (phase) {
      case "dawn":
        return "linear-gradient(to bottom, #181932 0%, #202b54 25%, #3d4a78 50%, #f0a370 78%, #d9925e 100%)";
      case "sunrise":
        return "linear-gradient(to bottom, #3561a3 0%, #68a2d1 25%, #ffc680 55%, #ff853d 80%, #ee4e1c 100%)";
      case "morning":
        return "linear-gradient(to bottom, #2376c4 0%, #56aae7 35%, #8dd0f5 65%, #c5e9ff 100%)";
      case "midday":
        return "linear-gradient(to bottom, #176bb4 0%, #3f9be0 30%, #6dc0f0 60%, #b4e2fc 100%)";
      case "afternoon":
        return "linear-gradient(to bottom, #2679bd 0%, #5da4d6 30%, #c0a67f 65%, #e5b77c 100%)";
      case "sunset":
        return "linear-gradient(to bottom, #202550 0%, #764771 25%, #d45c32 55%, #f27320 80%, #f5bd42 100%)";
      case "dusk":
        return "linear-gradient(to bottom, #121226 0%, #222a53 25%, #48386a 50%, #b25470 75%, #db7050 100%)";
      case "night":
      default:
        return "linear-gradient(to bottom, #050612 0%, #0a1126 25%, #101e3f 50%, #141436 75%, #08081a 100%)";
    }
  }, [phase, weather.condition, isNight]);

  const sunPos = useMemo(() => {
    if (timeDecimal >= 5.5 && timeDecimal <= 18) {
      const progress = (timeDecimal - 5.5) / 12.5;
      return { ...getArcPosition(progress), visible: true, progress };
    }
    return { x: -20, y: 100, visible: false, progress: 0 };
  }, [timeDecimal]);

  const moonPos = useMemo(() => {
    let progress: number;
    if (timeDecimal >= 18) progress = (timeDecimal - 18) / 12;
    else if (timeDecimal < 6) progress = (timeDecimal + 6) / 12;
    else return { x: -20, y: 100, visible: false, progress: 0 };
    return { ...getArcPosition(progress), visible: true, progress };
  }, [timeDecimal]);

  // 3D Lighting and specular gradients
  const cloudStyles = useMemo(() => {
    if (weather.condition === "Thunderstorm") {
      return {
        body: "radial-gradient(ellipse at 50% 25%, #4b5770 0%, #30394c 55%, #1a202d 100%)",
        shadow: "0 22px 45px rgba(10, 15, 25, 0.95), inset 0 -12px 25px rgba(5, 10, 18, 0.8)",
        highlight: "inset 0 10px 22px rgba(120, 140, 175, 0.6)",
      };
    }
    if (weather.condition === "Rain") {
      return {
        body: "radial-gradient(ellipse at 50% 25%, #7a8c9f 0%, #576779 55%, #384453 100%)",
        shadow: "0 20px 40px rgba(25, 35, 48, 0.85), inset 0 -10px 20px rgba(15, 25, 35, 0.7)",
        highlight: "inset 0 10px 20px rgba(165, 185, 210, 0.6)",
      };
    }
    if (phase === "sunrise") {
      return {
        body: "radial-gradient(ellipse at 50% 20%, #fff7eb 0%, #ffcba3 45%, #ea7038 90%, #b84318 100%)",
        shadow: "0 22px 44px rgba(160, 50, 20, 0.75), inset 0 -12px 22px rgba(120, 30, 10, 0.6)",
        highlight: "inset 0 14px 28px rgba(255, 245, 230, 0.95)",
      };
    }
    if (phase === "sunset") {
      return {
        body: "radial-gradient(ellipse at 50% 20%, #ffe9d6 0%, #f9a473 45%, #cf431d 90%, #9e2808 100%)",
        shadow: "0 24px 48px rgba(130, 30, 10, 0.8), inset 0 -14px 24px rgba(90, 20, 5, 0.7)",
        highlight: "inset 0 14px 28px rgba(255, 235, 200, 0.95)",
      };
    }
    if (phase === "dusk" || phase === "dawn") {
      return {
        body: "radial-gradient(ellipse at 50% 20%, #d8c6eb 0%, #9b7fba 45%, #60457d 90%, #3e2857 100%)",
        shadow: "0 20px 40px rgba(35, 20, 50, 0.8), inset 0 -10px 20px rgba(20, 10, 35, 0.7)",
        highlight: "inset 0 10px 22px rgba(240, 225, 255, 0.85)",
      };
    }
    if (isNight) {
      return {
        body: "radial-gradient(ellipse at 50% 20%, #34466d 0%, #1f2d47 50%, #10192a 90%, #080d16 100%)",
        shadow: "0 22px 44px rgba(4, 7, 15, 0.9), inset 0 -12px 22px rgba(2, 4, 10, 0.8)",
        highlight: "inset 0 10px 20px rgba(120, 160, 220, 0.65)",
      };
    }
    // High-noon / Daytime 3D billowy cloud
    return {
      body: "radial-gradient(ellipse at 50% 15%, #ffffff 0%, #f2f9ff 45%, #cfe4f7 85%, #a8cce8 100%)",
      shadow: "0 20px 40px rgba(50, 100, 150, 0.35), inset 0 -10px 20px rgba(60, 110, 160, 0.25)",
      highlight: "inset 0 12px 25px rgba(255, 255, 255, 1)",
    };
  }, [phase, weather.condition, isNight]);

  const speedMult = useMemo(() => {
    const spd = Math.max(8, weather.windSpeed);
    return 18 / spd;
  }, [weather.windSpeed]);

  if (!mounted) return null;

  const isRaining = weather.condition === "Rain" || weather.condition === "Drizzle" || weather.condition === "Thunderstorm";

  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
      style={{ perspective: "1200px" }}
      aria-hidden="true"
    >
      {/* ── 3D Parallax Canvas Layer ── */}
      <div
        className="absolute inset-0 transition-transform duration-300 ease-out"
        style={{
          transform: `rotateY(${mouseOffset.x * 0.15}deg) rotateX(${-mouseOffset.y * 0.15}deg) translateZ(0)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Base Sky Gradient */}
        <div
          className="absolute inset-0 transition-all duration-1000"
          style={{ background: skyGradient, opacity: 0.98 }}
        />

        {/* ── Sun Rays / God Rays (Light Scattering) ── */}
        {sunPos.visible && (
          <div
            className="absolute z-5 pointer-events-none opacity-40 mix-blend-screen"
            style={{
              left: `${sunPos.x}%`,
              top: `${sunPos.y}%`,
              width: "800px",
              height: "800px",
              transform: "translate(-50%, -50%)",
              background: "radial-gradient(circle, rgba(255,230,150,0.5) 0%, rgba(255,180,80,0.2) 30%, transparent 65%)",
            }}
          />
        )}

        {/* Lightning Flash */}
        {lightning && (
          <div className="absolute inset-0 bg-white/70 z-30 transition-opacity duration-75" />
        )}

        {/* ── 3D Sun ── */}
        {sunPos.visible && (
          <div
            className="absolute transition-all duration-700 z-10"
            style={{
              left: `${sunPos.x}%`,
              top: `${sunPos.y}%`,
              transform: `translate(-50%, -50%) translateZ(40px)`,
            }}
          >
            <div
              className="absolute rounded-full blur-3xl"
              style={{
                width: "300px",
                height: "300px",
                left: "-126px",
                top: "-126px",
                background: phase === "sunset" || phase === "sunrise"
                  ? "radial-gradient(circle, rgba(255,110,30,0.7) 0%, rgba(255,70,10,0.3) 45%, transparent 70%)"
                  : "radial-gradient(circle, rgba(255,225,100,0.65) 0%, rgba(255,180,50,0.3) 45%, transparent 70%)",
              }}
            />
            <div
              className="rounded-full relative"
              style={{
                width: "48px",
                height: "48px",
                background: "radial-gradient(circle at 35% 35%, #ffffff, #fff3a8 35%, #f59e0b 80%, #d97706 100%)",
                boxShadow: "0 0 60px rgba(251,191,36,0.95), 0 0 120px rgba(245,158,11,0.65), 0 0 180px rgba(217,119,6,0.4)",
              }}
            />
          </div>
        )}

        {/* ── 3D Moon ── */}
        {moonPos.visible && (
          <div
            className="absolute transition-all duration-700 z-10"
            style={{
              left: `${moonPos.x}%`,
              top: `${moonPos.y}%`,
              transform: `translate(-50%, -50%) translateZ(30px)`,
            }}
          >
            <div
              className="absolute rounded-full blur-2xl"
              style={{
                width: "200px",
                height: "200px",
                left: "-80px",
                top: "-80px",
                background: "radial-gradient(circle, rgba(220,235,255,0.5) 0%, rgba(180,210,245,0.2) 50%, transparent 70%)",
              }}
            />
            <div
              className="rounded-full relative overflow-hidden"
              style={{
                width: "40px",
                height: "40px",
                background: "radial-gradient(circle at 38% 35%, #ffffff, #e0ebf8 45%, #b4c6dc 100%)",
                boxShadow: "0 0 45px rgba(225,240,255,0.8), 0 0 90px rgba(180,210,250,0.4)",
              }}
            >
              <div className="absolute rounded-full w-2.5 h-2.5 top-2 left-3 bg-slate-400/50" />
              <div className="absolute rounded-full w-2 h-2 top-5 left-6 bg-slate-400/40" />
              <div className="absolute rounded-full w-1.5 h-1.5 top-4 left-2.5 bg-slate-400/35" />
            </div>
          </div>
        )}

        {/* ── Twinkling Stars ── */}
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
                  opacity: 0.9,
                  animationDuration: `${star.twinkle}s`,
                  animationDelay: `${star.delay}s`,
                  boxShadow: "0 0 5px rgba(255,255,255,0.95)",
                }}
              />
            ))}
          </div>
        )}

        {/* ── Multi-Plane 3D Volumetric Cloud Clusters ── */}
        <div className="absolute inset-0 overflow-hidden z-20 pointer-events-none">
          {CLOUDS_3D.map((cloud) => {
            const duration = cloud.duration * speedMult;
            return (
              <div
                key={cloud.id}
                className="absolute"
                style={{
                  top: cloud.top,
                  opacity: cloud.opacity,
                  filter: `blur(${cloud.blur})`,
                  animation: `cloudDrift ${duration}s linear infinite`,
                  animationDelay: `${cloud.delay}s`,
                  transform: `translateZ(${cloud.depthZ}px) scale(${cloud.scale})`,
                }}
              >
                {/* Sculpted 3D Multi-Sphere Volumetric Cluster */}
                <div className="relative w-[360px] sm:w-[500px] h-[140px] sm:h-[180px]">
                  {/* Central massive dome */}
                  <div
                    className="absolute w-[200px] sm:w-[260px] h-[120px] sm:h-[155px] rounded-full left-[80px] sm:left-[120px] top-0"
                    style={{
                      background: cloudStyles.body,
                      boxShadow: `${cloudStyles.shadow}, ${cloudStyles.highlight}`,
                    }}
                  />
                  {/* Left billowing dome */}
                  <div
                    className="absolute w-[140px] sm:w-[190px] h-[100px] sm:h-[130px] rounded-full left-0 top-[25px] sm:top-[30px]"
                    style={{
                      background: cloudStyles.body,
                      boxShadow: `${cloudStyles.shadow}, ${cloudStyles.highlight}`,
                    }}
                  />
                  {/* Right billowing dome */}
                  <div
                    className="absolute w-[160px] sm:w-[210px] h-[105px] sm:h-[135px] rounded-full right-0 top-[20px] sm:top-[25px]"
                    style={{
                      background: cloudStyles.body,
                      boxShadow: `${cloudStyles.shadow}, ${cloudStyles.highlight}`,
                    }}
                  />
                  {/* Bottom atmospheric soft base */}
                  <div
                    className="absolute w-[300px] sm:w-[420px] h-[75px] sm:h-[100px] rounded-full left-[30px] sm:left-[45px] bottom-0"
                    style={{
                      background: cloudStyles.body,
                      filter: "blur(8px)",
                      opacity: 0.95,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* ── 3D Rain Streaks ── */}
        {isRaining && (
          <div className="absolute inset-0 overflow-hidden z-25 pointer-events-none">
            {RAIN_DROPS.map((drop, i) => (
              <div
                key={i}
                className="absolute bg-gradient-to-b from-white/50 via-sky-200/80 to-transparent rounded-full shadow-sm"
                style={{
                  left: `${drop.x}%`,
                  top: "-10%",
                  width: "2px",
                  height: `${drop.length}px`,
                  opacity: drop.opacity * Math.max(0.65, weather.rainIntensity),
                  transform: `rotate(${weather.windDeg > 180 ? 14 : -14}deg) translateZ(50px)`,
                  animation: `rainFall ${drop.duration}s linear infinite`,
                  animationDelay: `${drop.delay}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

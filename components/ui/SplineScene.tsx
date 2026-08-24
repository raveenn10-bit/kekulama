"use client";

import React, { useState, useEffect } from "react";
import Script from "next/script";
import { Sparkles, Compass } from "lucide-react";

interface SplineSceneProps {
  sceneUrl?: string;
  className?: string;
  badgeText?: string;
}

export default function SplineScene({
  sceneUrl = "https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode",
  className = "w-full h-[450px] sm:h-[550px] lg:h-[620px]",
  badgeText = "Interactive 3D Sanctuary Experience",
}: SplineSceneProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Script
        type="module"
        src="https://unpkg.com/@splinetool/viewer@1.9.72/build/spline-viewer.js"
        strategy="lazyOnload"
      />

      <div
        className={`relative rounded-3xl overflow-hidden bg-gradient-to-b from-forest-dark/95 via-forest/90 to-forest-dark border border-white/10 shadow-lifted ${className}`}
      >
        {/* Top Floating Badge */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 pointer-events-none">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-mint-200 text-xs font-medium shadow-sm">
            <Sparkles size={13} className="text-mint-300 animate-pulse" />
            <span className="font-eyebrow uppercase tracking-[0.16em] text-[10px] sm:text-xs">
              {badgeText}
            </span>
          </div>
        </div>

        {/* Interactive Drag Hint */}
        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-20 pointer-events-none">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-sage-200 text-[10px] sm:text-xs">
            <Compass size={13} className="text-mint-300" />
            <span>Drag & Rotate 3D</span>
          </div>
        </div>

        {/* Spline 3D Viewer Web Component */}
        {/* @ts-ignore */}
        <spline-viewer
          loading-anim-type="spinner-small-dark"
          url={sceneUrl}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </>
  );
}

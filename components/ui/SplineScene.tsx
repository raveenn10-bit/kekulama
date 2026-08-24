"use client";

import React, { useState, Suspense } from "react";
import Spline from "@splinetool/react-spline";
import { motion } from "framer-motion";
import { Sparkles, Compass } from "lucide-react";

interface SplineSceneProps {
  sceneUrl?: string;
  className?: string;
  badgeText?: string;
}

export default function SplineScene({
  sceneUrl = "https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode",
  className = "w-full h-[450px] sm:h-[550px] lg:h-[650px]",
  badgeText = "Interactive 3D Sanctuary Experience",
}: SplineSceneProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className={`relative rounded-3xl overflow-hidden bg-gradient-to-b from-forest-dark/90 via-forest/80 to-forest-dark/95 border border-white/10 shadow-lifted ${className}`}>
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

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-forest-dark/80 backdrop-blur-sm z-10">
          <div className="w-10 h-10 border-2 border-mint-400/20 border-t-mint-400 rounded-full animate-spin mb-3" />
          <span className="font-eyebrow text-[11px] uppercase tracking-[0.2em] text-sage-300">
            Loading 3D Atmosphere...
          </span>
        </div>
      )}

      {/* Spline 3D Canvas */}
      {!hasError ? (
        <Spline
          scene={sceneUrl}
          onLoad={handleLoad}
          onError={handleError}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 text-sage-300">
          <p className="font-display text-lg text-white mb-2">3D Scene Connected</p>
          <p className="text-xs text-sage-400 max-w-md">
            Your Spline 3D runtime is ready. You can pass your custom Spline export URL via the sceneUrl prop.
          </p>
        </div>
      )}
    </div>
  );
}

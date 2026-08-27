"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import UnderConstruction from "@/components/ui/UnderConstruction";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Packages from "@/components/sections/Packages";
import Amenities from "@/components/sections/Amenities";
import Gallery from "@/components/sections/Gallery";
import Experiences from "@/components/sections/Experiences";
import Reviews from "@/components/sections/Reviews";
import CTA from "@/components/sections/CTA";
import Contact from "@/components/sections/Contact";

// Dynamically imported background systems for lightning-fast initial page paint
const DynamicSky = dynamic(() => import("@/components/ui/DynamicSky"), {
  ssr: false,
});

const AmbientParticles = dynamic(
  () => import("@/components/ui/AmbientParticles"),
  {
    ssr: false,
  }
);

const AmbientAudioPlayer = dynamic(
  () => import("@/components/ui/AmbientAudioPlayer"),
  {
    ssr: false,
  }
);

export default function Home() {
  const [isPreview, setIsPreview] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if ?preview=true query parameter is present in the URL
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("preview") === "true") {
        setIsPreview(true);
      }
    }
  }, []);

  // During 18-hour maintenance window, show Under Construction page unless preview is triggered
  if (!isPreview) {
    return <UnderConstruction onPreview={() => setIsPreview(true)} />;
  }

  // Full Interactive Website View (Accessible via "Preview Site" or ?preview=true)
  return (
    <>
      {/* Discreet Banner to return to Under Construction Mode */}
      <div className="fixed top-20 right-4 z-50">
        <button
          onClick={() => setIsPreview(false)}
          className="px-3.5 py-1.5 rounded-full bg-forest-dark/90 text-mint-300 text-xs font-eyebrow uppercase tracking-widest border border-mint-400/30 backdrop-blur-md shadow-lg hover:bg-forest-dark transition-all"
        >
          ← Return to Countdown
        </button>
      </div>

      <DynamicSky />
      <AmbientParticles />
      <AmbientAudioPlayer />
      <Hero />
      <About />
      <Packages />
      <Amenities />
      <Gallery />
      <Experiences />
      <Reviews />
      <CTA />
      <Contact />
    </>
  );
}

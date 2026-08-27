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
import { Lock } from "lucide-react";

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

const AUTH_PASSWORD = "0770663154";

export default function Home() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      // Check session storage
      const sessionAuth = sessionStorage.getItem("kekulama_admin_unlocked");
      if (sessionAuth === "true") {
        setIsUnlocked(true);
        return;
      }

      // Check URL query parameters: ?pass=0770663154
      const params = new URLSearchParams(window.location.search);
      const urlPass = params.get("pass") || params.get("password") || params.get("unlock");
      if (urlPass === AUTH_PASSWORD) {
        sessionStorage.setItem("kekulama_admin_unlocked", "true");
        setIsUnlocked(true);
      }
    }
  }, []);

  const handleLockSite = () => {
    try {
      sessionStorage.removeItem("kekulama_admin_unlocked");
    } catch {}
    setIsUnlocked(false);
  };

  // During 18-hour maintenance window, show Under Construction page unless unlocked by passcode
  if (!isUnlocked) {
    return <UnderConstruction onUnlock={() => setIsUnlocked(true)} />;
  }

  // Full Interactive Website View (Unlocked via Passcode: 0770663154)
  return (
    <>
      {/* Discreet Admin Lock Button */}
      <div className="fixed top-20 right-4 z-50">
        <button
          onClick={handleLockSite}
          className="px-3.5 py-1.5 rounded-full bg-forest-dark/90 text-mint-300 text-xs font-eyebrow uppercase tracking-widest border border-mint-400/30 backdrop-blur-md shadow-lg hover:bg-forest-dark transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Lock size={12} />
          <span>Lock Site</span>
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

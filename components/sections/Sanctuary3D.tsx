"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import SplineScene from "@/components/ui/SplineScene";
import { LUXURY_EASING, LUXURY_DURATION } from "@/lib/motion";
import { Sparkles, Eye, Compass, ShieldCheck } from "lucide-react";

export default function Sanctuary3D() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="sanctuary-3d" className="section-padding bg-gradient-to-b from-forest-dark via-forest to-forest-dark text-white relative overflow-hidden">
      {/* Background Soft Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-mint-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-eucalyptus-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container-custom relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <SectionHeading
            badge="Interactive 3D Experience"
            title="Explore The Eco Sanctuary in"
            highlight="Real-Time 3D"
            subtitle="Interact with our 3D landscape model. Rotate, explore, and feel the natural serenity before you arrive."
            className="text-white"
          />
        </div>

        {/* 3D Spline Interactive Canvas Container */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: LUXURY_DURATION.slow, ease: LUXURY_EASING.quintOut }}
          className="relative max-w-5xl mx-auto"
        >
          <SplineScene
            sceneUrl="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode"
            className="w-full h-[450px] sm:h-[550px] lg:h-[620px] shadow-glow"
            badgeText="Spline 3D Realtime Engine · Pinnaduwa, Galle"
          />

          {/* Interactive Feature Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-6">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
              <div className="w-8 h-8 rounded-xl bg-mint-400/20 text-mint-300 flex items-center justify-center flex-shrink-0">
                <Compass size={16} />
              </div>
              <div>
                <span className="font-eyebrow text-[10px] uppercase tracking-wider text-sage-400 block">360° Rotation</span>
                <span className="font-body text-xs text-white font-medium">Touch / Drag to orbit</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
              <div className="w-8 h-8 rounded-xl bg-mint-400/20 text-mint-300 flex items-center justify-center flex-shrink-0">
                <Sparkles size={16} />
              </div>
              <div>
                <span className="font-eyebrow text-[10px] uppercase tracking-wider text-sage-400 block">Atmospheric Light</span>
                <span className="font-body text-xs text-white font-medium">Real-time shading</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
              <div className="w-8 h-8 rounded-xl bg-mint-400/20 text-mint-300 flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={16} />
              </div>
              <div>
                <span className="font-eyebrow text-[10px] uppercase tracking-wider text-sage-400 block">Nature Architecture</span>
                <span className="font-body text-xs text-white font-medium">Eco timber design</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

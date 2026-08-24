"use client";

import React, { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

export default function AmbientParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Generate deterministic lightweight floating particles
    const generated: Particle[] = Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: ((i * 17 + 23) * 19) % 100,
      y: ((i * 13 + 7) * 29) % 100,
      size: 2 + (i % 3) * 1.5,
      duration: 12 + (i % 8) * 2.5,
      delay: (i % 7) * 1.8,
      opacity: 0.25 + ((i % 4) * 0.15),
    }));
    setParticles(generated);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none -z-5 overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-gradient-to-tr from-mint-300 to-amber-200 blur-[1px]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            boxShadow: "0 0 8px rgba(142,231,217,0.7), 0 0 16px rgba(251,191,36,0.4)",
            animation: `floatSpore ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Menu, X, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { siteData } from "@/data/siteData";
import { LUXURY_EASING } from "@/lib/motion";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = siteData?.nav || [];

  return (
    <>
      {/* Dynamic top scroll progress bar */}
      <div
        className="fixed top-0 left-0 h-[2.5px] bg-gradient-to-r from-mint-400 via-mint-500 to-bark z-[70] transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 h-[76px] flex items-center ${
          isScrolled
            ? "bg-white/90 backdrop-blur-2xl shadow-soft border-b border-mint-100/80"
            : "bg-gradient-to-b from-forest-dark/80 via-forest-dark/40 to-transparent"
        }`}
      >
        <div className="container-custom w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3.5 group">
            <motion.div
              whileHover={shouldReduceMotion ? {} : { scale: 1.04 }}
              transition={{ duration: 0.3, ease: LUXURY_EASING.quintOut }}
              className="relative w-11 h-11 rounded-full overflow-hidden border border-mint-300/80 shadow-sm"
            >
              <Image
                src="/images/logo.jpg"
                alt="Kekulama Eco Cabana Logo"
                fill
                sizes="44px"
                className="object-cover"
              />
            </motion.div>
            <div className="flex flex-col">
              <span
                className={`font-display text-xl sm:text-2xl font-normal tracking-[0.16em] uppercase transition-colors duration-300 ${
                  isScrolled ? "text-forest" : "text-white"
                }`}
              >
                Kekulama
              </span>
              <span
                className={`font-eyebrow text-[9px] uppercase tracking-[0.32em] font-normal -mt-0.5 transition-colors duration-300 ${
                  isScrolled ? "text-mint-700" : "text-mint-200"
                }`}
              >
                Eco Cabana · Galle
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-8">
            <div className="flex items-center gap-7">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative font-body text-[11.5px] font-medium uppercase tracking-[0.18em] transition-colors duration-300 group py-1 ${
                    isScrolled
                      ? "text-sage-800 hover:text-mint-600"
                      : "text-white/90 hover:text-mint-300"
                  }`}
                >
                  <span>{link.label || link.name}</span>
                  {/* Subtle underline trace on hover */}
                  <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-mint-400 transition-all duration-300 ease-out group-hover:w-full" />
                </Link>
              ))}
            </div>

            <Button
              variant="mint"
              size="sm"
              href="https://wa.me/94756657000"
              target="_blank"
              rel="noopener noreferrer"
              className="gap-1.5 shadow-glow"
            >
              <span>Book via WhatsApp</span>
            </Button>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex items-center gap-2 lg:hidden">
            <a
              href="tel:+94756657000"
              className={`p-2 rounded-full transition-all duration-300 ${
                isScrolled
                  ? "bg-mint-100 text-mint-800 hover:bg-mint-200"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
              aria-label="Call Kekulama Eco Cabana"
            >
              <PhoneCall size={18} />
            </a>

            <button
              className={`p-2 rounded-xl transition-colors duration-300 ${
                isScrolled
                  ? "text-forest hover:bg-sage-100"
                  : "text-white hover:bg-white/20"
              }`}
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: "0%" }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.45, ease: LUXURY_EASING.quintOut }}
            className="fixed inset-0 z-[80] bg-forest-dark/95 backdrop-blur-2xl flex flex-col p-6 text-white"
          >
            <div className="flex items-center justify-between h-[64px] border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-mint-300">
                  <Image
                    src="/images/logo.jpg"
                    alt="Logo"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <span className="font-display text-xl font-normal tracking-[0.16em] uppercase">Kekulama</span>
                  <span className="block font-eyebrow text-[9px] uppercase tracking-[0.3em] text-mint-300">
                    Eco Sanctuary
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-full bg-white/10 text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                aria-label="Close navigation menu"
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex flex-col justify-center flex-1 gap-4 py-8">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 * index + 0.1, duration: 0.4, ease: LUXURY_EASING.quintOut }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="font-display text-2xl font-normal text-white/90 hover:text-mint-300 transition-colors flex items-center justify-between py-1.5 tracking-wide"
                  >
                    <span>{link.label || link.name}</span>
                    <span className="font-mono text-xs text-mint-400">0{index + 1}</span>
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.4, ease: LUXURY_EASING.quintOut }}
                className="mt-6 flex flex-col gap-3"
              >
                <Button
                  variant="mint"
                  size="lg"
                  href="https://wa.me/94756657000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center justify-center shadow-glow"
                >
                  Book via WhatsApp
                </Button>
                <a
                  href="tel:+94756657000"
                  className="w-full py-3 rounded-full text-center font-body text-xs uppercase tracking-[0.15em] font-semibold border border-white/20 text-white hover:bg-white/10 transition-colors"
                >
                  Call +94 75 665 7000
                </a>
              </motion.div>
            </div>

            <div className="border-t border-white/10 pt-4 text-center font-eyebrow text-[10px] uppercase tracking-[0.25em] text-sage-400">
              Pinnaduwa, Galle, Sri Lanka · 100% Recommended
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;

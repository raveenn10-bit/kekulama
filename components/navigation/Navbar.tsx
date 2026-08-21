"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { siteData } from "@/data/siteData";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Assuming siteData.nav exists as per prompt. If not, fallback to default.
  const navLinks = siteData?.nav || [
    { name: "Home", href: "/" },
    { name: "About", href: "#about" },
    { name: "Packages", href: "#packages" },
    { name: "Gallery", href: "#gallery" },
    { name: "Experiences", href: "#experiences" },
    { name: "Contact", href: "#contact" }
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 h-[72px] flex items-center ${
          isScrolled
            ? "bg-white/80 backdrop-blur-xl shadow-soft border-b border-sage-100"
            : "bg-transparent"
        }`}
      >
        <div className="container-custom w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full overflow-hidden">
              <Image 
                src="/images/logo.jpg" 
                alt="Kekulama Logo" 
                fill 
                sizes="48px"
                className="object-cover"
              />
            </div>
            <span className={`font-display text-2xl ${isScrolled ? "text-sage-900" : "text-white"}`}>
              Kekulama
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            <div className="flex items-center gap-6">
              {navLinks.map((link: any) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    isScrolled 
                      ? "text-sage-700 hover:text-bark" 
                      : "text-white/90 hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <Button variant="primary" size="sm" href="https://wa.me/94756657000">
              Book Now
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 text-sage-900"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} className={isScrolled ? "text-sage-900" : "text-white"} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-forest-dark/95 backdrop-blur-xl flex flex-col"
          >
            <div className="flex items-center justify-between p-5 h-[72px]">
              <span className="font-display text-2xl text-white">Kekulama</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-white/80 hover:text-white transition-colors"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex flex-col items-center justify-center flex-1 gap-8 p-8">
              {navLinks.map((link: any, index: number) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.4 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-2xl font-display text-white/90 hover:text-bark transition-colors"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * navLinks.length, duration: 0.4 }}
                className="mt-4"
              >
                <Button variant="primary" size="lg" href="https://wa.me/94756657000">
                  Book via WhatsApp
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;

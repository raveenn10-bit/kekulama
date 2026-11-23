"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { MotionConfig } from "framer-motion";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/components/sections/Footer";
import FloatingWhatsApp from "@/components/ui/FloatingWhatsApp";

interface PublicLayoutWrapperProps {
  children: React.ReactNode;
}

export default function PublicLayoutWrapper({ children }: PublicLayoutWrapperProps) {
  const pathname = usePathname();
  const isAdminOrGuest = pathname?.startsWith("/admin") || pathname?.startsWith("/guest");
  const isSeoLandingPage =
    pathname === "/honeymoon-cabana-galle" ||
    pathname === "/day-out-cabana-galle" ||
    pathname === "/lagoon-crab-galle";

  if (isAdminOrGuest) {
    return <>{children}</>;
  }

  return (
    // reducedMotion="user": every framer-motion animation follows the OS setting
    <MotionConfig reducedMotion="user">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer showPhotoStrip={!isSeoLandingPage} />
      <FloatingWhatsApp />
    </MotionConfig>
  );
}

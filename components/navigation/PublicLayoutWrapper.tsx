"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/components/sections/Footer";
import FloatingWhatsApp from "@/components/ui/FloatingWhatsApp";

interface PublicLayoutWrapperProps {
  children: React.ReactNode;
}

export default function PublicLayoutWrapper({ children }: PublicLayoutWrapperProps) {
  const pathname = usePathname();
  const isAdminOrGuest = pathname?.startsWith("/admin") || pathname?.startsWith("/guest");

  if (isAdminOrGuest) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}

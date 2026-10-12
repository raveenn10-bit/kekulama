"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { AdminAuthProvider, useAdminAuth } from "@/components/admin/AdminAuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminLoginPage from "./login/page";

function AdminContentShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading } = useAdminAuth();

  // Allow login page to render directly
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium tracking-wide">
            Authenticating Kekulama Admin Session...
          </p>
        </div>
      </div>
    );
  }

  // If not logged in, show Clean Professional Login Page
  if (!user) {
    return <AdminLoginPage />;
  }

  // Get dynamic title based on path
  const titles: Record<string, string> = {
    "/admin": "Operational Dashboard",
    "/admin/calendar": "Multi-Channel Availability Calendar",
    "/admin/reservations": "Reservations Directory",
    "/admin/manual-booking": "Create Manual Booking",
    "/admin/guests": "Guest History & Directory",
    "/admin/registration": "Guest Registration Portal Generator",
    "/admin/checkin": "Check-in & Checkout Console",
    "/admin/payments": "Payment & Revenue Tracking",
    "/admin/reports": "Financial & Occupancy Reports",
    "/admin/notifications": "System & Gmail Notification Logs",
    "/admin/backup": "Encrypted Backup & Recovery",
    "/admin/settings": "Security & Staff Settings",
  };

  const title = titles[pathname] || "Admin Console";

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans antialiased text-slate-800">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminContentShell>{children}</AdminContentShell>
    </AdminAuthProvider>
  );
}

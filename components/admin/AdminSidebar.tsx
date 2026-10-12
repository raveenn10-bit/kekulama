"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  PlusCircle,
  Users,
  ShieldCheck,
  CheckSquare,
  CreditCard,
  BarChart3,
  Bell,
  Database,
  Settings,
  LogOut,
  X,
  Hotel,
} from "lucide-react";
import { useAdminAuth } from "./AdminAuthContext";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { role, logout, user } = useAdminAuth();

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Calendar", href: "/admin/calendar", icon: Calendar },
    { name: "Reservations", href: "/admin/reservations", icon: BookOpen },
    { name: "Manual Booking", href: "/admin/manual-booking", icon: PlusCircle },
    { name: "Guest Records", href: "/admin/guests", icon: Users },
    { name: "ID Registration", href: "/admin/registration", icon: ShieldCheck },
    { name: "Check-in / Out", href: "/admin/checkin", icon: CheckSquare },
    { name: "Payments", href: "/admin/payments", icon: CreditCard },
    { name: "Reports", href: "/admin/reports", icon: BarChart3, ownerOnly: true },
    { name: "Notifications", href: "/admin/notifications", icon: Bell },
    { name: "Backup & Recovery", href: "/admin/backup", icon: Database, ownerOnly: true },
    { name: "Settings & Staff", href: "/admin/settings", icon: Settings, ownerOnly: true },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Hotel size={18} />
            </div>
            <div>
              <span className="font-semibold text-sm tracking-tight text-slate-900 block leading-tight">
                Kekulama Eco Cabana
              </span>
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                Management System
              </span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Role Badge */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="truncate mr-2">
            <span className="text-xs font-semibold text-slate-800 block truncate">
              {user?.email || "Admin User"}
            </span>
            <span className="text-[10px] text-slate-500 capitalize">
              Role: <strong className="text-blue-700">{role || "Staff"}</strong>
            </span>
          </div>
          <span
            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
              role === "owner" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
            }`}
          >
            {role === "owner" ? "Owner" : "Reception"}
          </span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            if (item.ownerOnly && role !== "owner") return null;
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon
                  size={16}
                  className={isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

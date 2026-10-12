"use client";

import React from "react";
import { Menu, ExternalLink, ShieldCheck } from "lucide-react";
import { useAdminAuth } from "./AdminAuthContext";

interface AdminHeaderProps {
  onMenuClick: () => void;
  title: string;
}

export default function AdminHeader({ onMenuClick, title }: AdminHeaderProps) {
  const { user, role } = useAdminAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 lg:hidden cursor-pointer"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Firestore Online Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Firestore Native Live</span>
        </div>

        {/* View Public Website */}
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 text-xs font-medium transition-all"
        >
          <span>View Site</span>
          <ExternalLink size={12} />
        </a>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
          {user?.email?.charAt(0).toUpperCase() || "A"}
        </div>
      </div>
    </header>
  );
}

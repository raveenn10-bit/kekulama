"use client";

import React, { useState } from "react";
import { Database, Download, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, Lock } from "lucide-react";
import { useAdminAuth } from "@/components/admin/AdminAuthContext";

export default function AdminBackupPage() {
  const { role } = useAdminAuth();
  const [backingUp, setBackingUp] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState<string | null>(null);

  if (role !== "owner") {
    return (
      <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center">
        <p className="text-xs text-rose-600 font-semibold">
          Access Restricted: Only the Owner can manage or restore database backups.
        </p>
      </div>
    );
  }

  const handleBackupNow = async () => {
    setBackingUp(true);
    setBackupSuccess(null);

    try {
      const res = await fetch("/api/admin/backup", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setBackupSuccess(data.filename || "kekulama_backup.enc");
      } else {
        alert(data.error || "Backup failed.");
      }
    } catch {
      alert("Network error during backup.");
    } finally {
      setBackingUp(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Database size={20} className="text-blue-600" />
            <span>Encrypted Cloud Backup & Recovery Console</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated Google Drive synchronization and AES-256 encrypted disaster recovery.
          </p>
        </div>

        <button
          onClick={handleBackupNow}
          disabled={backingUp}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
        >
          {backingUp ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
          <span>Backup Now</span>
        </button>
      </div>

      {backupSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>
            Encrypted backup archive <strong>{backupSuccess}</strong> generated and synchronized successfully!
          </span>
        </div>
      )}

      {/* Schedule & Encryption Policy Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <ShieldCheck size={16} className="text-blue-600" />
            <span>Daily Automated Backup Schedule</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            The automated backup runner exports all Firestore collections (`bookings`, `payments`, `rooms`, `users`) daily at:
          </p>
          <div className="p-3 bg-slate-50 rounded-xl font-mono text-xs font-bold text-slate-800">
            02:00 AM (Asia/Colombo Timezone)
          </div>
          <span className="text-[11px] text-slate-400 block">
            Retained in Google Drive with 30-day version rotation.
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <Lock size={16} className="text-emerald-600" />
            <span>AES-256 Encryption & Data Privacy</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Every database export payload is encrypted with AES-256 before transmission. Guest identity documents are strictly audited and verified against the retention policy.
          </p>
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 font-semibold text-[11px]">
            ✓ Military-grade encryption enabled · Zero cleartext exports
          </div>
        </div>
      </div>
    </div>
  );
}

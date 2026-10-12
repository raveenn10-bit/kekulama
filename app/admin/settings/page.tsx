"use client";

import React, { useState, useEffect } from "react";
import { Settings, Shield, Users, UserPlus, Key, CheckCircle2, History } from "lucide-react";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { AdminUser, AuditLogEntry } from "@/types/admin";
import { useAdminAuth } from "@/components/admin/AdminAuthContext";

export default function AdminSettingsPage() {
  const { role } = useAdminAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    const unsubU = onSnapshot(collection(db, "users"), (s) => setUsers(s.docs.map((d) => d.data() as AdminUser)));
    const qA = query(collection(db, "audit_logs"), orderBy("createdAt", "desc"), limit(20));
    const unsubA = onSnapshot(qA, (s) => setAuditLogs(s.docs.map((d) => d.data() as AuditLogEntry)));

    return () => {
      unsubU();
      unsubA();
    };
  }, []);

  if (role !== "owner") {
    return (
      <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center">
        <p className="text-xs text-rose-600 font-semibold">
          Access Restricted: Only the Owner can modify security settings or manage staff.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings size={20} className="text-blue-600" />
          <span>Security & Staff Administration</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Role-Based Access Control, authorized personnel, and immutable system audit trails.
        </p>
      </div>

      {/* Staff Directory */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <Users size={16} className="text-blue-600" />
            <span>Authorized System Operators</span>
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {users.map((u) => (
            <div key={u.uid} className="py-3 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900 block">{u.displayName || u.email}</span>
                <span className="text-[11px] text-slate-400 font-mono">{u.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                    u.role === "owner" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {u.role}
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold">Active</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Immutable Audit Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <History size={16} className="text-blue-600" />
            <span>Immutable Security Audit Log</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">Append-Only</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Target Resource</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 font-sans text-xs">
                    No security events recorded in audit log yet.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log, index) => (
                  <tr key={index} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-bold text-slate-800">{log.action}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {log.actorId} ({log.actorRole})
                    </td>
                    <td className="py-3 px-4 text-slate-500">{log.targetResource}</td>
                    <td className="py-3 px-4 text-slate-400">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : "Just now"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

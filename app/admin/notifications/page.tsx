"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Bell, Send, CheckCircle2, AlertCircle, RefreshCw, Mail, ShieldCheck, ExternalLink } from "lucide-react";

interface NotificationLog {
  id: string;
  event: string;
  recipient: string;
  subject: string;
  status: "delivered" | "queued" | "failed";
  timestamp: string;
}

function NotificationsContent() {
  const searchParams = useSearchParams();
  const oauthStatus = searchParams.get("oauth");
  const oauthEmail = searchParams.get("email");
  const oauthReason = searchParams.get("reason");

  const [recipientEmail, setRecipientEmail] = useState("kekulamaecocabana@gmail.com");
  const [testing, setTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  const mockLogs: NotificationLog[] = [
    {
      id: "NOTIF-001",
      event: "New Online Booking",
      recipient: recipientEmail,
      subject: "New Booking Request #KEK-2026-7842 Received",
      status: "delivered",
      timestamp: new Date().toLocaleString(),
    },
    {
      id: "NOTIF-002",
      event: "Guest Registration",
      recipient: recipientEmail,
      subject: "Guest Identification Uploaded for #KEK-2026-7842",
      status: "delivered",
      timestamp: new Date().toLocaleString(),
    },
    {
      id: "NOTIF-003",
      event: "Daily Backup Succeeded",
      recipient: recipientEmail,
      subject: "Encrypted Cloud Backup Completed (02:00 AM Colombo)",
      status: "delivered",
      timestamp: new Date().toLocaleString(),
    },
  ];

  const handleSendTest = async () => {
    setTesting(true);
    try {
      const res = await fetch("/api/admin/notifications/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient: recipientEmail }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setTestSuccess(true);
        setTimeout(() => setTestSuccess(false), 5000);
      } else {
        alert(data.error || "Failed to trigger test alert.");
      }
    } catch {
      alert("Failed to reach server to send test notification.");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell size={20} className="text-blue-600" />
            <span>Gmail & Operational Notification Console</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            6 Operational event triggers: Bookings, Updates, Cancellations, Guest ID, and Backups.
          </p>
        </div>

        <button
          onClick={handleSendTest}
          disabled={testing}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
        >
          {testing ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
          <span>Send Test Alert</span>
        </button>
      </div>

      {/* OAuth Callback Notifications */}
      {oauthStatus === "success" && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
          <div>
            <span className="font-bold">Gmail OAuth 2.0 Connected!</span> Authorized sender account:{" "}
            <span className="font-mono">{oauthEmail || "kekulamaecocabana@gmail.com"}</span>. Transactional email triggers are active.
          </div>
        </div>
      )}

      {oauthStatus === "error" && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle size={18} className="text-rose-600 shrink-0" />
          <div>
            <span className="font-bold">OAuth Authorization Failed:</span> {oauthReason || "Unknown error"}. Please check your Google Cloud OAuth credentials and redirect URIs.
          </div>
        </div>
      )}

      {testSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>Test operational alert dispatched to {recipientEmail}.</span>
        </div>
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recipient Configuration */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Mail size={16} className="text-slate-600" />
            <span>Recipient Notification Email</span>
          </h3>
          <p className="text-slate-500 text-xs">
            Operational alerts for new bookings and guest uploads will be sent to this destination address.
          </p>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Owner Email</label>
            <div className="flex gap-2">
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900"
              />
              <button
                onClick={() => alert("Notification settings saved.")}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Gmail OAuth 2.0 Integration */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <ShieldCheck size={16} className="text-blue-600" />
            <span>Gmail Sender Account (Google Cloud OAuth)</span>
          </h3>
          <p className="text-slate-500 text-xs">
            Authenticate the official Kekulama Gmail account via Google OAuth 2.0 with offline refresh token support to send system notifications.
          </p>
          <div className="pt-1">
            <a
              href="/api/admin/oauth/gmail"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-sm cursor-pointer"
            >
              <span>Connect Gmail with Google OAuth</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Recent Notification Deliveries
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Event</th>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockLogs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{l.event}</td>
                  <td className="py-3.5 px-4 text-slate-600">{l.recipient}</td>
                  <td className="py-3.5 px-4 text-slate-800 font-medium">{l.subject}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                      {l.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">{l.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminNotificationsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
          Loading notification console...
        </div>
      }
    >
      <NotificationsContent />
    </Suspense>
  );
}

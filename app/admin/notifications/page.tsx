"use client";

import React, { useState } from "react";
import { Bell, Send, CheckCircle2, AlertCircle, RefreshCw, Mail } from "lucide-react";

interface NotificationLog {
  id: string;
  event: string;
  recipient: string;
  subject: string;
  status: "delivered" | "queued" | "failed";
  timestamp: string;
}

export default function AdminNotificationsPage() {
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

  const handleSendTest = () => {
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      setTestSuccess(true);
      setTimeout(() => setTestSuccess(false), 4000);
    }, 1200);
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

      {testSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>Test operational alert dispatched to {recipientEmail}.</span>
        </div>
      )}

      {/* Settings Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Notification Recipient Configuration</h3>
        <div className="max-w-md">
          <label className="block font-semibold text-slate-700 mb-1">Primary Owner Notification Email</label>
          <div className="flex gap-2">
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900"
            />
            <button
              onClick={() => alert("Notification settings saved.")}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold"
            >
              Save
            </button>
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

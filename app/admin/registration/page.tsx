"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Copy, Check, ExternalLink, Send, Clock, AlertCircle } from "lucide-react";
import { collection, onSnapshot, query, orderBy, doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Booking } from "@/types/booking";
import { GuestRegistrationToken } from "@/types/guest";
import { generateSecureToken } from "@/lib/security/auth";

export default function AdminRegistrationPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tokens, setTokens] = useState<GuestRegistrationToken[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<string>("");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const qB = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
    const unsubB = onSnapshot(qB, (s) => setBookings(s.docs.map((d) => d.data() as Booking)));

    const qT = query(collection(db, "registration_tokens"), orderBy("createdAt", "desc"));
    const unsubT = onSnapshot(qT, (s) => setTokens(s.docs.map((d) => d.data() as GuestRegistrationToken)));

    return () => {
      unsubB();
      unsubT();
    };
  }, []);

  const handleGenerateToken = async () => {
    if (!selectedBookingId) return;
    setGenerating(true);

    try {
      const booking = bookings.find((b) => b.id === selectedBookingId);
      if (!booking) return;

      const newToken = generateSecureToken();
      const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
      const nowIso = new Date().toISOString();

      const tokenRecord: GuestRegistrationToken = {
        token: newToken,
        bookingId: booking.id,
        guestEmail: booking.guestEmail,
        guestPhone: booking.guestPhone,
        status: "active",
        expiresAt,
        createdAt: nowIso,
      };

      await setDoc(doc(db, "registration_tokens", newToken), tokenRecord);
      await updateDoc(doc(db, "bookings", booking.id), {
        registrationToken: newToken,
      });

      setSelectedBookingId("");
    } catch (err) {
      console.error("Error generating token:", err);
      alert("Failed to generate registration token.");
    } finally {
      setGenerating(false);
    }
  };

  const copyLink = (token: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/guest/register?token=${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck size={20} className="text-blue-600" />
            <span>Guest Registration & ID Portal Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Issue single-use expiring tokenized portals for guest NIC and passport image uploads.
          </p>
        </div>

        {/* Generator Box */}
        <div className="flex items-center gap-2">
          <select
            value={selectedBookingId}
            onChange={(e) => setSelectedBookingId(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 text-slate-900"
          >
            <option value="">Select Booking Reference...</option>
            {bookings
              .filter((b) => b.status !== "cancelled")
              .map((b) => (
                <option key={b.id} value={b.id}>
                  {b.id} — {b.guestName} ({b.checkIn})
                </option>
              ))}
          </select>

          <button
            onClick={handleGenerateToken}
            disabled={!selectedBookingId || generating}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer whitespace-nowrap"
          >
            {generating ? "Generating..." : "Generate Portal Link"}
          </button>
        </div>
      </div>

      {/* Active Tokens Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Issued Registration Tokens
          </h3>
          <span className="text-xs text-slate-400 font-medium">Valid for 48 Hours</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Booking Ref</th>
                <th className="py-3 px-4">Guest Contact</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Expires At</th>
                <th className="py-3 px-4">Portal URL / Token</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tokens.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                    No registration tokens generated yet.
                  </td>
                </tr>
              ) : (
                tokens.map((t) => {
                  const isExpired = new Date(t.expiresAt).getTime() < Date.now();
                  const booking = bookings.find((b) => b.id === t.bookingId);
                  const guestName = booking?.guestName || "Guest";

                  return (
                    <tr key={t.token} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {t.bookingId}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 block">{guestName}</span>
                        <span className="text-[11px] text-slate-400">{t.guestPhone}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            t.status === "used"
                              ? "bg-emerald-100 text-emerald-800"
                              : isExpired
                              ? "bg-rose-100 text-rose-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {t.status === "used" ? "Completed" : isExpired ? "Expired" : "Active"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(t.expiresAt).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500 bg-slate-50 p-1.5 rounded-lg border border-slate-200/60 max-w-xs truncate">
                          <span className="truncate">/guest/register?token={t.token}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => copyLink(t.token)}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                          >
                            {copiedToken === t.token ? (
                              <>
                                <Check size={12} className="text-emerald-600" />
                                <span className="text-emerald-700">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span>Copy Link</span>
                              </>
                            )}
                          </button>

                          <a
                            href={`https://wa.me/${t.guestPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                              `Hello ${guestName}, please complete your guest registration and NIC/passport verification for Kekulama Eco Cabana here: ${
                                typeof window !== "undefined" ? window.location.origin : ""
                              }/guest/register?token=${t.token}`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[11px] inline-flex items-center gap-1"
                          >
                            <Send size={11} />
                            <span>Share</span>
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

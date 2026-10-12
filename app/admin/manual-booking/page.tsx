"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Calendar, Users, CreditCard, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { siteData } from "@/data/siteData";
import { useAdminAuth } from "@/components/admin/AdminAuthContext";

export default function AdminManualBookingPage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const { packages } = siteData;

  const todayStr = new Date().toISOString().split("T")[0]!;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0]!;

  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [checkIn, setCheckIn] = useState(todayStr);
  const [checkOut, setCheckOut] = useState(tomorrowStr);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [packagePlan, setPackagePlan] = useState("Bed & Breakfast (B/B)");
  const [specialRequests, setSpecialRequests] = useState("");
  const [notes, setNotes] = useState("");
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "bank_transfer">("cash");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any | null>(null);

  const calculateNights = () => {
    const s = new Date(checkIn).getTime();
    const e = new Date(checkOut).getTime();
    const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  const nights = calculateNights();

  // Find package rate
  const selectedPkg = packages.find((p) => p.name === packagePlan) || packages[4];
  const unitPrice = parseInt(selectedPkg?.price.replace(/,/g, "") || "11000", 10);
  const calculatedTotal = unitPrice * nights;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkIn,
          checkOut,
          guestName,
          guestPhone,
          guestEmail,
          adults,
          children,
          packagePlan,
          specialRequests,
          notes,
          source: "manual",
          status: "confirmed",
          totalAmount: calculatedTotal,
          createdBy: user?.uid || "staff",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create manual reservation.");
      }

      setSuccessData(data.booking);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <PlusCircle size={20} className="text-blue-600" />
          <span>Create Owner Manual Reservation</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Lock dates directly on the calendar for walk-ins, phone bookings, or direct guests.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successData ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            Booking #{successData.id} Confirmed!
          </h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            The room is locked in Cloud Firestore from <strong>{successData.startDate || successData.checkIn}</strong> to{" "}
            <strong>{successData.endDate || successData.checkOut}</strong>.
          </p>

          <div className="pt-4 flex flex-wrap gap-2 justify-center">
            <a
              href={`/guest/register?token=${successData.registrationToken}`}
              target="_blank"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
            >
              Open Guest ID Portal
            </a>
            <button
              onClick={() => {
                setSuccessData(null);
                setGuestName("");
                setGuestPhone("");
                setGuestEmail("");
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
            >
              Create Another Booking
            </button>
            <button
              onClick={() => router.push("/admin/reservations")}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
            >
              Back to Reservations
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-xs">
          {/* Section 1: Guest Information */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 pb-2 border-b border-slate-100">
              1. Guest Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. John Smith"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="e.g. +94 77 123 4567"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="e.g. john@example.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Stay & Room Details */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 pb-2 border-b border-slate-100">
              2. Dates & Room Configuration
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Check-in Date *</label>
                <input
                  type="date"
                  required
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Check-out Date *</label>
                <input
                  type="date"
                  required
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Adults</label>
                <select
                  value={adults}
                  onChange={(e) => setAdults(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                >
                  <option value={1}>1 Adult</option>
                  <option value={2}>2 Adults</option>
                  <option value={3}>3 Adults</option>
                  <option value={4}>4 Adults</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Children</label>
                <select
                  value={children}
                  onChange={(e) => setChildren(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                >
                  <option value={0}>0 Children</option>
                  <option value={1}>1 Child</option>
                  <option value={2}>2 Children</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Package & Financials */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 pb-2 border-b border-slate-100">
              3. Package Plan & Pricing
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Package Plan</label>
                <select
                  value={packagePlan}
                  onChange={(e) => setPackagePlan(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                >
                  {packages.map((pkg) => (
                    <option key={pkg.name} value={pkg.name}>
                      {pkg.name} — LKR {pkg.price} / {pkg.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block">Calculated Total</span>
                  <span className="text-lg font-bold text-slate-900">
                    LKR {calculatedTotal.toLocaleString()}
                  </span>
                </div>
                <span className="text-xs text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-semibold">
                  {nights} Night(s)
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Special Requests / Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Vegetarian breakfast, airport pickup requested..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? <span>Locking Dates in Firestore...</span> : <span>Confirm Manual Reservation</span>}
          </button>
        </form>
      )}
    </div>
  );
}

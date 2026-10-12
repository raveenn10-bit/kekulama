"use client";

import React, { useState, useEffect } from "react";
import { CheckSquare, ArrowDownRight, ArrowUpRight, Bed, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { collection, onSnapshot, query, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Booking } from "@/types/booking";

export default function AdminCheckInPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<"arrivals" | "departures" | "inhouse">("arrivals");
  const [actionLoading, setActionLoading] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0]!;

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "bookings"), (snapshot) => {
      setBookings(snapshot.docs.map((d) => d.data() as Booking));
    });
    return () => unsub();
  }, []);

  const arrivals = bookings.filter((b) => b.checkIn === todayStr && b.status !== "cancelled");
  const departures = bookings.filter((b) => b.checkOut === todayStr && b.status !== "cancelled");
  const inHouse = bookings.filter((b) => b.status === "checked_in");

  const handleCheckIn = async (bookingId: string) => {
    setActionLoading(true);
    try {
      await updateDoc(doc(db, "bookings", bookingId), {
        status: "checked_in",
        actualCheckInTime: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.error(e);
      alert("Failed to check in guest.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async (bookingId: string) => {
    setActionLoading(true);
    try {
      await updateDoc(doc(db, "bookings", bookingId), {
        status: "checked_out",
        actualCheckOutTime: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.error(e);
      alert("Failed to check out guest.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare size={20} className="text-blue-600" />
            <span>Check-in & Checkout Operations</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Realtime guest arrival and departure management for today ({todayStr}).
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("arrivals")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "arrivals" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Arrivals ({arrivals.length})
          </button>
          <button
            onClick={() => setActiveTab("departures")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "departures" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Departures ({departures.length})
          </button>
          <button
            onClick={() => setActiveTab("inhouse")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "inhouse" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Currently In-House ({inHouse.length})
          </button>
        </div>
      </div>

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(activeTab === "arrivals" ? arrivals : activeTab === "departures" ? departures : inHouse).map((b) => (
          <div
            key={b.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-slate-900">#{b.id}</span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    b.status === "checked_in"
                      ? "bg-blue-100 text-blue-800"
                      : b.status === "checked_out"
                      ? "bg-slate-100 text-slate-700"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {b.status}
                </span>
              </div>

              <h4 className="font-bold text-slate-900 text-sm">{b.guestName}</h4>
              <p className="text-xs text-slate-500">{b.guestPhone} · {b.guestEmail}</p>

              <div className="mt-3 p-3 bg-slate-50 rounded-xl space-y-1 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Package:</span>
                  <span className="font-semibold text-slate-800">{b.packagePlan}</span>
                </div>
                <div className="flex justify-between">
                  <span>Stay:</span>
                  <span className="font-semibold text-slate-800">{b.checkIn} &rarr; {b.checkOut} ({b.nights} nights)</span>
                </div>
                <div className="flex justify-between">
                  <span>Outstanding:</span>
                  <span className={`font-bold ${b.balanceAmount > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                    LKR {b.balanceAmount?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              {b.status !== "checked_in" && b.status !== "checked_out" && (
                <button
                  disabled={actionLoading}
                  onClick={() => handleCheckIn(b.id)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
                >
                  Confirm Check-In
                </button>
              )}

              {b.status === "checked_in" && (
                <button
                  disabled={actionLoading}
                  onClick={() => handleCheckOut(b.id)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
                >
                  Process Check-Out
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

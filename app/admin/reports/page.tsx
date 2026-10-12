"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, Download, TrendingUp, DollarSign, Calendar, Layers } from "lucide-react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Booking, PaymentRecord } from "@/types/booking";
import { useAdminAuth } from "@/components/admin/AdminAuthContext";

export default function AdminReportsPage() {
  const { role } = useAdminAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);

  useEffect(() => {
    const unsubB = onSnapshot(collection(db, "bookings"), (s) => setBookings(s.docs.map((d) => d.data() as Booking)));
    const unsubP = onSnapshot(collection(db, "payments"), (s) => setPayments(s.docs.map((d) => d.data() as PaymentRecord)));
    return () => {
      unsubB();
      unsubP();
    };
  }, []);

  if (role !== "owner") {
    return (
      <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center">
        <p className="text-xs text-rose-600 font-semibold">
          Access Restricted: Only the Owner can view financial reports and revenue breakdown.
        </p>
      </div>
    );
  }

  const totalRevenue = payments
    .filter((p) => p.status === "confirmed" || p.status === "recorded")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const cashTotal = payments
    .filter((p) => p.method === "cash" && p.status !== "reversed")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const bankTotal = payments
    .filter((p) => p.method === "bank_transfer" && p.status !== "reversed")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const totalNightsBooked = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + (b.nights || 0), 0);

  const exportCSV = () => {
    const headers = ["Booking ID", "Guest", "Phone", "CheckIn", "CheckOut", "Total", "Paid", "Balance", "Status"];
    const rows = bookings.map((b) => [
      b.id,
      `"${b.guestName}"`,
      b.guestPhone,
      b.checkIn,
      b.checkOut,
      b.totalAmount,
      b.paidAmount,
      b.balanceAmount,
      b.status,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `kekulama_bookings_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 size={20} className="text-blue-600" />
            <span>Financial & Occupancy Reporting</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Owner executive summary, revenue channels, and ledger export.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
        >
          <Download size={14} />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
            Total Revenue Collected
          </span>
          <span className="text-2xl font-bold text-slate-900">
            LKR {totalRevenue.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">Confirmed + Recorded</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
            Cash Payments
          </span>
          <span className="text-2xl font-bold text-emerald-600">
            LKR {cashTotal.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">
            {totalRevenue > 0 ? Math.round((cashTotal / totalRevenue) * 100) : 0}% of revenue
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
            Bank Transfers
          </span>
          <span className="text-2xl font-bold text-blue-600">
            LKR {bankTotal.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">
            {totalRevenue > 0 ? Math.round((bankTotal / totalRevenue) * 100) : 0}% of revenue
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
            Total Room Nights Booked
          </span>
          <span className="text-2xl font-bold text-slate-900">{totalNightsBooked}</span>
          <span className="text-[11px] text-slate-400 block mt-1">Nights occupied</span>
        </div>
      </div>
    </div>
  );
}

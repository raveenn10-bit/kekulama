"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  CreditCard,
  ExternalLink,
  ChevronDown,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Booking, BookingStatus } from "@/types/booking";
import { useAdminAuth } from "@/components/admin/AdminAuthContext";
import { DocumentViewerModal } from "@/components/admin/DocumentViewerModal";

export default function AdminReservationsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [viewingDocsBookingId, setViewingDocsBookingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [retryingEmails, setRetryingEmails] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const { role, getIdToken } = useAdminAuth();

  useEffect(() => {
    const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBookings(snapshot.docs.map((doc) => doc.data() as Booking));
    });
    return () => unsubscribe();
  }, []);

  const pendingWebsiteCount = bookings.filter(
    (b) => (b.source === "website" || b.source === "direct") && b.status === "pending"
  ).length;

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.guestName.toLowerCase().includes(search.toLowerCase()) ||
      b.guestPhone.includes(search) ||
      b.guestEmail.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    const matchesSource = sourceFilter === "all" || b.source === sourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
  });

  const handleUpdateStatus = async (bookingId: string, newStatus: BookingStatus) => {
    setActionLoading(true);
    try {
      const token = await getIdToken();
      const res = await fetch("/api/admin/reservations/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ bookingId, status: newStatus }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error || `Failed with status ${res.status}`);
      }

      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking({ ...selectedBooking, status: newStatus });
      }
    } catch (err: any) {
      console.error("Error updating status:", err);
      alert(`Status update failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetryEmails = async () => {
    setRetryingEmails(true);
    try {
      const token = await getIdToken();
      const res = await fetch("/api/admin/notifications/retry", {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      alert(data.message || "Notification retry completed.");
    } catch (err: any) {
      alert(`Retry failed: ${err.message}`);
    } finally {
      setRetryingEmails(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Banner for New Website Bookings */}
      {pendingWebsiteCount > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm animate-pulse">
              {pendingWebsiteCount}
            </span>
            <div>
              <div className="font-bold text-sm text-emerald-950">
                New Website Booking Request(s) Awaiting Review
              </div>
              <div className="text-[11px] text-emerald-700">
                Review guest identity documents, confirm room availability, and approve bookings to notify guests.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setStatusFilter("pending");
                setSourceFilter("all");
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
            >
              Filter Pending
            </button>
            <button
              disabled={retryingEmails}
              onClick={handleRetryEmails}
              className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 font-semibold text-xs transition-all cursor-pointer"
              title="Retry any pending or failed Gmail notifications"
            >
              {retryingEmails ? "Retrying..." : "Retry Outbox"}
            </button>
          </div>
        </div>
      )}

      {/* Top Filter & Search Bar */}
      <div className="space-y-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference, guest, phone, email..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900"
            />
          </div>

          {/* Source Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">Source:</span>
            {[
              { id: "all", label: "All Sources" },
              { id: "website", label: "Website Direct" },
              { id: "manual", label: "Manual" },
              { id: "booking.com", label: "Booking.com" },
              { id: "airbnb", label: "Airbnb" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSourceFilter(tab.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  sourceFilter === tab.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pt-2 border-t border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">Status:</span>
          {[
            { id: "all", label: "All" },
            { id: "pending", label: "Pending" },
            { id: "confirmed", label: "Confirmed" },
            { id: "registered", label: "Registered" },
            { id: "checked_in", label: "Checked In" },
            { id: "checked_out", label: "Checked Out" },
            { id: "cancelled", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reservations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Booking Ref</th>
                <th className="py-3 px-4">Guest Details</th>
                <th className="py-3 px-4">Stay Dates</th>
                <th className="py-3 px-4">Package</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-slate-400">
                    No reservations matching current filter.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono">
                      <span className="font-bold text-slate-900 block">{b.id}</span>
                      <span
                        className={`inline-block mt-0.5 text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                          b.source === "website" || b.source === "direct"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : b.source === "manual"
                            ? "bg-slate-100 text-slate-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {b.source === "website" ? "Website" : b.source}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block">{b.guestName}</span>
                      <span className="text-[11px] text-slate-400 block">
                        {b.guestPhone} {b.country ? `· ${b.country}` : ""}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate max-w-xs">{b.guestEmail}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800 block">
                        {b.checkIn} &rarr; {b.checkOut}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {b.nights} night(s) · {b.adults} adult(s)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{b.packagePlan}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">
                        LKR {b.totalAmount ? b.totalAmount.toLocaleString() : "N/A"}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Bal: LKR {b.balanceAmount ? b.balanceAmount.toLocaleString() : 0}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          b.status === "confirmed"
                            ? "bg-emerald-100 text-emerald-800"
                            : b.status === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : b.status === "checked_in"
                            ? "bg-blue-100 text-blue-800"
                            : b.status === "checked_out"
                            ? "bg-slate-100 text-slate-700"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          b.paymentStatus === "paid"
                            ? "bg-emerald-50 text-emerald-700"
                            : b.paymentStatus === "partially_paid"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold transition-all cursor-pointer"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reservation Details & Action Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-xl w-full rounded-2xl border border-slate-200 shadow-xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Reservation Management
                </span>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <span>#{selectedBooking.id}</span>
                  <span className="text-xs font-normal text-slate-500">
                    ({selectedBooking.packagePlan})
                  </span>
                </h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg text-sm"
              >
                ✕
              </button>
            </div>

            {/* Guest Summary Card */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Guest</span>
                <span className="font-bold text-slate-800">{selectedBooking.guestName}</span>
                <span className="block text-slate-500">{selectedBooking.guestPhone}</span>
                <span className="block text-slate-500 truncate">{selectedBooking.guestEmail}</span>
                {selectedBooking.country && (
                  <span className="block text-slate-500 text-[11px]">Country: {selectedBooking.country}</span>
                )}
                <div className="mt-2 pt-2 border-t border-slate-200/60">
                  <span className="text-slate-400 block text-[9.5px] uppercase font-bold">ID Verification</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase mt-0.5 ${
                    selectedBooking.idVerificationStatus === "verified"
                      ? "bg-emerald-100 text-emerald-800"
                      : selectedBooking.idVerificationStatus === "rejected"
                      ? "bg-rose-100 text-rose-800"
                      : "bg-amber-100 text-amber-800"
                  }`}>
                    {selectedBooking.idVerificationStatus || "Pending Review"}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Stay</span>
                <span className="font-semibold text-slate-800">
                  {selectedBooking.checkIn} to {selectedBooking.checkOut}
                </span>
                <span className="block text-slate-500">
                  {selectedBooking.nights} Night(s) · {selectedBooking.adults} Adults
                  {selectedBooking.children ? `, ${selectedBooking.children} Children` : ""}
                </span>
                <span className="block text-slate-500 font-semibold">
                  Total: LKR {selectedBooking.totalAmount.toLocaleString()}
                </span>
                <div className="mt-2 pt-2 border-t border-slate-200/60">
                  <span className="text-slate-400 block text-[9.5px] uppercase font-bold">Source</span>
                  <span className="text-slate-700 font-semibold capitalize text-[11px] block mt-0.5">
                    {selectedBooking.source === "website" ? "Website (Direct)" : selectedBooking.source}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Change Controls */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Operational Status Transition:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus(selectedBooking.id, "confirmed")}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    selectedBooking.status === "confirmed"
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-slate-700 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50"
                  }`}
                >
                  <CheckCircle2 size={14} />
                  <span>Confirm</span>
                </button>

                <button
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus(selectedBooking.id, "checked_in")}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    selectedBooking.status === "checked_in"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50"
                  }`}
                >
                  <UserCheck size={14} />
                  <span>Check In</span>
                </button>

                <button
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus(selectedBooking.id, "checked_out")}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    selectedBooking.status === "checked_out"
                      ? "bg-slate-700 text-white border-slate-700"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-100"
                  }`}
                >
                  <Clock size={14} />
                  <span>Check Out</span>
                </button>
              </div>

              <div className="mt-2 text-right">
                <button
                  disabled={actionLoading}
                  onClick={() => {
                    if (confirm("Are you sure you want to cancel this booking?")) {
                      handleUpdateStatus(selectedBooking.id, "cancelled");
                    }
                  }}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer underline"
                >
                  Cancel Booking
                </button>
              </div>
            </div>

            {/* Quick Action Links */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2">
              <Link
                href={`/guest/register?token=${selectedBooking.registrationToken || ""}`}
                target="_blank"
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
              >
                <ShieldCheck size={14} />
                <span>Open Registration Portal</span>
                <ExternalLink size={12} />
              </Link>
              <Link
                href={`/admin/payments`}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
              >
                <CreditCard size={14} />
                <span>Manage Payments</span>
              </Link>
              <button
                onClick={() => setViewingDocsBookingId(selectedBooking.id)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-all border border-emerald-200 cursor-pointer"
              >
                <ShieldCheck size={14} />
                <span>View Identity Docs</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Private Guest Document Vault Modal */}
      <DocumentViewerModal
        isOpen={!!viewingDocsBookingId}
        onClose={() => setViewingDocsBookingId(null)}
        bookingId={viewingDocsBookingId || undefined}
        isOwner={role === "owner"}
      />
    </div>
  );
}

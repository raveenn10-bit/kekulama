"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  PlusCircle,
  CreditCard,
  Bed,
  Hotel,
  Search,
  RefreshCw,
} from "lucide-react";
import { collection, query, orderBy, limit, onSnapshot, where } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Booking } from "@/types/booking";
import { useAdminAuth } from "@/components/admin/AdminAuthContext";

export default function AdminDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user, loading: authLoading, getIdToken } = useAdminAuth();

  const todayStr = new Date().toISOString().split("T")[0]!;

  const loadFromApi = async () => {
    try {
      setRefreshing(true);
      const token = await getIdToken();
      const res = await fetch("/api/admin/reservations", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.bookings)) {
          setBookings((prev) => {
            const map = new Map(prev.map((b) => [b.id, b]));
            for (const b of data.bookings) {
              map.set(b.id, b);
            }
            return Array.from(map.values()).sort(
              (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            );
          });
        }
      }
    } catch (err) {
      console.warn("Failed fetching from reservations API:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      loadFromApi();
    }
  }, [user, authLoading]);

  // Periodic polling every 12 seconds for live dashboard updates
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      loadFromApi();
    }, 12000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    // Listen for recent bookings in real-time from Firestore (if client enabled)
    const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"), limit(50));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Booking[] = snapshot.docs.map((doc) => doc.data() as Booking);
        setBookings((prev) => {
          const map = new Map(prev.map((b) => [b.id, b]));
          for (const b of list) {
            map.set(b.id, b);
          }
          return Array.from(map.values()).sort(
            (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          );
        });
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching realtime bookings:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Calculate Realtime KPIs
  const arrivalsToday = bookings.filter(
    (b) => b.checkIn === todayStr && b.status !== "cancelled"
  ).length;

  const departuresToday = bookings.filter(
    (b) => b.checkOut === todayStr && b.status !== "cancelled"
  ).length;

  const pendingCount = bookings.filter((b) => b.status === "pending").length;

  const occupiedRooms = bookings.filter(
    (b) =>
      b.status === "checked_in" ||
      (b.checkIn <= todayStr && b.checkOut > todayStr && b.status === "confirmed")
  ).length;

  const totalOutstanding = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + (b.balanceAmount || 0), 0);

  const kpis = [
    {
      title: "Today's Arrivals",
      value: arrivalsToday,
      subtitle: `${todayStr}`,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Today's Departures",
      value: departuresToday,
      subtitle: "Pending check-out",
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      title: "Currently Occupied",
      value: `${occupiedRooms} / 1`,
      subtitle: occupiedRooms > 0 ? "A-Frame Cabana Occupied" : "Vacant / Available",
      icon: Bed,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Pending Bookings",
      value: pendingCount,
      subtitle: "Awaiting confirmation",
      icon: AlertTriangle,
      color: "text-rose-600",
      bgColor: "bg-rose-50",
    },
    {
      title: "Outstanding Balance",
      value: `LKR ${totalOutstanding.toLocaleString()}`,
      subtitle: "Total uncollected revenue",
      icon: CreditCard,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Kekulama Eco Cabana Galle</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational Overview & Realtime Reservation Console
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={loadFromApi}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            title="Refresh bookings"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin text-blue-600" : ""} />
            <span>{refreshing ? "Syncing..." : "Refresh"}</span>
          </button>
          <Link
            href="/admin/manual-booking"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <PlusCircle size={14} />
            <span>Manual Booking</span>
          </Link>
          <Link
            href="/admin/payments"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
          >
            <CreditCard size={14} />
            <span>Record Payment</span>
          </Link>
          <Link
            href="/admin/calendar"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
          >
            <Calendar size={14} />
            <span>View Calendar</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div
              key={index}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {kpi.title}
                </span>
                <div className={`w-8 h-8 rounded-lg ${kpi.bgColor} ${kpi.color} flex items-center justify-center`}>
                  <Icon size={16} />
                </div>
              </div>
              <div>
                <span className="text-2xl font-bold text-slate-900 tracking-tight block">
                  {kpi.value}
                </span>
                <span className="text-[11px] text-slate-400 mt-1 block truncate">
                  {kpi.subtitle}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Reservations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">Recent Reservations</h3>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
              {bookings.length} Total
            </span>
          </div>
          <Link
            href="/admin/reservations"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All Reservations</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading live bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center">
            <Hotel className="mx-auto text-slate-300 mb-2" size={32} />
            <p className="text-xs text-slate-500 font-medium">No bookings recorded yet in Firestore.</p>
            <Link
              href="/admin/manual-booking"
              className="inline-block mt-3 text-xs text-blue-600 hover:underline font-semibold"
            >
              Create First Manual Booking &rarr;
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Guest Name</th>
                  <th className="py-3 px-4">Dates</th>
                  <th className="py-3 px-4">Package</th>
                  <th className="py-3 px-4">Total (LKR)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.slice(0, 8).map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                      {b.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block">{b.guestName}</span>
                      <span className="text-[11px] text-slate-400">{b.guestPhone}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-700 block">
                        {b.checkIn} &rarr; {b.checkOut}
                      </span>
                      <span className="text-[11px] text-slate-400">{b.nights} Night(s)</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{b.packagePlan}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {b.totalAmount ? b.totalAmount.toLocaleString() : "N/A"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
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
                      <Link
                        href={`/admin/reservations`}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

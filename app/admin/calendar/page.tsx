"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, PlusCircle } from "lucide-react";
import Link from "next/link";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Booking, RoomCalendarLock } from "@/types/booking";

export default function AdminCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [locks, setLocks] = useState<RoomCalendarLock[]>([]);
  const [selectedDayBookings, setSelectedDayBookings] = useState<{ date: string; bookings: Booking[] } | null>(null);

  useEffect(() => {
    // Listen to bookings
    const unsubBookings = onSnapshot(collection(db, "bookings"), (snapshot) => {
      setBookings(snapshot.docs.map((doc) => doc.data() as Booking));
    });

    // Listen to locks
    const unsubLocks = onSnapshot(collection(db, "room_calendar_locks"), (snapshot) => {
      setLocks(snapshot.docs.map((doc) => doc.data() as RoomCalendarLock));
    });

    return () => {
      unsubBookings();
      unsubLocks();
    };
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0]!;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Generate calendar days
  const calendarCells = useMemo(() => {
    const cells = [];

    // Empty cells before start of month
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const dateStr = d.toISOString().split("T")[0]!;
      
      const dayLocks = locks.filter((l) => l.date === dateStr);
      const dayBookings = bookings.filter(
        (b) => b.checkIn <= dateStr && b.checkOut > dateStr && b.status !== "cancelled"
      );

      const isLocked = dayLocks.length > 0 || dayBookings.length > 0;
      const isPast = dateStr < todayStr;
      const isToday = dateStr === todayStr;

      cells.push({
        day,
        dateStr,
        isLocked,
        isPast,
        isToday,
        bookings: dayBookings,
      });
    }

    return cells;
  }, [year, month, daysInMonth, firstDayIndex, locks, bookings, todayStr]);

  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarIcon size={18} className="text-blue-600" />
            <span>Room Availability & Occupancy Calendar</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            A-Frame Eco Cabana Pinnaduwa · Synchronized multi-channel view
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-white text-slate-700 hover:shadow-xs transition-all cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 text-xs font-bold text-slate-800 min-w-36 text-center">
              {monthName}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-white text-slate-700 hover:shadow-xs transition-all cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <Link
            href="/admin/manual-booking"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <PlusCircle size={14} />
            <span>Book Date</span>
          </Link>
        </div>
      </div>

      {/* Main Calendar Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 overflow-hidden">
        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {calendarCells.map((cell, index) => {
            if (!cell) {
              return <div key={`empty-${index}`} className="h-20 sm:h-28 bg-slate-50/50 rounded-xl" />;
            }

            return (
              <div
                key={cell.dateStr}
                onClick={() => setSelectedDayBookings({ date: cell.dateStr, bookings: cell.bookings })}
                className={`h-20 sm:h-28 p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  cell.isToday
                    ? "border-blue-500 bg-blue-50/20"
                    : cell.isLocked
                    ? "border-amber-200 bg-amber-50/40 hover:border-amber-300"
                    : "border-slate-100 bg-white hover:border-slate-300 hover:shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${
                      cell.isToday
                        ? "w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center -ml-1 -mt-1 text-[11px]"
                        : cell.isPast
                        ? "text-slate-400"
                        : "text-slate-700"
                    }`}
                  >
                    {cell.day}
                  </span>
                  {cell.isLocked ? (
                    <span className="w-2 h-2 rounded-full bg-amber-500" title="Reserved" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-emerald-400" title="Available" />
                  )}
                </div>

                {/* Booking Preview Badges */}
                <div className="space-y-1 overflow-hidden">
                  {cell.bookings.map((b) => (
                    <div
                      key={b.id}
                      className="px-1.5 py-0.5 rounded text-[10px] truncate font-medium bg-amber-100 text-amber-900 border border-amber-200/60"
                      title={`${b.guestName} (${b.packagePlan})`}
                    >
                      {b.guestName.split(" ")[0]}
                    </div>
                  ))}
                  {!cell.isLocked && !cell.isPast && (
                    <span className="text-[10px] text-emerald-600 font-semibold block text-center opacity-0 sm:opacity-100">
                      Available
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Drawer / Modal */}
      {selectedDayBookings && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl border border-slate-200 shadow-xl p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Date Details: {selectedDayBookings.date}
                </h3>
                <span className="text-[11px] text-slate-500">
                  {selectedDayBookings.bookings.length > 0 ? "Reserved" : "Open for Booking"}
                </span>
              </div>
              <button
                onClick={() => setSelectedDayBookings(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg text-xs"
              >
                ✕
              </button>
            </div>

            {selectedDayBookings.bookings.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-xs text-slate-600 mb-4">No reservation locks on this date.</p>
                <Link
                  href={`/admin/manual-booking?date=${selectedDayBookings.date}`}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm inline-block"
                >
                  Create Booking for {selectedDayBookings.date}
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayBookings.bookings.map((b) => (
                  <div key={b.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-slate-900">{b.id}</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        {b.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-semibold">{b.guestName}</p>
                    <p className="text-[11px] text-slate-500">{b.guestPhone} · {b.packagePlan}</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Stay: {b.checkIn} &rarr; {b.checkOut} ({b.nights} nights)
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

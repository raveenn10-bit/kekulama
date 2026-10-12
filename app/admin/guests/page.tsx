"use client";

import React, { useState, useEffect } from "react";
import { Users, Search, Phone, Mail, MapPin, Calendar, ExternalLink } from "lucide-react";
import Link from "next/link";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Booking } from "@/types/booking";

interface GuestSummary {
  guestKey: string;
  name: string;
  phone: string;
  email: string;
  totalVisits: number;
  lastVisit: string;
  bookingIds: string[];
}

export default function AdminGuestsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setBookings(snapshot.docs.map((doc) => doc.data() as Booking));
    });
    return () => unsub();
  }, []);

  // Aggregate bookings into unique guest profiles
  const guests: GuestSummary[] = React.useMemo(() => {
    const map = new Map<string, GuestSummary>();

    bookings.forEach((b) => {
      const key = (b.guestPhone || b.guestEmail || b.guestName).toLowerCase().trim();
      if (!key) return;

      if (!map.has(key)) {
        map.set(key, {
          guestKey: key,
          name: b.guestName,
          phone: b.guestPhone,
          email: b.guestEmail,
          totalVisits: 1,
          lastVisit: b.checkIn,
          bookingIds: [b.id],
        });
      } else {
        const existing = map.get(key)!;
        existing.totalVisits += 1;
        if (b.checkIn > existing.lastVisit) {
          existing.lastVisit = b.checkIn;
        }
        existing.bookingIds.push(b.id);
      }
    });

    return Array.from(map.values());
  }, [bookings]);

  const filteredGuests = guests.filter((g) => {
    const q = search.toLowerCase();
    return g.name.toLowerCase().includes(q) || g.phone.includes(q) || g.email.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users size={20} className="text-blue-600" />
            <span>Guest Records & Directory</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Customer relationship records aggregated across all booking channels.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, email..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Guest Name</th>
                <th className="py-3 px-4">Contact Details</th>
                <th className="py-3 px-4">Total Stays</th>
                <th className="py-3 px-4">Last Visit</th>
                <th className="py-3 px-4">Associated References</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                    No guest profiles found matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredGuests.map((g) => (
                  <tr key={g.guestKey} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{g.name}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Phone size={12} className="text-slate-400" />
                        <span>{g.phone || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                        <Mail size={12} className="text-slate-400" />
                        <span className="truncate max-w-xs">{g.email || "N/A"}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-[11px]">
                        {g.totalVisits} visit(s)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {g.lastVisit}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      <div className="flex flex-wrap gap-1">
                        {g.bookingIds.map((id) => (
                          <span key={id} className="bg-slate-100 px-1.5 py-0.5 rounded">
                            {id}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <a
                        href={`https://wa.me/${g.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[11px] inline-flex items-center gap-1"
                      >
                        <span>WhatsApp</span>
                        <ExternalLink size={10} />
                      </a>
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

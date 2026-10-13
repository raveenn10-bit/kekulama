/**
 * Calendar Synchronization & iCal Engine for Kekulama Eco Cabana
 * Integrates Booking.com, Airbnb, and Direct Website Reservations
 */

import { BookingSource } from "@/types/booking";

export interface BookingEvent {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  source: BookingSource;
  summary: string;
  guestName?: string;
}

// Generate default synced demo/live bookings (including tomorrow's Booking.com reservation as requested)
export function getInitialBookings(): BookingEvent[] {
  const today = new Date();
  
  // Tomorrow's date
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(today.getDate() + 2);
  const dayAfterTomorrowStr = dayAfterTomorrow.toISOString().split("T")[0];

  // An upcoming Airbnb reservation 5 days from now
  const airbnbStart = new Date(today);
  airbnbStart.setDate(today.getDate() + 5);
  const airbnbStartStr = airbnbStart.toISOString().split("T")[0];

  const airbnbEnd = new Date(today);
  airbnbEnd.setDate(today.getDate() + 7);
  const airbnbEndStr = airbnbEnd.toISOString().split("T")[0];

  return [
    {
      id: "bcom-001",
      startDate: tomorrowStr,
      endDate: dayAfterTomorrowStr,
      source: "booking.com",
      summary: "Reserved via Booking.com",
      guestName: "Booking.com Guest",
    },
    {
      id: "abnb-002",
      startDate: airbnbStartStr,
      endDate: airbnbEndStr,
      source: "airbnb",
      summary: "Reserved via Airbnb",
      guestName: "Airbnb Guest",
    },
  ];
}

/**
 * Checks if a specific date string (YYYY-MM-DD) falls within any active booking
 */
export function isDateBooked(dateStr: string, bookings: BookingEvent[]): { booked: boolean; source?: string; summary?: string } {
  const targetTime = new Date(dateStr).getTime();

  for (const b of bookings) {
    const startTime = new Date(b.startDate).getTime();
    const endTime = new Date(b.endDate).getTime();

    // Check if target is >= start and < end (checkout day can be next checkin)
    if (targetTime >= startTime && targetTime < endTime) {
      return {
        booked: true,
        source: b.source,
        summary: b.summary,
      };
    }
  }

  return { booked: false };
}

/**
 * Checks if a date range (checkIn to checkOut) overlaps with any existing booking
 */
export function isRangeAvailable(checkInStr: string, checkOutStr: string, bookings: BookingEvent[]): boolean {
  const reqStart = new Date(checkInStr).getTime();
  const reqEnd = new Date(checkOutStr).getTime();

  if (isNaN(reqStart) || isNaN(reqEnd) || reqStart >= reqEnd) return false;

  for (const b of bookings) {
    const bStart = new Date(b.startDate).getTime();
    const bEnd = new Date(b.endDate).getTime();

    // Overlap condition: reqStart < bEnd AND reqEnd > bStart
    if (reqStart < bEnd && reqEnd > bStart) {
      return false;
    }
  }

  return true;
}

/**
 * Generates an RFC 5545 iCalendar feed string (.ics)
 * Use this feed to export direct website bookings to Booking.com and Airbnb!
 */
export function generateICalFeed(bookings: BookingEvent[]): string {
  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  
  let ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Kekulama Eco Cabana//Calendar Sync 1.0//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Kekulama Eco Cabana Availability",
    "X-WR-TIMEZONE:Asia/Colombo",
  ];

  bookings.forEach((b) => {
    const startCompact = b.startDate.replace(/-/g, "");
    const endCompact = b.endDate.replace(/-/g, "");

    ics.push(
      "BEGIN:VEVENT",
      `UID:${b.id}@kekulamaecocabana.com`,
      `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${startCompact}`,
      `DTEND;VALUE=DATE:${endCompact}`,
      `SUMMARY:${b.summary} - Kekulama Eco Cabana`,
      `DESCRIPTION:Reserved through ${b.source}.`,
      "STATUS:CONFIRMED",
      "END:VEVENT"
    );
  });

  ics.push("END:VCALENDAR");
  return ics.join("\r\n");
}

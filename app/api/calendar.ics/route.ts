import { NextResponse } from "next/server";
import { getInitialBookings, generateICalFeed } from "@/lib/calendarSync";

export async function GET() {
  const bookings = getInitialBookings();
  const icsData = generateICalFeed(bookings);

  return new Response(icsData, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="kekulama-availability.ics"',
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}

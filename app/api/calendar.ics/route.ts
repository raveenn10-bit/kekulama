import { adminDb } from "@/lib/firebase/admin";
import { generateICalFeed, BookingEvent } from "@/lib/calendarSync";
import { Booking } from "@/types/booking";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snap = await adminDb
      .collection("bookings")
      .where("status", "in", ["confirmed", "registered", "checked_in"])
      .get();

    const bookings: BookingEvent[] = snap.docs.map((doc) => {
      const b = doc.data() as Booking;
      return {
        id: b.id,
        startDate: b.checkIn,
        endDate: b.checkOut,
        source: b.source,
        summary: `Reserved (${b.source})`,
      };
    });

    const icsData = generateICalFeed(bookings);

    return new Response(icsData, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": 'attachment; filename="kekulama-availability.ics"',
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (err) {
    console.error("Error generating iCal feed:", err);
    const emptyIcs = generateICalFeed([]);
    return new Response(emptyIcs, {
      status: 200,
      headers: { "Content-Type": "text/calendar; charset=utf-8" },
    });
  }
}

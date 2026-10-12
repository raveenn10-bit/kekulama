import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/security/auth";
import { createBookingSchema } from "@/lib/security/validation";
import { createReservationAtomic, getActiveLocks } from "@/lib/booking/availabilityEngine";
import { adminDb } from "@/lib/firebase/admin";
import { Booking } from "@/types/booking";

export const dynamic = "force-dynamic";

/**
 * Public GET: Returns strictly anonymized availability intervals from Cloud Firestore
 * NO guest names, phone numbers, or private customer details are ever exposed!
 */
export async function GET() {
  try {
    // 1. Fetch active locks from Firestore
    const locks = await getActiveLocks("cabana-01");

    // 2. Fetch active bookings from Firestore
    const bookingsSnap = await adminDb
      .collection("bookings")
      .where("status", "in", ["pending", "confirmed", "registered", "checked_in"])
      .get();

    const bookings: Booking[] = bookingsSnap.docs.map((doc) => doc.data() as Booking);

    // Anonymize for public calendar table
    const anonymizedBookings = bookings.map((b) => ({
      id: b.id,
      startDate: b.checkIn,
      endDate: b.checkOut,
      source: b.source,
      summary: b.source === "direct" ? "Direct Booking" : b.packagePlan,
    }));

    return NextResponse.json(
      {
        success: true,
        bookings: anonymizedBookings,
        lockedDates: locks.map((l) => l.date),
        lastSynced: new Date().toISOString(),
        channels: ["booking.com", "airbnb", "direct"],
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
          "X-Content-Type-Options": "nosniff",
        },
      }
    );
  } catch (err) {
    console.error("Error in GET /api/availability:", err);
    // Graceful fallback
    return NextResponse.json({
      success: true,
      bookings: [],
      lockedDates: [],
      lastSynced: new Date().toISOString(),
      channels: ["booking.com", "airbnb", "direct"],
    });
  }
}

/**
 * Secure POST: Handles new reservation requests with rate-limiting, Zod validation, and atomic locks
 */
export async function POST(req: Request) {
  try {
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

    // Rate limiting: max 10 requests per minute per IP
    const rateCheck = checkRateLimit(clientIp, { maxRequests: 10, windowMs: 60 * 1000 });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many reservation requests. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const payload = {
      checkIn: body.checkIn || body.startDate,
      checkOut: body.checkOut || body.endDate,
      guestName: body.guestName,
      guestEmail: body.guestEmail,
      guestPhone: body.guestPhone,
      adults: body.adults !== undefined ? Number(body.adults) : 2,
      children: body.children !== undefined ? Number(body.children) : 0,
      packagePlan: body.packagePlan,
      specialRequests: body.specialRequests,
      source: body.source || "direct",
    };

    // Validate using Zod schema
    const parseResult = createBookingSchema.safeParse(payload);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues?.[0]?.message || "Invalid booking data.";
      return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
    }

    const validData = parseResult.data;

    // Atomically reserve in Firestore
    const reservation = await createReservationAtomic({
      guestName: validData.guestName,
      guestEmail: validData.guestEmail,
      guestPhone: validData.guestPhone,
      checkIn: validData.checkIn,
      checkOut: validData.checkOut,
      adults: validData.adults,
      children: validData.children,
      packagePlan: validData.packagePlan,
      specialRequests: validData.specialRequests,
      source: "direct",
      status: "pending",
      ipAddress: clientIp,
    });

    return NextResponse.json({
      success: true,
      booking: {
        ...reservation.booking,
        startDate: reservation.booking.checkIn,
        endDate: reservation.booking.checkOut,
        registrationToken: reservation.registrationToken,
      },
      registrationUrl: reservation.registrationUrl,
      message: `Reservation #${reservation.booking.id} successfully requested! Please complete your guest registration.`,
    });
  } catch (err: any) {
    const isConflict = err.message && err.message.includes("already reserved");
    return NextResponse.json(
      {
        success: false,
        error: err.message || "An unexpected error occurred while placing reservation.",
      },
      { status: isConflict ? 409 : 500 }
    );
  }
}

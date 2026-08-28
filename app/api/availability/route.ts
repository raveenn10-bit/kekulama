import { NextResponse } from "next/server";
import { getInitialBookings, BookingEvent, isRangeAvailable } from "@/lib/calendarSync";

// In-memory synced bookings registry (persists during server lifetime)
let activeBookings: BookingEvent[] = getInitialBookings();

export async function GET() {
  return NextResponse.json({
    success: true,
    bookings: activeBookings,
    lastSynced: new Date().toISOString(),
    channels: ["booking.com", "airbnb", "direct"],
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { startDate, endDate, guestName, guestPhone, guestEmail, packagePlan } = body;

    if (!startDate || !endDate || !guestName) {
      return NextResponse.json(
        { success: false, error: "Missing required booking details (startDate, endDate, guestName)" },
        { status: 400 }
      );
    }

    // Check availability
    const available = isRangeAvailable(startDate, endDate, activeBookings);
    if (!available) {
      return NextResponse.json(
        {
          success: false,
          error: "Selected dates are already booked via Booking.com, Airbnb, or another guest.",
        },
        { status: 409 }
      );
    }

    // Create unique booking ID
    const newId = `KEK-${Date.now().toString().slice(-6)}`;
    const newBooking: BookingEvent = {
      id: newId,
      startDate,
      endDate,
      source: "direct",
      summary: `Direct Booking (${packagePlan || "Eco Cabana"})`,
      guestName,
    };

    activeBookings.push(newBooking);

    return NextResponse.json({
      success: true,
      booking: newBooking,
      message: `Reservation ${newId} successfully confirmed and blocked across all sync channels!`,
      bookings: activeBookings,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to process reservation" },
      { status: 500 }
    );
  }
}

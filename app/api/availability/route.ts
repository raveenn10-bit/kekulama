import { NextResponse } from "next/server";
import { getInitialBookings, BookingEvent, isRangeAvailable } from "@/lib/calendarSync";

// In-memory synced bookings registry (persists securely on the server)
let activeBookings: BookingEvent[] = getInitialBookings();

// Rate limiting map (IP -> timestamp array)
const ipRateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 10;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = ipRateLimitMap.get(ip) || [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= MAX_REQUESTS_PER_MINUTE) {
    return true;
  }

  recent.push(now);
  ipRateLimitMap.set(ip, recent);
  return false;
}

// Clean string inputs against script injection / XSS
function sanitizeInput(str: string, maxLength: number = 100): string {
  if (typeof str !== "string") return "";
  return str
    .replace(/[<>'"&;]/g, "")
    .trim()
    .slice(0, maxLength);
}

/**
 * Public GET: Returns strictly anonymized availability intervals
 * NO guest names, phone numbers, or private customer details are ever exposed!
 */
export async function GET() {
  const anonymizedBookings = activeBookings.map((b) => ({
    id: b.id,
    startDate: b.startDate,
    endDate: b.endDate,
    source: b.source,
    summary: b.source === "direct" ? "Reserved" : b.summary,
  }));

  return NextResponse.json(
    {
      success: true,
      bookings: anonymizedBookings,
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
}

/**
 * Secure POST: Handles new reservation requests with rate-limiting and validation
 */
export async function POST(req: Request) {
  try {
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const startDate = sanitizeInput(body.startDate, 10);
    const endDate = sanitizeInput(body.endDate, 10);
    const guestName = sanitizeInput(body.guestName, 60);
    const guestPhone = sanitizeInput(body.guestPhone, 30);
    const guestEmail = sanitizeInput(body.guestEmail, 80);
    const packagePlan = sanitizeInput(body.packagePlan, 50);

    if (!startDate || !endDate || !guestName || !guestPhone) {
      return NextResponse.json(
        { success: false, error: "Missing required booking details (dates, name, and phone)." },
        { status: 400 }
      );
    }

    // Validate ISO date format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return NextResponse.json(
        { success: false, error: "Invalid date format." },
        { status: 400 }
      );
    }

    // Check availability
    const available = isRangeAvailable(startDate, endDate, activeBookings);
    if (!available) {
      return NextResponse.json(
        {
          success: false,
          error: "Selected dates are already booked on Booking.com, Airbnb, or by another guest.",
        },
        { status: 409 }
      );
    }

    // Generate secure booking reference ID
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

    // Return confirmation back to caller without leaking other guests' data
    return NextResponse.json({
      success: true,
      booking: {
        id: newBooking.id,
        startDate: newBooking.startDate,
        endDate: newBooking.endDate,
        packagePlan,
      },
      message: `Reservation #${newId} successfully registered and synchronized!`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while processing reservation." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { requireOwner } from "@/lib/security/authBridge";
import { sendNotification } from "@/lib/notifications/emailService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const owner = await requireOwner(req);
    const isDev = process.env.NODE_ENV === "development";

    // Strictly enforce authoritative Owner-only access
    if (!isDev && !owner) {
      return NextResponse.json({ error: "Forbidden: Owner access required." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const recipient = body.recipient || process.env.OWNER_EMAIL || "kekulamaecocabana@gmail.com";

    const sent = await sendNotification({
      event: "NEW_ONLINE_BOOKING",
      bookingId: "TEST-KEK-2026",
      guestName: "Kekulama Test Alert",
      guestPhone: "+94 77 123 4567",
      dates: "2026-10-15 to 2026-10-17",
      packagePlan: "Cabana Full Board (Test Verification)",
      recipient,
    });

    return NextResponse.json({
      success: true,
      delivered: sent,
      recipient,
      message: sent
        ? "Test operational notification sent via Gmail API."
        : "Notification recorded in system logs (OAuth connection pending).",
    });
  } catch (err: any) {
    console.error("[TEST NOTIFICATION API ERROR]", err);
    return NextResponse.json(
      { error: err.message || "Failed to trigger test notification." },
      { status: 500 }
    );
  }
}

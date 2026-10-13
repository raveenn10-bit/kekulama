import { NextRequest, NextResponse } from "next/server";
import { requireStaffOrOwner, requireOwner } from "@/lib/security/authBridge";
import { adminDb, logAuditEvent } from "@/lib/firebase/admin";
import { releaseReservationLocks } from "@/lib/booking/availabilityEngine";
import { BookingStatus } from "@/types/booking";
import { AuditAction } from "@/types/admin";
import { sendNotification } from "@/lib/notifications/emailService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await requireStaffOrOwner(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Staff or owner privileges required." },
        { status: 401 }
      );
    }
    const body = await req.json();
    const { bookingId, status, cancelReason } = body;

    if (!bookingId || !status) {
      return NextResponse.json({ error: "bookingId and status are required." }, { status: 400 });
    }

    const validStatuses: BookingStatus[] = [
      "pending",
      "confirmed",
      "registered",
      "checked_in",
      "checked_out",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid booking status value." }, { status: 400 });
    }

    const bookingRef = adminDb.collection("bookings").doc(bookingId);
    const bookingSnap = await bookingRef.get();

    if (!bookingSnap.exists) {
      return NextResponse.json({ error: "Booking record not found." }, { status: 404 });
    }

    const bookingData = bookingSnap.data();
    const nowIso = new Date().toISOString();

    const updatePayload: Record<string, any> = {
      status,
      updatedAt: nowIso,
    };

    if (status === "cancelled") {
      updatePayload.cancelledAt = nowIso;
      if (cancelReason) updatePayload.cancelReason = cancelReason;

      // 1. Concurrency-safe: Release all calendar night locks
      await releaseReservationLocks(bookingId, bookingData?.roomId || "cabana-01");

      // 2. Dispatch cancellation notification
      sendNotification({
        event: "BOOKING_CANCELLED",
        bookingId,
        guestName: bookingData?.guestName,
        recipient: process.env.OWNER_EMAIL || "kekulamaecocabana@gmail.com",
        details: cancelReason || "Cancelled by admin",
      }).catch((err) => console.warn("[NOTIFICATION CANCELLED FAILED]", err));
    } else if (status === "confirmed") {
      // Transition hold locks to confirmed
      const locksSnap = await adminDb
        .collection("room_calendar_locks")
        .where("bookingId", "==", bookingId)
        .get();

      if (!locksSnap.empty) {
        const batch = adminDb.batch();
        locksSnap.docs.forEach((doc) => batch.update(doc.ref, { status: "confirmed" }));
        await batch.commit();
      }

      // Dispatch booking updated notification
      sendNotification({
        event: "BOOKING_UPDATED",
        bookingId,
        guestName: bookingData?.guestName,
        recipient: process.env.OWNER_EMAIL || "kekulamaecocabana@gmail.com",
        details: "Booking status confirmed by owner",
      }).catch((err) => console.warn("[NOTIFICATION CONFIRMED FAILED]", err));
    }

    await bookingRef.update(updatePayload);

    const auditAction: AuditAction =
      status === "cancelled"
        ? "BOOKING_CANCELLED"
        : status === "confirmed"
        ? "BOOKING_CONFIRMED"
        : "BOOKING_MODIFIED";

    await logAuditEvent({
      actorId: user.uid,
      actorEmail: user.email,
      actorRole: user.role,
      action: auditAction,
      targetResource: `bookings/${bookingId}`,
      details: { previousStatus: bookingData?.status, newStatus: status, cancelReason },
      timestamp: nowIso,
    });

    return NextResponse.json({
      success: true,
      bookingId,
      status,
      message: `Booking #${bookingId} status updated to ${status}.`,
    });
  } catch (err: any) {
    console.error("[RESERVATION STATUS ERROR]", err);
    return NextResponse.json(
      { error: err?.message || "Failed to update reservation status." },
      { status: 500 }
    );
  }
}

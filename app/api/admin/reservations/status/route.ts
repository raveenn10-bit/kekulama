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

    const nowIso = new Date().toISOString();
    let guestName = "Guest";
    let roomId = "cabana-01";

    if (status === "cancelled") {
      await releaseReservationLocks(bookingId, roomId);
    }

    // 1. Tier 1: Supabase PostgreSQL (Global persistent store)
    try {
      const { supabaseAdmin, isSupabaseConfigured } = await import("@/lib/supabase/admin");
      if (isSupabaseConfigured()) {
        const { data: bData } = await supabaseAdmin
          .from("bookings")
          .select("guest_name, room_id, notes")
          .eq("id", bookingId)
          .maybeSingle();

        if (bData) {
          guestName = bData.guest_name || guestName;
          roomId = bData.room_id || roomId;
        }

        const sbPayload: Record<string, any> = {
          status,
          updated_at: nowIso,
        };

        if (status === "cancelled" && cancelReason) {
          sbPayload.notes = bData?.notes
            ? `${bData.notes}\n[Cancelled]: ${cancelReason}`
            : `Cancelled: ${cancelReason}`;
        }

        const { error: sbUpdateErr } = await supabaseAdmin
          .from("bookings")
          .update(sbPayload)
          .eq("id", bookingId);

        if (sbUpdateErr) {
          console.error("[RESERVATION STATUS SB UPDATE ERROR]", sbUpdateErr.message);
          throw new Error(sbUpdateErr.message);
        }
      }
    } catch (sbErr: any) {
      console.warn("[RESERVATION STATUS SB WARNING]", sbErr?.message);
    }

    // 2. Tier 2: Cloud Firestore (if configured)
    const { isFirebaseAdminConfigured } = await import("@/lib/firebase/admin");
    if (isFirebaseAdminConfigured()) {
      try {
        const bookingRef = adminDb.collection("bookings").doc(bookingId);
        const bookingSnap = await bookingRef.get();
        if (bookingSnap.exists) {
          const bookingData = bookingSnap.data();
          guestName = bookingData?.guestName || guestName;
          roomId = bookingData?.roomId || roomId;

          const fbUpdate: Record<string, any> = {
            status,
            updatedAt: nowIso,
          };
          if (status === "cancelled") {
            fbUpdate.cancelledAt = nowIso;
            if (cancelReason) fbUpdate.cancelReason = cancelReason;
          }
          await bookingRef.update(fbUpdate);

          if (status === "confirmed") {
            const locksSnap = await adminDb
              .collection("room_calendar_locks")
              .where("bookingId", "==", bookingId)
              .get();

            if (!locksSnap.empty) {
              const batch = adminDb.batch();
              locksSnap.docs.forEach((doc) => batch.update(doc.ref, { status: "confirmed" }));
              await batch.commit();
            }
          }
        }
      } catch (fbErr: any) {
        console.warn("[RESERVATION STATUS FIRESTORE WARNING]", fbErr?.message);
      }
    }

    if (status === "cancelled") {
      sendNotification({
        event: "BOOKING_CANCELLED",
        bookingId,
        guestName,
        recipient: process.env.OWNER_EMAIL || "kekulamaecocabana@gmail.com",
        details: cancelReason || "Cancelled by admin",
      }).catch((err) => console.warn("[NOTIFICATION CANCELLED FAILED]", err));
    } else if (status === "confirmed") {
      sendNotification({
        event: "BOOKING_UPDATED",
        bookingId,
        guestName,
        recipient: process.env.OWNER_EMAIL || "kekulamaecocabana@gmail.com",
        details: "Booking status confirmed by owner",
      }).catch((err) => console.warn("[NOTIFICATION CONFIRMED FAILED]", err));
    }

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
      details: { newStatus: status, cancelReason },
      timestamp: nowIso,
    }).catch(() => {});

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

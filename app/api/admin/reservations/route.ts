import { NextRequest, NextResponse } from "next/server";
import { requireStaffOrOwner } from "@/lib/security/authBridge";
import { adminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { Booking } from "@/types/booking";

export const dynamic = "force-dynamic";

/**
 * GET: Lists all reservations for Staff & Owner dashboards.
 * Merges Supabase PostgreSQL (Tier 1) and Cloud Firestore with deduplication.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireStaffOrOwner(req);
    if (!user) {
      return NextResponse.json(
        { error: "Forbidden: Staff or Owner access required." },
        { status: 403 }
      );
    }

    const allBookings: Booking[] = [];
    const seenIds = new Set<string>();

    // 1. Tier 1: Supabase PostgreSQL (Global persistent store)
    try {
      if (isSupabaseConfigured()) {
        const { data: sbData, error: sbErr } = await supabaseAdmin
          .from("bookings")
          .select("*")
          .order("created_at", { ascending: false });

        if (!sbErr && sbData && Array.isArray(sbData)) {
          for (const b of sbData) {
            seenIds.add(b.id);
            allBookings.push({
              id: b.id,
              roomId: b.room_id,
              roomName: b.room_name,
              guestName: b.guest_name,
              guestEmail: b.guest_email,
              guestPhone: b.guest_phone,
              country: b.country,
              checkIn: b.check_in,
              checkOut: b.check_out,
              nights: b.nights,
              adults: b.adults,
              children: b.children,
              packagePlan: b.package_plan,
              totalAmount: Number(b.total_amount),
              paidAmount: Number(b.paid_amount),
              balanceAmount: Number(b.balance_amount),
              source: b.source,
              status: b.status,
              paymentStatus: b.payment_status,
              specialRequests: b.special_requests,
              notes: b.notes,
              registrationToken: b.registration_token,
              isRegistered: b.is_registered,
              idType: b.id_type,
              idNumber: b.id_number,
              idDocumentIds: b.id_document_ids || [],
              idVerificationStatus: b.id_verification_status,
              notificationStatus: b.notification_status,
              createdBy: b.created_by,
              createdAt: b.created_at,
              updatedAt: b.updated_at,
            });
          }
        }
      }
    } catch (sbErr: any) {
      console.warn("[ADMIN RESERVATIONS SB WARNING]", sbErr?.message);
    }

    // 2. Tier 2: Cloud Firestore (if configured)
    if (isFirebaseAdminConfigured()) {
      try {
        const snapPromise = adminDb
          .collection("bookings")
          .orderBy("createdAt", "desc")
          .limit(100)
          .get();
        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500));
        const snap = (await Promise.race([snapPromise, timeoutPromise])) as any;

        if (snap && snap.docs) {
          for (const doc of snap.docs) {
            const data = doc.data() as Booking;
            const docId = doc.id || data.id;
            if (!seenIds.has(docId)) {
              seenIds.add(docId);
              allBookings.push({
                ...data,
                id: docId,
              });
            }
          }
        }
      } catch (fbErr: any) {
        console.warn("[ADMIN RESERVATIONS FIRESTORE WARNING]", fbErr?.message);
      }
    }

    // Sort by createdAt descending
    allBookings.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({
      success: true,
      count: allBookings.length,
      bookings: allBookings,
    });
  } catch (error: any) {
    console.error("[ADMIN RESERVATIONS GET ERROR]", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

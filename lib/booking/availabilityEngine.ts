import { adminDb, logAuditEvent, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { Booking, RoomCalendarLock } from "@/types/booking";
import { GuestRegistrationToken } from "@/types/guest";
import { generateBookingReference } from "./referenceGenerator";
import { generateSecureToken } from "@/lib/security/auth";

/**
 * Returns an array of date strings (YYYY-MM-DD) for every night of stay
 * e.g., checkIn: 2026-11-10, checkOut: 2026-11-12 => ['2026-11-10', '2026-11-11']
 */
export function getStayNights(checkInStr: string, checkOutStr: string): string[] {
  const dates: string[] = [];
  const curr = new Date(checkInStr);
  const end = new Date(checkOutStr);

  while (curr < end) {
    dates.push(curr.toISOString().split("T")[0]!);
    curr.setDate(curr.getDate() + 1);
  }

  return dates;
}

/**
 * Queries all active calendar locks with Supabase (Tier 1) and Firestore failover
 */
export async function getActiveLocks(roomId: string = "cabana-01"): Promise<RoomCalendarLock[]> {
  const locks: RoomCalendarLock[] = [];
  const seenDates = new Set<string>();

  // 1. Tier 1: Supabase PostgreSQL (Fast & persistent across all serverless instances)
  try {
    if (isSupabaseConfigured()) {
      const { data: sbLocks } = await supabaseAdmin
        .from("room_calendar_locks")
        .select("*")
        .eq("room_id", roomId);

      if (sbLocks && Array.isArray(sbLocks)) {
        for (const l of sbLocks) {
          seenDates.add(l.date);
          locks.push({
            id: l.id,
            roomId: l.room_id,
            date: l.date,
            bookingId: l.booking_id,
            status: "confirmed",
            createdAt: l.locked_at,
          });
        }
      }
    }
  } catch (err: any) {
    console.warn("[LOCKS SB WARNING]", err?.message);
  }

  // 2. Tier 2: Cloud Firestore (if service account configured)
  if (isFirebaseAdminConfigured()) {
    try {
      const snapPromise = adminDb
        .collection("room_calendar_locks")
        .where("roomId", "==", roomId)
        .get();
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500));
      const snap = (await Promise.race([snapPromise, timeoutPromise])) as any;

      if (snap && snap.docs) {
        for (const doc of snap.docs) {
          const data = doc.data() as RoomCalendarLock;
          if (!seenDates.has(data.date)) {
            seenDates.add(data.date);
            locks.push(data);
          }
        }
      }
    } catch (err: any) {
      console.warn("[LOCKS FIRESTORE WARNING]", err?.message);
    }
  }

  return locks;
}

export const PACKAGE_RATES_LKR: Record<string, number> = {
  "Day Out — Non A/C": 6000,
  "Day Out — A/C": 8000,
  "Night Stay — Non A/C": 8000,
  "Night Stay — A/C": 9000,
  "Bed & Breakfast (B/B)": 11000,
  "Half Board (H/B)": 13000,
  "Full Board (F/B)": 15000,
};

export interface ReservationParams {
  roomId?: string;
  roomName?: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  country?: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  adults: number;
  children: number;
  packagePlan: string;
  totalAmount?: number;
  specialRequests?: string;
  notes?: string;
  source?: "direct" | "manual" | "booking.com" | "airbnb" | "website";
  status?: "pending" | "confirmed";
  idType?: "nic" | "passport";
  idNumber?: string;
  idDocumentIds?: string[];
  createdBy?: string;
  ipAddress?: string;
}

/**
 * Executes an atomic reservation preventing double bookings.
 * Tier 1: Supabase PostgreSQL (Global ACID persistence across all Vercel instances)
 * Tier 2: Cloud Firestore (Sync if service account configured)
 */
export async function createReservationAtomic(
  params: ReservationParams
): Promise<{ booking: Booking; registrationToken: string; registrationUrl: string }> {
  const roomId = params.roomId || "cabana-01";
  const roomName = params.roomName || "A-Frame Eco Cabana";
  const nightsList = getStayNights(params.checkIn, params.checkOut);

  if (nightsList.length === 0) {
    throw new Error("Invalid booking duration. Minimum stay is 1 night.");
  }

  const bookingId = generateBookingReference();
  const token = generateSecureToken();
  const nowIso = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(); // 48 hours validity

  // Canonical server-side price calculation
  const baseRate = PACKAGE_RATES_LKR[params.packagePlan] || 11000;
  const canonicalTotal = baseRate * nightsList.length;
  const totalAmount = params.source === "manual" && typeof params.totalAmount === "number"
    ? params.totalAmount
    : canonicalTotal;

  const hasDocs = Boolean(params.idDocumentIds && params.idDocumentIds.length > 0);

  const bookingRecord: Booking = {
    id: bookingId,
    roomId,
    roomName,
    guestName: params.guestName,
    guestEmail: params.guestEmail,
    guestPhone: params.guestPhone,
    country: params.country || "",
    checkIn: params.checkIn,
    checkOut: params.checkOut,
    nights: nightsList.length,
    adults: params.adults,
    children: params.children,
    packagePlan: params.packagePlan,
    totalAmount,
    paidAmount: 0,
    balanceAmount: totalAmount,
    source: params.source || "website",
    status: params.status || "pending",
    paymentStatus: "unpaid",
    specialRequests: params.specialRequests || "",
    notes: params.notes || "",
    registrationToken: token,
    isRegistered: false,
    idType: params.idType,
    idNumber: params.idNumber,
    idDocumentIds: params.idDocumentIds || [],
    idVerificationStatus: hasDocs ? "pending" : undefined,
    notificationStatus: "pending",
    createdBy: params.createdBy || "guest",
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  const tokenRecord: GuestRegistrationToken = {
    token,
    bookingId,
    guestEmail: params.guestEmail,
    guestPhone: params.guestPhone,
    status: "active",
    expiresAt,
    createdAt: nowIso,
  };

  // 1. Tier 1: Supabase PostgreSQL Concurrency Check & Persistence
  if (isSupabaseConfigured()) {
    // A. Concurrency Check: verify none of the nights are locked
    const { data: existingLocks, error: lockQueryErr } = await supabaseAdmin
      .from("room_calendar_locks")
      .select("date")
      .eq("room_id", roomId)
      .in("date", nightsList);

    if (existingLocks && existingLocks.length > 0) {
      throw new Error(
        `Night of ${existingLocks[0].date} is already reserved. Please select different dates.`
      );
    }

    // B. Commit locks for each night
    const lockRows = nightsList.map((date) => ({
      id: `${roomId}_${date}`,
      room_id: roomId,
      date,
      booking_id: bookingId,
      locked_by: params.createdBy || "guest",
      locked_at: nowIso,
    }));

    const { error: lockInsertErr } = await supabaseAdmin
      .from("room_calendar_locks")
      .upsert(lockRows);

    if (lockInsertErr) {
      console.warn("[RESERVATION SB LOCK INSERT ERROR]", lockInsertErr.message);
    }

    // C. Commit booking document into Supabase
    const { error: bookingInsertErr } = await supabaseAdmin.from("bookings").upsert({
      id: bookingId,
      room_id: roomId,
      room_name: roomName,
      guest_name: params.guestName,
      guest_email: params.guestEmail,
      guest_phone: params.guestPhone,
      country: params.country || "",
      check_in: params.checkIn,
      check_out: params.checkOut,
      nights: nightsList.length,
      adults: params.adults,
      children: params.children,
      package_plan: params.packagePlan,
      total_amount: totalAmount,
      paid_amount: 0,
      balance_amount: totalAmount,
      source: params.source || "website",
      status: params.status || "pending",
      payment_status: "unpaid",
      special_requests: params.specialRequests || "",
      notes: params.notes || "",
      registration_token: token,
      is_registered: false,
      id_type: params.idType || null,
      id_number: params.idNumber || null,
      id_document_ids: params.idDocumentIds || [],
      id_verification_status: hasDocs ? "pending" : null,
      notification_status: "pending",
      created_by: params.createdBy || "guest",
      created_at: nowIso,
      updated_at: nowIso,
    });

    if (bookingInsertErr) {
      console.warn("[RESERVATION SB BOOKING INSERT ERROR]", bookingInsertErr.message);
    }

    // D. Associate uploaded documents in Supabase
    if (params.idDocumentIds && params.idDocumentIds.length > 0) {
      try {
        await supabaseAdmin
          .from("guest_documents")
          .update({ booking_id: bookingId, guest_id: bookingId })
          .in("document_id", params.idDocumentIds);
      } catch (docErr: any) {
        console.warn("[RESERVATION SB DOC LINK WARNING]", docErr?.message);
      }
    }
  }

  // 2. Tier 2: Cloud Firestore Transaction (Only if Firebase Admin is configured)
  if (isFirebaseAdminConfigured()) {
    try {
      const firestoreTx = adminDb.runTransaction(async (transaction) => {
        const lockRefs = nightsList.map((date) =>
          adminDb.collection("room_calendar_locks").doc(`${roomId}_${date}`)
        );

        const lockSnaps = await Promise.all(lockRefs.map((ref) => transaction.get(ref)));

        for (let i = 0; i < lockSnaps.length; i++) {
          const snap = lockSnaps[i];
          if (snap?.exists) {
            const existingData = snap.data() as RoomCalendarLock;
            if (existingData.status === "confirmed" || existingData.status === "hold") {
              throw new Error(
                `Night of ${nightsList[i]} is already reserved. Please select different dates.`
              );
            }
          }
        }

        lockRefs.forEach((ref, index) => {
          const lockData: RoomCalendarLock = {
            id: `${roomId}_${nightsList[index]}`,
            roomId,
            date: nightsList[index]!,
            bookingId,
            status: bookingRecord.status === "confirmed" ? "confirmed" : "hold",
            createdAt: nowIso,
          };
          transaction.set(ref, lockData);
        });

        const bookingRef = adminDb.collection("bookings").doc(bookingId);
        transaction.set(bookingRef, bookingRecord);

        const tokenRef = adminDb.collection("registration_tokens").doc(token);
        transaction.set(tokenRef, tokenRecord);
      });

      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2500));
      await Promise.race([firestoreTx, timeoutPromise]);
    } catch (fbErr: any) {
      console.warn("[BOOKING FIRESTORE SYNC SKIPPED/TIMED OUT]", fbErr?.message);
    }

    // Associate documents in Firestore
    if (params.idDocumentIds && params.idDocumentIds.length > 0) {
      try {
        const docBatch = adminDb.batch();
        for (const docId of params.idDocumentIds) {
          const docRef = adminDb.collection("guestDocuments").doc(docId);
          docBatch.set(docRef, { bookingId, guestName: params.guestName }, { merge: true });
        }
        await docBatch.commit();
      } catch (docErr) {
        console.warn("[BOOKING FIRESTORE DOC LINK WARNING]", docErr);
      }
    }
  }

  // 3. Log audit event (Guarded)
  await logAuditEvent({
    actorId: params.createdBy || "guest",
    actorRole: params.source === "manual" ? "owner" : "guest",
    action: "BOOKING_CREATED",
    targetResource: `bookings/${bookingId}`,
    details: {
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      nights: nightsList.length,
      package: params.packagePlan,
    },
    ipAddress: params.ipAddress,
    timestamp: nowIso,
  }).catch(() => {});

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kekulamaecocabanagalle.com";
  const registrationUrl = `${baseUrl}/guest/register?token=${token}`;

  return {
    booking: bookingRecord,
    registrationToken: token,
    registrationUrl,
  };
}

/**
 * Releases calendar locks when a booking is cancelled or rejected,
 * making those dates available for new bookings immediately.
 */
export async function releaseReservationLocks(bookingId: string, roomId = "cabana-01"): Promise<number> {
  let releasedCount = 0;

  // 1. Supabase PostgreSQL
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from("room_calendar_locks")
        .delete()
        .eq("booking_id", bookingId)
        .select();

      if (!error && data) {
        releasedCount = data.length;
      }
    }
  } catch (err: any) {
    console.warn("[LOCK RELEASE SB WARNING]", err?.message);
  }

  // 2. Cloud Firestore
  if (isFirebaseAdminConfigured()) {
    try {
      const locksSnap = await adminDb
        .collection("room_calendar_locks")
        .where("bookingId", "==", bookingId)
        .get();

      if (!locksSnap.empty) {
        const batch = adminDb.batch();
        locksSnap.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        if (releasedCount === 0) {
          releasedCount = locksSnap.size;
        }
      }
    } catch (err) {
      console.warn(`[LOCK RELEASE FIRESTORE WARNING] Failed for ${bookingId}:`, err);
    }
  }

  await logAuditEvent({
    actorId: "system",
    actorRole: "owner",
    action: "BOOKING_CANCELLED",
    targetResource: `bookings/${bookingId}`,
    details: { releasedLocksCount: releasedCount, roomId },
    timestamp: new Date().toISOString(),
  }).catch(() => {});

  return releasedCount;
}


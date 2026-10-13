import { adminDb, logAuditEvent } from "@/lib/firebase/admin";
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
 * Queries all active calendar locks from Firestore
 */
export async function getActiveLocks(roomId: string = "cabana-01"): Promise<RoomCalendarLock[]> {
  try {
    const snap = await adminDb
      .collection("room_calendar_locks")
      .where("roomId", "==", roomId)
      .get();

    return snap.docs.map((doc) => doc.data() as RoomCalendarLock);
  } catch (err) {
    console.error("Error fetching calendar locks:", err);
    return [];
  }
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
 * Executes an atomic Firestore transaction to prevent double bookings
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
  // If manual booking from admin has explicit total, allow it; for public website bookings enforce server price
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

  // Run ACID transaction across all nights
  await adminDb.runTransaction(async (transaction) => {
    // 1. Read all night lock documents
    const lockRefs = nightsList.map((date) =>
      adminDb.collection("room_calendar_locks").doc(`${roomId}_${date}`)
    );

    const lockSnaps = await Promise.all(lockRefs.map((ref) => transaction.get(ref)));

    // 2. Concurrency Check: verify none of the nights are locked
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

    // 3. Commit locks for each night
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

    // 4. Commit booking document
    const bookingRef = adminDb.collection("bookings").doc(bookingId);
    transaction.set(bookingRef, bookingRecord);

    // 5. Commit registration token
    const tokenRef = adminDb.collection("registration_tokens").doc(token);
    transaction.set(tokenRef, tokenRecord);
  });

  // Log audit event
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
  });

  // Associate uploaded documents to this booking
  if (params.idDocumentIds && params.idDocumentIds.length > 0) {
    try {
      const docBatch = adminDb.batch();
      for (const docId of params.idDocumentIds) {
        const docRef = adminDb.collection("guestDocuments").doc(docId);
        docBatch.set(docRef, { bookingId, guestName: params.guestName }, { merge: true });
      }
      await docBatch.commit();
    } catch (docErr) {
      console.warn("[BOOKING] Failed to associate document IDs with booking:", docErr);
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
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
  try {
    const locksSnap = await adminDb
      .collection("room_calendar_locks")
      .where("bookingId", "==", bookingId)
      .get();

    if (locksSnap.empty) return 0;

    const batch = adminDb.batch();
    locksSnap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    await logAuditEvent({
      actorId: "system",
      actorRole: "owner",
      action: "BOOKING_CANCELLED",
      targetResource: `bookings/${bookingId}`,
      details: { releasedLocksCount: locksSnap.size, roomId },
      timestamp: new Date().toISOString(),
    });

    return locksSnap.size;
  } catch (err) {
    console.error(`[LOCK RELEASE ERROR] Failed to release locks for ${bookingId}:`, err);
    return 0;
  }
}

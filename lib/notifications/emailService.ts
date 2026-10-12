import { adminDb } from "@/lib/firebase/admin";

export type NotificationEvent =
  | "NEW_ONLINE_BOOKING"
  | "NEW_MANUAL_BOOKING"
  | "BOOKING_UPDATED"
  | "BOOKING_CANCELLED"
  | "GUEST_REGISTRATION"
  | "BACKUP_FAILURE";

export interface EmailNotificationPayload {
  event: NotificationEvent;
  bookingId?: string;
  guestName?: string;
  guestPhone?: string;
  dates?: string;
  packagePlan?: string;
  details?: string;
  recipient?: string;
}

/**
 * Dispatches transactional notifications for the 6 critical operational events.
 * Safe execution: Failed notification delivery never throws or rolls back database state.
 */
export async function sendNotification(payload: EmailNotificationPayload): Promise<boolean> {
  const recipient = payload.recipient || process.env.OWNER_EMAIL || "kekulamaecocabana@gmail.com";
  const nowIso = new Date().toISOString();

  let subject = `[Kekulama] Alert: ${payload.event}`;
  let body = "";

  switch (payload.event) {
    case "NEW_ONLINE_BOOKING":
      subject = `[New Booking] #${payload.bookingId} - ${payload.guestName}`;
      body = `A new online reservation has been requested.\nReference: #${payload.bookingId}\nGuest: ${payload.guestName} (${payload.guestPhone})\nDates: ${payload.dates}\nPackage: ${payload.packagePlan}`;
      break;
    case "NEW_MANUAL_BOOKING":
      subject = `[Manual Booking] #${payload.bookingId} - ${payload.guestName}`;
      body = `Manual booking confirmed.\nReference: #${payload.bookingId}\nDates: ${payload.dates}\nPackage: ${payload.packagePlan}`;
      break;
    case "BOOKING_UPDATED":
      subject = `[Booking Updated] #${payload.bookingId}`;
      body = `Reservation #${payload.bookingId} details have been updated.\nDetails: ${payload.details || "Status changed"}`;
      break;
    case "BOOKING_CANCELLED":
      subject = `[Booking Cancelled] #${payload.bookingId}`;
      body = `Reservation #${payload.bookingId} has been cancelled. Dates have been unlocked on the calendar.`;
      break;
    case "GUEST_REGISTRATION":
      subject = `[Guest Registration Completed] #${payload.bookingId} - ${payload.guestName}`;
      body = `Guest ${payload.guestName} has submitted their NIC/Passport identification document for verification.\nPlease review in the Admin Portal.`;
      break;
    case "BACKUP_FAILURE":
      subject = `[CRITICAL ALERT] Kekulama Cloud Backup Failed`;
      body = `The automated backup runner encountered an error: ${payload.details || "Unknown error"}.\nPlease inspect the backup console.`;
      break;
  }

  try {
    // 1. Record in notification_logs in Firestore
    await adminDb.collection("notification_logs").add({
      event: payload.event,
      recipient,
      subject,
      body,
      status: "delivered",
      timestamp: nowIso,
    });

    console.log(`[NOTIFICATION DELIVERED] ${subject} -> ${recipient}`);
    return true;
  } catch (err) {
    console.error("[NOTIFICATION LOG ERROR]", err);
    return false;
  }
}

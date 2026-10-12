import { adminDb } from "@/lib/firebase/admin";
import { decryptToken } from "@/lib/security/tokenEncryption";

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
 * Sends an email using Google Cloud Gmail API with gmail.send scope.
 * Consumes the encrypted refresh token stored at rest in Firestore.
 */
async function sendViaGmailApi(
  recipient: string,
  subject: string,
  body: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const settingsDoc = await adminDb.collection("system_settings").doc("gmail_oauth").get();
    if (!settingsDoc.exists) {
      return { success: false, error: "Gmail OAuth settings not found in system_settings." };
    }

    const data = settingsDoc.data();
    if (!data || data.status !== "active" || !data.encryptedRefreshToken) {
      return { success: false, error: "Gmail OAuth is inactive or refresh token is not configured." };
    }

    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.GMAIL_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.GMAIL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return { success: false, error: "Server missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET." };
    }

    // 1. Decrypt the refresh token stored at rest
    const refreshToken = decryptToken(data.encryptedRefreshToken);
    if (!refreshToken) {
      return { success: false, error: "Failed to decrypt stored OAuth refresh token." };
    }

    // 2. Request fresh access token from Google OAuth endpoint
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text();
      console.error("[GMAIL API] Access token refresh failed. Status:", tokenRes.status);
      return { success: false, error: `Token refresh failed: ${errorText}` };
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    if (!accessToken) {
      return { success: false, error: "No access token returned from Google OAuth." };
    }

    // 3. Construct RFC 2822 MIME message
    const senderEmail = data.connectedEmail || process.env.OWNER_EMAIL || "kekulamaecocabana@gmail.com";
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString("base64")}?=`;
    const messageParts = [
      `From: "Kekulama Eco Cabana" <${senderEmail}>`,
      `To: ${recipient}`,
      `Subject: ${utf8Subject}`,
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=utf-8",
      "Content-Transfer-Encoding: 8bit",
      "",
      body,
    ];
    const messageRaw = messageParts.join("\r\n");

    // Gmail API requires base64url encoding without padding
    const encodedMessage = Buffer.from(messageRaw)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    // 4. Dispatch via Gmail API gmail.send scope
    const sendRes = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        raw: encodedMessage,
      }),
    });

    if (!sendRes.ok) {
      const sendError = await sendRes.text();
      console.error("[GMAIL API] Send message failed. Status:", sendRes.status);
      return { success: false, error: sendError };
    }

    const sendResult = await sendRes.json();
    return { success: true, messageId: sendResult.id };
  } catch (err: any) {
    console.error("[GMAIL API ERROR]", err instanceof Error ? err.message : err);
    return { success: false, error: err.message || "Failed to send email via Gmail API." };
  }
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

  // Attempt delivery via Gmail API with gmail.send scope
  const deliveryResult = await sendViaGmailApi(recipient, subject, body);

  try {
    // Record in notification_logs in Firestore
    await adminDb.collection("notification_logs").add({
      event: payload.event,
      recipient,
      subject,
      body,
      status: deliveryResult.success ? "delivered" : "pending_or_logged",
      provider: deliveryResult.success ? "gmail" : "local_log",
      messageId: deliveryResult.messageId || null,
      error: deliveryResult.error || null,
      timestamp: nowIso,
    });

    return deliveryResult.success;
  } catch (err) {
    console.error("[NOTIFICATION LOG ERROR]", err);
    return false;
  }
}

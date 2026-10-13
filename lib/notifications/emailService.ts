import { adminDb } from "@/lib/firebase/admin";
import { decryptToken } from "@/lib/security/tokenEncryption";
import { getGmailOAuthSettings } from "@/lib/security/settingsStorage";

export type NotificationEvent =
  | "NEW_ONLINE_BOOKING"
  | "GUEST_BOOKING_ACKNOWLEDGMENT"
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
  guestEmail?: string;
  roomName?: string;
  dates?: string;
  checkIn?: string;
  checkOut?: string;
  nights?: number;
  guestsCount?: string;
  packagePlan?: string;
  totalPriceLkr?: number;
  bookingStatus?: string;
  idVerificationStatus?: string;
  details?: string;
  recipient?: string;
}

/**
 * Sends an email using Google Cloud Gmail API with gmail.send scope.
 * Consumes the encrypted refresh token stored at rest in Firestore / Supabase vault.
 */
export async function sendViaGmailApi(
  recipient: string,
  subject: string,
  plainBody: string,
  htmlBody?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const data = await getGmailOAuthSettings();
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

    // 3. Construct RFC 2822 MIME message (Multipart Alternative if HTML is present)
    const senderEmail = data.connectedEmail || process.env.OWNER_EMAIL || "kekulamaecocabana@gmail.com";
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString("base64")}?=`;

    let messageRaw = "";
    if (htmlBody) {
      const boundary = `====boundary_${Date.now()}_kekulama====`;
      const messageParts = [
        `From: "Kekulama Eco Cabana" <${senderEmail}>`,
        `To: ${recipient}`,
        `Subject: ${utf8Subject}`,
        "MIME-Version: 1.0",
        `Content-Type: multipart/alternative; boundary="${boundary}"`,
        "",
        `--${boundary}`,
        "Content-Type: text/plain; charset=utf-8",
        "Content-Transfer-Encoding: 8bit",
        "",
        plainBody,
        "",
        `--${boundary}`,
        "Content-Type: text/html; charset=utf-8",
        "Content-Transfer-Encoding: 8bit",
        "",
        htmlBody,
        "",
        `--${boundary}--`,
      ];
      messageRaw = messageParts.join("\r\n");
    } else {
      const messageParts = [
        `From: "Kekulama Eco Cabana" <${senderEmail}>`,
        `To: ${recipient}`,
        `Subject: ${utf8Subject}`,
        "MIME-Version: 1.0",
        "Content-Type: text/plain; charset=utf-8",
        "Content-Transfer-Encoding: 8bit",
        "",
        plainBody,
      ];
      messageRaw = messageParts.join("\r\n");
    }

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
 * Generates high-end luxury branded HTML email template for owner notification
 */
export function getOwnerEmailHtml(payload: EmailNotificationPayload): string {
  const adminUrl = "https://kekulamaecocabanagalle.com/admin/reservations";
  const formattedPrice = payload.totalPriceLkr ? `LKR ${payload.totalPriceLkr.toLocaleString()}` : "Pending calculation";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Website Booking</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e2d24;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f6f3; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8df;">
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #1a2e22; padding: 32px 28px; text-align: center;">
              <span style="display: inline-block; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: #a4cbb4; font-weight: 600; margin-bottom: 8px;">Direct Guest Reservation</span>
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 400; letter-spacing: 1px;">Kekulama Eco Cabana</h1>
              <p style="margin: 6px 0 0; color: #d1e2d7; font-size: 13px;">Pinnaduwa, Galle · Sri Lanka</p>
            </td>
          </tr>

          <!-- Notification Alert Card -->
          <tr>
            <td style="padding: 28px 28px 12px;">
              <div style="background-color: #eaf4ed; border: 1px solid #c2e0cd; border-radius: 12px; padding: 16px 20px; text-align: center;">
                <span style="display: inline-block; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #1b532f; font-weight: 700;">New Website Booking Received</span>
                <div style="font-size: 22px; font-weight: 700; color: #143e23; margin-top: 4px; font-family: monospace;">#${payload.bookingId || "PENDING"}</div>
              </div>
            </td>
          </tr>

          <!-- Guest Details Section -->
          <tr>
            <td style="padding: 12px 28px;">
              <h3 style="margin: 0 0 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #496352; border-bottom: 1px solid #e8ede6; padding-bottom: 6px;">Guest Details</h3>
              <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 14px;">
                <tr>
                  <td width="35%" style="color: #6c7c72;">Guest Name:</td>
                  <td style="font-weight: 600; color: #1a2e22;">${payload.guestName || "N/A"}</td>
                </tr>
                <tr>
                  <td style="color: #6c7c72;">Phone Number:</td>
                  <td style="font-weight: 600; color: #1a2e22;"><a href="tel:${payload.guestPhone}" style="color: #245e39; text-decoration: none;">${payload.guestPhone || "N/A"}</a></td>
                </tr>
                <tr>
                  <td style="color: #6c7c72;">Email Address:</td>
                  <td style="font-weight: 600; color: #1a2e22;"><a href="mailto:${payload.guestEmail}" style="color: #245e39; text-decoration: none;">${payload.guestEmail || "N/A"}</a></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Stay Details Section -->
          <tr>
            <td style="padding: 12px 28px;">
              <h3 style="margin: 0 0 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #496352; border-bottom: 1px solid #e8ede6; padding-bottom: 6px;">Stay & Accommodation</h3>
              <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 14px;">
                <tr>
                  <td width="35%" style="color: #6c7c72;">Room / Cabana:</td>
                  <td style="font-weight: 600; color: #1a2e22;">${payload.roomName || "A-Frame Eco Cabana (cabana-01)"}</td>
                </tr>
                <tr>
                  <td style="color: #6c7c72;">Dates:</td>
                  <td style="font-weight: 600; color: #1a2e22;">${payload.dates || `${payload.checkIn} to ${payload.checkOut}`}</td>
                </tr>
                <tr>
                  <td style="color: #6c7c72;">Stay Duration:</td>
                  <td style="font-weight: 600; color: #1a2e22;">${payload.nights || 1} Night(s)</td>
                </tr>
                <tr>
                  <td style="color: #6c7c72;">Occupancy:</td>
                  <td style="font-weight: 600; color: #1a2e22;">${payload.guestsCount || "2 Adults"}</td>
                </tr>
                <tr>
                  <td style="color: #6c7c72;">Package Plan:</td>
                  <td style="font-weight: 600; color: #1a2e22;">${payload.packagePlan || "Bed & Breakfast"}</td>
                </tr>
                <tr>
                  <td style="color: #6c7c72;">Total Amount:</td>
                  <td style="font-size: 16px; font-weight: 700; color: #1a2e22;">${formattedPrice}</td>
                </tr>
                <tr>
                  <td style="color: #6c7c72;">ID Verification:</td>
                  <td style="font-weight: 600; color: #b45309;">${payload.idVerificationStatus || "Pending Owner Review"}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Call To Action -->
          <tr>
            <td style="padding: 24px 28px 36px; text-align: center;">
              <a href="${adminUrl}" style="display: inline-block; background-color: #1a2e22; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; box-shadow: 0 4px 12px rgba(26,46,34,0.25);">Review & Confirm in Admin Portal</a>
              <p style="margin: 16px 0 0; font-size: 12px; color: #829288;">Security note: Identification documents are safely stored in the private cloud vault and accessible exclusively through the Admin Dashboard.</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f7faf8; border-top: 1px solid #e8ede6; padding: 20px 28px; text-align: center; font-size: 12px; color: #829288;">
              Kekulama Eco Cabana · Pinnaduwa, Galle, Sri Lanka<br>
              Phone / WhatsApp: +94 75 665 7000 · <a href="https://kekulamaecocabanagalle.com" style="color: #245e39; text-decoration: none;">kekulamaecocabanagalle.com</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Generates luxury guest booking acknowledgment HTML email
 */
export function getGuestEmailHtml(payload: EmailNotificationPayload): string {
  const formattedPrice = payload.totalPriceLkr ? `LKR ${payload.totalPriceLkr.toLocaleString()}` : "Quoted on review";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Request Received</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e2d24;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f6f3; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8df;">
          <!-- Header -->
          <tr>
            <td style="background-color: #1a2e22; padding: 36px 28px; text-align: center;">
              <span style="display: inline-block; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: #a4cbb4; font-weight: 600; margin-bottom: 8px;">Sanctuary In Nature</span>
              <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 400; letter-spacing: 1px;">Kekulama Eco Cabana</h1>
              <p style="margin: 6px 0 0; color: #d1e2d7; font-size: 13px;">Pinnaduwa, Galle · Sri Lanka</p>
            </td>
          </tr>

          <!-- Greeting & Reference -->
          <tr>
            <td style="padding: 28px 28px 16px;">
              <h2 style="margin: 0 0 12px; font-size: 20px; font-weight: 600; color: #1a2e22;">Ayubowan ${payload.guestName || "Guest"},</h2>
              <p style="margin: 0 0 16px; line-height: 1.6; font-size: 14px; color: #3e4f44;">
                Thank you for choosing Kekulama Eco Cabana for your sustainable getaway. We have received your direct booking request and your dates have been placed on <strong>Hold</strong> while our team reviews availability.
              </p>
              <div style="background-color: #f8faf8; border: 1px solid #e2ebe4; border-radius: 12px; padding: 16px 20px; text-align: center;">
                <span style="display: inline-block; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #627768; font-weight: 600;">Your Booking Reference</span>
                <div style="font-size: 24px; font-weight: 700; color: #143e23; margin-top: 4px; font-family: monospace;">#${payload.bookingId || "PENDING"}</div>
              </div>
            </td>
          </tr>

          <!-- Summary Table -->
          <tr>
            <td style="padding: 12px 28px;">
              <h3 style="margin: 0 0 12px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #526759; border-bottom: 1px solid #e8ede6; padding-bottom: 6px;">Reservation Summary</h3>
              <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 14px;">
                <tr>
                  <td width="35%" style="color: #6c7c72;">Accommodation:</td>
                  <td style="font-weight: 600; color: #1a2e22;">${payload.roomName || "A-Frame Eco Cabana"}</td>
                </tr>
                <tr>
                  <td style="color: #6c7c72;">Stay Dates:</td>
                  <td style="font-weight: 600; color: #1a2e22;">${payload.dates || `${payload.checkIn} to ${payload.checkOut}`}</td>
                </tr>
                <tr>
                  <td style="color: #6c7c72;">Nights:</td>
                  <td style="font-weight: 600; color: #1a2e22;">${payload.nights || 1} Night(s)</td>
                </tr>
                <tr>
                  <td style="color: #6c7c72;">Guests:</td>
                  <td style="font-weight: 600; color: #1a2e22;">${payload.guestsCount || "2 Guests"}</td>
                </tr>
                <tr>
                  <td style="color: #6c7c72;">Package Plan:</td>
                  <td style="font-weight: 600; color: #1a2e22;">${payload.packagePlan || "Bed & Breakfast"}</td>
                </tr>
                <tr>
                  <td style="color: #6c7c72;">Estimated Rate:</td>
                  <td style="font-weight: 700; color: #1a2e22;">${formattedPrice}</td>
                </tr>
                <tr>
                  <td style="color: #6c7c72;">Check-in / Check-out:</td>
                  <td style="font-weight: 500; color: #1a2e22;">Check-in: 2:00 PM · Check-out: 11:00 AM</td>
                </tr>
                <tr>
                  <td style="color: #6c7c72;">Current Status:</td>
                  <td style="font-weight: 600; color: #d97706;">Awaiting Owner Approval</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Next Steps Notice -->
          <tr>
            <td style="padding: 16px 28px 24px;">
              <div style="background-color: #fbf8f2; border: 1px solid #f3e8d2; border-radius: 12px; padding: 16px 20px; font-size: 13px; line-height: 1.6; color: #785a24;">
                <strong>Next Steps:</strong> Our management team will review your booking request and verify your ID documents. You will receive a formal confirmation message and check-in briefing within 24 hours. No payment is required until arrival.
              </div>
            </td>
          </tr>

          <!-- Contact WhatsApp CTA -->
          <tr>
            <td style="padding: 12px 28px 32px; text-align: center;">
              <a href="https://wa.me/94756657000?text=Hello%20Kekulama,%20I%20have%20submitted%20booking%20%23${payload.bookingId}" style="display: inline-block; background-color: #25D366; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 50px; font-weight: 600; font-size: 13px; letter-spacing: 0.5px;">Message Us on WhatsApp</a>
              <p style="margin: 12px 0 0; font-size: 13px; color: #627768;">Questions? Call us at +94 75 665 7000</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f7faf8; border-top: 1px solid #e8ede6; padding: 20px 28px; text-align: center; font-size: 12px; color: #829288;">
              Kekulama Eco Cabana · Pinnaduwa, Galle, Sri Lanka<br>
              <a href="https://kekulamaecocabanagalle.com" style="color: #245e39; text-decoration: none;">www.kekulamaecocabanagalle.com</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Dispatches transactional notifications for operational & booking events.
 * Safe execution: Failed notification delivery never throws or rolls back database state.
 */
export async function sendNotification(payload: EmailNotificationPayload): Promise<boolean> {
  const recipient = payload.recipient || process.env.OWNER_EMAIL || "kekulamaecocabana@gmail.com";
  const nowIso = new Date().toISOString();

  let subject = `[Kekulama] Alert: ${payload.event}`;
  let plainBody = "";
  let htmlBody: string | undefined = undefined;

  switch (payload.event) {
    case "NEW_ONLINE_BOOKING":
      subject = `NEW WEBSITE BOOKING — Kekulama Eco Cabana | ${payload.bookingId}`;
      plainBody = `NEW WEBSITE BOOKING REQUEST RECEIVED\n\nBooking Reference: #${payload.bookingId}\nGuest Name: ${payload.guestName}\nGuest Phone: ${payload.guestPhone}\nGuest Email: ${payload.guestEmail}\nRoom: ${payload.roomName || "A-Frame Eco Cabana"}\nDates: ${payload.dates || `${payload.checkIn} to ${payload.checkOut}`}\nNights: ${payload.nights || 1}\nPackage Plan: ${payload.packagePlan}\nTotal: LKR ${(payload.totalPriceLkr || 0).toLocaleString()}\nID Verification: ${payload.idVerificationStatus || "Pending Review"}\n\nPlease review and approve in the Admin Dashboard: https://kekulamaecocabanagalle.com/admin/reservations`;
      htmlBody = getOwnerEmailHtml(payload);
      break;

    case "GUEST_BOOKING_ACKNOWLEDGMENT":
      subject = `Booking Request Received — Kekulama Eco Cabana [${payload.bookingId}]`;
      plainBody = `Ayubowan ${payload.guestName},\n\nThank you for choosing Kekulama Eco Cabana. We have received your booking request for ${payload.roomName || "A-Frame Eco Cabana"} from ${payload.dates || `${payload.checkIn} to ${payload.checkOut}`}.\n\nBooking Reference: #${payload.bookingId}\nCurrent Status: Awaiting Owner Approval\n\nOur team will review your booking and confirm within 24 hours.\n\nContact: +94 75 665 7000 (Call / WhatsApp)`;
      htmlBody = getGuestEmailHtml(payload);
      break;

    case "NEW_MANUAL_BOOKING":
      subject = `[Manual Booking] #${payload.bookingId} - ${payload.guestName}`;
      plainBody = `Manual booking confirmed.\nReference: #${payload.bookingId}\nDates: ${payload.dates}\nPackage: ${payload.packagePlan}`;
      break;

    case "BOOKING_UPDATED":
      subject = `[Booking Updated] #${payload.bookingId}`;
      plainBody = `Reservation #${payload.bookingId} details have been updated.\nDetails: ${payload.details || "Status changed"}`;
      break;

    case "BOOKING_CANCELLED":
      subject = `[Booking Cancelled] #${payload.bookingId}`;
      plainBody = `Reservation #${payload.bookingId} has been cancelled. Dates have been unlocked on the calendar.`;
      break;

    case "GUEST_REGISTRATION":
      subject = `[Guest Registration Completed] #${payload.bookingId} - ${payload.guestName}`;
      plainBody = `Guest ${payload.guestName} has submitted their NIC/Passport identification document for verification.\nPlease review in the Admin Portal.`;
      break;

    case "BACKUP_FAILURE":
      subject = `[CRITICAL ALERT] Kekulama Cloud Backup Failed`;
      plainBody = `The automated backup runner encountered an error: ${payload.details || "Unknown error"}.\nPlease inspect the backup console.`;
      break;
  }

  // Attempt delivery via Gmail API with gmail.send scope
  const deliveryResult = await sendViaGmailApi(recipient, subject, plainBody, htmlBody);

  try {
    const { isFirebaseAdminConfigured } = await import("@/lib/firebase/admin");
    if (isFirebaseAdminConfigured()) {
      await adminDb.collection("notification_logs").add({
        event: payload.event,
        bookingId: payload.bookingId || null,
        recipient,
        subject,
        body: plainBody,
        status: deliveryResult.success ? "delivered" : "pending_or_logged",
        provider: deliveryResult.success ? "gmail" : "local_log",
        messageId: deliveryResult.messageId || null,
        error: deliveryResult.error || null,
        timestamp: nowIso,
      });
    }
  } catch (err) {
    console.warn("[NOTIFICATION LOG WRITE SKIPPED]", err);
  }

  // Update notification status on booking record in Supabase
  if (payload.bookingId) {
    try {
      const { supabaseAdmin, isSupabaseConfigured } = await import("@/lib/supabase/admin");
      if (isSupabaseConfigured()) {
        await supabaseAdmin
          .from("bookings")
          .update({
            notification_status: deliveryResult.success ? "sent" : "pending_gmail_connection",
            updated_at: nowIso,
          })
          .eq("id", payload.bookingId);
      }
    } catch {}
  }

  return deliveryResult.success;
}

/**
 * Retries all pending or failed notification logs in Firestore.
 */
export async function retryPendingNotifications(limit = 10): Promise<{ retried: number; successful: number }> {
  try {
    const { isFirebaseAdminConfigured } = await import("@/lib/firebase/admin");
    if (!isFirebaseAdminConfigured()) {
      return { retried: 0, successful: 0 };
    }

    const pendingSnap = await adminDb
      .collection("notification_logs")
      .where("status", "==", "pending_or_logged")
      .limit(limit)
      .get();

    if (pendingSnap.empty) {
      return { retried: 0, successful: 0 };
    }

    let successful = 0;
    for (const doc of pendingSnap.docs) {
      const data = doc.data();
      const result = await sendViaGmailApi(data.recipient, data.subject, data.body);
      if (result.success) {
        successful++;
        await doc.ref.update({
          status: "delivered",
          provider: "gmail",
          messageId: result.messageId || null,
          error: null,
          retriedAt: new Date().toISOString(),
        });
      } else {
        await doc.ref.update({
          retryAttempts: (data.retryAttempts || 0) + 1,
          lastRetryError: result.error || "Retry failed",
          retriedAt: new Date().toISOString(),
        });
      }
    }

    return { retried: pendingSnap.size, successful };
  } catch (err) {
    console.error("[RETRY NOTIFICATIONS ERROR]", err);
    return { retried: 0, successful: 0 };
  }
}

import { NextRequest, NextResponse } from "next/server";
import { adminDb, logAuditEvent } from "@/lib/firebase/admin";
import { encryptToken } from "@/lib/security/tokenEncryption";

export const dynamic = "force-dynamic";

/**
 * Secure Google OAuth 2.0 Callback Route for Gmail Integration.
 * 
 * Processes the authorization code, validates the CSRF state cookie,
 * exchanges code for long-lived refresh_token, and safely registers
 * the encrypted refresh token at rest in Cloud Firestore.
 */
export async function GET(req: NextRequest) {
  const host = req.headers.get("host") || "localhost:3000";
  const protocol = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const baseUrl = `${protocol}://${host}`;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${baseUrl}/api/admin/oauth/gmail/callback`;
  const notificationSettingsUrl = `${baseUrl}/admin/notifications`;

  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const errorParam = searchParams.get("error");

    // 1. Handle user cancellation or OAuth error
    if (errorParam) {
      console.warn("[GMAIL OAUTH CALLBACK] Google reported an error:", errorParam);
      return NextResponse.redirect(
        `${notificationSettingsUrl}?oauth=error&reason=${encodeURIComponent(errorParam)}`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${notificationSettingsUrl}?oauth=error&reason=missing_authorization_code`
      );
    }

    // 2. CSRF Verification: Validate state parameter matches the secure cookie
    const stateCookie = req.cookies.get("gmail_oauth_state")?.value;
    if (!stateCookie || stateCookie !== state) {
      console.error("[GMAIL OAUTH CALLBACK] CSRF State mismatch detected.");
      return NextResponse.redirect(
        `${notificationSettingsUrl}?oauth=error&reason=csrf_state_mismatch`
      );
    }

    // 3. Verify server-side credentials
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.GMAIL_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.GMAIL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("[GMAIL OAUTH CALLBACK] Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET.");
      return NextResponse.redirect(
        `${notificationSettingsUrl}?oauth=error&reason=server_credentials_unconfigured`
      );
    }

    // 4. Exchange authorization code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.text();
      console.error("[GMAIL OAUTH CALLBACK] Token exchange failed. Status:", tokenResponse.status);
      return NextResponse.redirect(
        `${notificationSettingsUrl}?oauth=error&reason=token_exchange_failed`
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;

    // 5. Retrieve connected email (defaulting safely to official Kekulama address)
    let connectedEmail = process.env.OWNER_EMAIL || "kekulamaecocabana@gmail.com";
    if (accessToken) {
      try {
        const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (userInfoRes.ok) {
          const userInfo = await userInfoRes.json();
          if (userInfo.email) {
            connectedEmail = userInfo.email;
          }
        }
      } catch {
        // Fallback email already set; userinfo.email scope was excluded as per gmail.send only directive
      }
    }

    // 6. Store OAuth settings safely in Firestore system_settings collection
    // Tokens are encrypted at rest with AES-256-GCM and never exposed to the client or logs
    const settingsDocRef = adminDb.collection("system_settings").doc("gmail_oauth");
    const existingDoc = await settingsDocRef.get();
    const existingData = existingDoc.data() || {};

    const rawRefreshToken = refreshToken || existingData.rawRefreshToken || null;
    const encryptedRefreshToken = rawRefreshToken
      ? encryptToken(rawRefreshToken)
      : (existingData.encryptedRefreshToken || null);

    const now = new Date().toISOString();
    await settingsDocRef.set(
      {
        provider: "gmail",
        connectedEmail,
        encryptedRefreshToken,
        hasRefreshToken: Boolean(encryptedRefreshToken),
        scopes: tokenData.scope || "https://www.googleapis.com/auth/gmail.send",
        tokenType: tokenData.token_type || "Bearer",
        status: "active",
        updatedAt: now,
      },
      { merge: true }
    );

    // 7. Record immutable audit log entry (NEVER log the token itself)
    await logAuditEvent({
      actorId: "owner",
      actorRole: "owner",
      actorEmail: connectedEmail,
      action: "SETTINGS_CHANGED",
      targetResource: "system_settings/gmail_oauth",
      details: {
        provider: "gmail",
        connectedEmail,
        hasRefreshToken: Boolean(encryptedRefreshToken),
      },
      timestamp: now,
    });

    // 8. Clear state cookie and redirect back to notifications management console
    const successResponse = NextResponse.redirect(
      `${notificationSettingsUrl}?oauth=success&email=${encodeURIComponent(connectedEmail)}`
    );

    successResponse.cookies.set("gmail_oauth_state", "", {
      maxAge: 0,
      path: "/",
    });

    return successResponse;
  } catch (err: any) {
    console.error("[GMAIL OAUTH CALLBACK ERROR]", err);
    return NextResponse.redirect(
      `${notificationSettingsUrl}?oauth=error&reason=${encodeURIComponent(err.message || "unexpected_callback_failure")}`
    );
  }
}

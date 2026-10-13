import { NextRequest, NextResponse } from "next/server";
import { logAuditEvent } from "@/lib/firebase/admin";
import { encryptToken, decryptToken } from "@/lib/security/tokenEncryption";
import { saveDriveOAuthSettings, getDriveOAuthSettings } from "@/lib/security/settingsStorage";
import { verifySignedOAuthState } from "@/lib/security/oauthState";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Secure Google OAuth 2.0 Callback Route for Google Drive Integration.
 * 
 * Validates the CSRF state cookie, exchanges authorization code for refresh_token,
 * encrypts the token at rest with AES-256-GCM, and registers it in Cloud Firestore.
 */
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin || "https://www.kekulamaecocabanagalle.com";
  const redirectUri =
    process.env.GOOGLE_DRIVE_REDIRECT_URI ||
    process.env.GOOGLE_REDIRECT_URI ||
    `${origin}/api/admin/oauth/drive/callback`;
  const backupConsoleUrl = `${origin}/admin/backup`;

  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const errorParam = searchParams.get("error");

    // 1. Handle user cancellation or OAuth error
    if (errorParam) {
      console.warn("[DRIVE OAUTH CALLBACK] Google reported an error:", errorParam);
      return NextResponse.redirect(
        `${backupConsoleUrl}?oauth=error&reason=${encodeURIComponent(errorParam)}`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${backupConsoleUrl}?oauth=error&reason=missing_authorization_code`
      );
    }

    // 2. CSRF Verification: Dual-layered defense
    // Validates either (a) matching state cookie OR (b) authentic HMAC-SHA256 signature and fresh timestamp (< 15 mins)
    const stateCookie = req.cookies.get("drive_oauth_state")?.value;
    const isCookieMatch = Boolean(stateCookie && stateCookie === state);
    const isSignatureValid = verifySignedOAuthState(state, "drive");

    if (!isCookieMatch && !isSignatureValid) {
      console.error("[DRIVE OAUTH CALLBACK] CSRF State mismatch detected. Cookie matched:", isCookieMatch, "Signature valid:", isSignatureValid);
      return NextResponse.redirect(
        `${backupConsoleUrl}?oauth=error&reason=csrf_state_mismatch`
      );
    }

    // 3. Verify server-side credentials
    const clientId =
      process.env.GOOGLE_DRIVE_CLIENT_ID ||
      process.env.GOOGLE_CLIENT_ID ||
      process.env.GMAIL_CLIENT_ID;
    const clientSecret =
      process.env.GOOGLE_DRIVE_CLIENT_SECRET ||
      process.env.GOOGLE_CLIENT_SECRET ||
      process.env.GMAIL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(
        `${backupConsoleUrl}?oauth=error&reason=missing_google_credentials_in_vercel_env`
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
      console.error("[DRIVE OAUTH CALLBACK] Token exchange failed. Status:", tokenResponse.status);
      return NextResponse.redirect(
        `${backupConsoleUrl}?oauth=error&reason=token_exchange_failed`
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;

    // 5. Retrieve connected email if available
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
        // Fallback email already initialized
      }
    }

    // 6. Encrypt refresh token with AES-256-GCM
    const existingSettings = await getDriveOAuthSettings();
    let encryptedRefreshToken: string | null = null;

    if (refreshToken) {
      encryptedRefreshToken = encryptToken(refreshToken);
    } else if (existingSettings?.encryptedRefreshToken) {
      const existingDecrypted = decryptToken(existingSettings.encryptedRefreshToken);
      if (existingDecrypted) {
        encryptedRefreshToken = existingSettings.encryptedRefreshToken;
      }
    }

    if (!encryptedRefreshToken) {
      console.error("[DRIVE OAUTH CALLBACK] No usable refresh token received from Google or found in existing settings.");
      return NextResponse.redirect(
        `${backupConsoleUrl}?oauth=error&reason=missing_refresh_token_reconsent_required`
      );
    }

    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || existingSettings?.folderId;
    const now = new Date().toISOString();

    const saveResult = await saveDriveOAuthSettings({
      provider: "google_drive",
      connectedEmail,
      encryptedRefreshToken,
      hasRefreshToken: true,
      folderId,
      folderName: "Kekulama_Backups_Secure",
      scopes: tokenData.scope || "https://www.googleapis.com/auth/drive.file",
      tokenType: tokenData.token_type || "Bearer",
      status: "active",
      updatedAt: now,
    });

    // 7. Record immutable audit log entry
    try {
      await logAuditEvent({
        actorId: "owner",
        actorRole: "owner",
        actorEmail: connectedEmail,
        action: "SETTINGS_CHANGED",
        targetResource: "system_settings/google_drive_oauth",
        details: {
          provider: "google_drive",
          connectedEmail,
          hasRefreshToken: Boolean(encryptedRefreshToken),
        },
        timestamp: now,
      });
    } catch (auditErr) {
      console.warn("[DRIVE OAUTH] Audit log entry write skipped:", auditErr);
    }

    // 8. Clear state cookie and redirect back to backup console
    const successResponse = NextResponse.redirect(
      `${backupConsoleUrl}?oauth=success&email=${encodeURIComponent(connectedEmail)}`
    );

    successResponse.cookies.set("drive_oauth_state", "", {
      maxAge: 0,
      path: "/",
    });

    return successResponse;
  } catch (err: any) {
    console.error("[DRIVE OAUTH CALLBACK ERROR]", err);
    return NextResponse.redirect(
      `${backupConsoleUrl}?oauth=error&reason=${encodeURIComponent(err.message || "unexpected_callback_failure")}`
    );
  }
}

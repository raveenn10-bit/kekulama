import { NextRequest, NextResponse } from "next/server";
import { logAuditEvent } from "@/lib/firebase/admin";
import { encryptToken } from "@/lib/security/tokenEncryption";
import { saveGmailOAuthSettings, getGmailOAuthSettings } from "@/lib/security/settingsStorage";
import { verifySignedOAuthState } from "@/lib/security/oauthState";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Secure Google OAuth 2.0 Callback Route for Gmail Integration.
 * 
 * Processes the authorization code, validates the CSRF state cookie,
 * exchanges code for long-lived refresh_token, and safely registers
 * the encrypted refresh token at rest in Cloud Firestore.
 */
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin || "https://www.kekulamaecocabanagalle.com";
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${origin}/api/admin/oauth/gmail/callback`;
  const notificationSettingsUrl = `${origin}/admin/notifications`;

  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const errorParam = searchParams.get("error");

    // 1. Handle user cancellation or OAuth error
    if (errorParam) {
      console.warn("[GMAIL OAUTH CALLBACK] Google reported an error:", errorParam);
      if (state && (verifySignedOAuthState(state, "drive") || state.includes(".drive."))) {
        return NextResponse.redirect(
          `${origin}/admin/backup?oauth=error&reason=${encodeURIComponent(errorParam)}`
        );
      }
      return NextResponse.redirect(
        `${notificationSettingsUrl}?oauth=error&reason=${encodeURIComponent(errorParam)}`
      );
    }

    if (!code) {
      if (state && (verifySignedOAuthState(state, "drive") || state.includes(".drive."))) {
        return NextResponse.redirect(
          `${origin}/admin/backup?oauth=error&reason=missing_authorization_code`
        );
      }
      return NextResponse.redirect(
        `${notificationSettingsUrl}?oauth=error&reason=missing_authorization_code`
      );
    }

    // Adaptive Router: If Google redirected here with a Drive OAuth state token,
    // seamlessly forward the request to the Drive callback route!
    if (state && (verifySignedOAuthState(state, "drive") || state.includes(".drive.") || req.cookies.get("drive_oauth_state")?.value === state)) {
      console.log("[GMAIL OAUTH CALLBACK] Detected Drive OAuth state. Seamlessly forwarding to Drive callback route...");
      const driveCallbackUrl = new URL(`${origin}/api/admin/oauth/drive/callback`);
      searchParams.forEach((val, key) => driveCallbackUrl.searchParams.set(key, val));
      return NextResponse.redirect(driveCallbackUrl.toString());
    }

    // 2. CSRF Verification: Dual-layered defense
    // Validates either (a) matching state cookie OR (b) authentic HMAC-SHA256 signature and fresh timestamp (< 15 mins)
    const stateCookie = req.cookies.get("gmail_oauth_state")?.value;
    const isCookieMatch = Boolean(stateCookie && stateCookie === state);
    const isSignatureValid = verifySignedOAuthState(state, "gmail");

    if (!isCookieMatch && !isSignatureValid) {
      console.error("[GMAIL OAUTH CALLBACK] CSRF State mismatch detected. Cookie matched:", isCookieMatch, "Signature valid:", isSignatureValid);
      return NextResponse.redirect(
        `${notificationSettingsUrl}?oauth=error&reason=csrf_state_mismatch`
      );
    }

    // 3. Verify server-side credentials
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.GMAIL_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.GMAIL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(
        `${notificationSettingsUrl}?oauth=error&reason=missing_google_credentials_in_vercel_env`
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

    // 6. Store OAuth settings safely (Firestore with automatic encrypted fallback)
    // Tokens are encrypted at rest with AES-256-GCM and never exposed to the client or logs
    const existingSettings = await getGmailOAuthSettings();
    const rawRefreshToken = refreshToken || null;
    const encryptedRefreshToken = rawRefreshToken
      ? encryptToken(rawRefreshToken)
      : (existingSettings?.encryptedRefreshToken || null);

    const now = new Date().toISOString();
    await saveGmailOAuthSettings({
      provider: "gmail",
      connectedEmail,
      encryptedRefreshToken,
      hasRefreshToken: Boolean(encryptedRefreshToken),
      scopes: tokenData.scope || "https://www.googleapis.com/auth/gmail.send",
      tokenType: tokenData.token_type || "Bearer",
      status: "active",
      updatedAt: now,
    });

    // 7. Record immutable audit log entry (fail-safe: never breaks OAuth flow if Firestore audit logs lack permission)
    try {
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
    } catch (auditErr) {
      console.warn("[GMAIL OAUTH] Audit log entry write skipped:", auditErr);
    }

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

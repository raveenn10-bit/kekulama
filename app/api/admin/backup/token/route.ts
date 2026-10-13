import { NextRequest, NextResponse } from "next/server";
import { requireOwner } from "@/lib/security/authBridge";
import { encryptToken } from "@/lib/security/tokenEncryption";
import { saveDriveOAuthSettings, getDriveOAuthSettings } from "@/lib/security/settingsStorage";
import { verifyDriveToken } from "@/lib/backup/googleDriveService";
import { logAuditEvent } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

/**
 * Direct Connection & Auto-Sync Endpoint for Google Drive.
 * Allows confirmed Owners to directly configure, verify, or sync Google Drive credentials.
 */
export async function POST(req: NextRequest) {
  try {
    const owner = await requireOwner(req);
    if (!owner) {
      return NextResponse.json(
        { error: "Forbidden: Owner access required." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { action = "sync", refreshToken, folderId } = body;

    const clientId =
      process.env.GOOGLE_DRIVE_CLIENT_ID ||
      process.env.GOOGLE_CLIENT_ID ||
      process.env.GMAIL_CLIENT_ID;
    const clientSecret =
      process.env.GOOGLE_DRIVE_CLIENT_SECRET ||
      process.env.GOOGLE_CLIENT_SECRET ||
      process.env.GMAIL_CLIENT_SECRET;

    // 1. Action: Test current connection
    if (action === "test") {
      const verification = await verifyDriveToken({ forceCheck: true });
      return NextResponse.json({
        success: verification.valid,
        valid: verification.valid,
        error: verification.error || null,
        message: verification.valid
          ? "Google Drive API verification succeeded! Connection is live."
          : `Verification failed: ${verification.error || "Token invalid"}`,
      });
    }

    // 2. Action: Disconnect
    if (action === "disconnect") {
      await saveDriveOAuthSettings({
        provider: "google_drive",
        connectedEmail: process.env.OWNER_EMAIL || "kekulamaecocabana@gmail.com",
        encryptedRefreshToken: null,
        hasRefreshToken: false,
        folderId: process.env.GOOGLE_DRIVE_FOLDER_ID || "1XEvQdwiNbc47u1z8xkwNpYE7ajy1XZEL",
        folderName: "Kekulama_Backups_Secure",
        scopes: "https://www.googleapis.com/auth/drive.file",
        tokenType: "Bearer",
        status: "inactive",
        updatedAt: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        message: "Google Drive disconnected successfully.",
      });
    }

    // 3. Action: Sync provided refresh token directly
    if (action === "sync") {
      const tokenToSave = (refreshToken || "").trim();

      if (!tokenToSave) {
        return NextResponse.json(
          { error: "Please provide a valid Google Drive Refresh Token." },
          { status: 400 }
        );
      }

      if (!clientId || !clientSecret) {
        return NextResponse.json(
          { error: "Missing Google Cloud OAuth credentials (CLIENT_ID / CLIENT_SECRET) in server environment." },
          { status: 500 }
        );
      }

      // Test token with Google OAuth 2.0 endpoint
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: tokenToSave,
          grant_type: "refresh_token",
        }),
      });

      if (!tokenRes.ok) {
        const errorText = await tokenRes.text();
        return NextResponse.json(
          {
            error: `Google rejected this refresh token (HTTP ${tokenRes.status}). Ensure the token was generated with the same Google Cloud Client ID.`,
            details: errorText,
          },
          { status: 400 }
        );
      }

      const tokenData = await tokenRes.json();
      const accessToken = tokenData.access_token;

      // Fetch user profile email
      let connectedEmail = owner.email || "kekulamaecocabana@gmail.com";
      if (accessToken) {
        try {
          const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (userRes.ok) {
            const userData = await userRes.json();
            if (userData.email) connectedEmail = userData.email;
          }
        } catch {}
      }

      // Encrypt and persist to Supabase PostgreSQL (Tier 1)
      const encryptedRefreshToken = encryptToken(tokenToSave);
      const targetFolderId = folderId || process.env.GOOGLE_DRIVE_FOLDER_ID || "1XEvQdwiNbc47u1z8xkwNpYE7ajy1XZEL";
      const now = new Date().toISOString();

      await saveDriveOAuthSettings({
        provider: "google_drive",
        connectedEmail,
        encryptedRefreshToken,
        hasRefreshToken: true,
        folderId: targetFolderId,
        folderName: "Kekulama_Backups_Secure",
        scopes: tokenData.scope || "https://www.googleapis.com/auth/drive.file",
        tokenType: tokenData.token_type || "Bearer",
        status: "active",
        updatedAt: now,
      });

      await logAuditEvent({
        actorId: owner.uid,
        actorEmail: owner.email || connectedEmail,
        actorRole: "owner",
        action: "SETTINGS_CHANGED",
        targetResource: "system_settings/google_drive_oauth",
        details: { provider: "google_drive", connectedEmail, directSync: true },
        timestamp: now,
      }).catch(() => {});

      return NextResponse.json({
        success: true,
        message: "Google Drive token saved and verified successfully!",
        connectedEmail,
        folderId: targetFolderId,
      });
    }

    return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
  } catch (err: any) {
    console.error("[DRIVE TOKEN API ERROR]", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error." },
      { status: 500 }
    );
  }
}

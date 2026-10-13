import { NextRequest, NextResponse } from "next/server";
import { requireOwner } from "@/lib/security/authBridge";
import { getDriveOAuthSettings } from "@/lib/security/settingsStorage";
import { decryptToken } from "@/lib/security/tokenEncryption";
import { verifyDriveToken } from "@/lib/backup/googleDriveService";

export const dynamic = "force-dynamic";

/**
 * GET: Returns authoritative Google Drive OAuth connection status for Owner dashboard.
 * Actively validates token refresh capability against Google OAuth 2.0 endpoint (cached for 10 mins).
 */
export async function GET(req: NextRequest) {
  try {
    const owner = await requireOwner(req);
    if (!owner) {
      return NextResponse.json(
        { error: "Forbidden: Owner access required." },
        { status: 403 }
      );
    }

    const settings = await getDriveOAuthSettings();
    const hasEnvRefreshToken = Boolean(process.env.GOOGLE_DRIVE_REFRESH_TOKEN);

    let canDecryptToken = false;
    if (settings?.encryptedRefreshToken) {
      const decrypted = decryptToken(settings.encryptedRefreshToken);
      canDecryptToken = Boolean(decrypted && decrypted.length > 0);
    }

    // 1. Fast rejection if no decryptable token exists in storage or environment
    if (!canDecryptToken && !hasEnvRefreshToken) {
      return NextResponse.json({
        connected: false,
        verified: false,
        email: settings?.connectedEmail || process.env.OWNER_EMAIL || "kekulamaecocabana@gmail.com",
        folderName: settings?.folderName || "Kekulama_Backups_Secure",
        folderId: settings?.folderId || process.env.GOOGLE_DRIVE_FOLDER_ID || "Dedicated Drive Folder",
        updatedAt: settings?.updatedAt || null,
        status: "not_connected",
      });
    }

    // 2. Authoritative check: Test token refresh with Google OAuth endpoint (cached with 10-minute TTL)
    const forceCheck = req.nextUrl.searchParams.get("verify") === "true";
    const verification = await verifyDriveToken({ forceCheck });

    return NextResponse.json({
      connected: verification.valid,
      verified: verification.valid,
      email: settings?.connectedEmail || process.env.OWNER_EMAIL || "kekulamaecocabana@gmail.com",
      folderName: settings?.folderName || "Kekulama_Backups_Secure",
      folderId: settings?.folderId || process.env.GOOGLE_DRIVE_FOLDER_ID || "Dedicated Drive Folder",
      updatedAt: settings?.updatedAt || null,
      status: verification.valid ? (settings?.status || "active") : "token_revoked",
      error: verification.error || null,
    });
  } catch (err: any) {
    console.error("[DRIVE STATUS ERROR]", err);
    return NextResponse.json(
      { connected: false, error: err?.message || "Failed to retrieve Drive connection status." },
      { status: 500 }
    );
  }
}

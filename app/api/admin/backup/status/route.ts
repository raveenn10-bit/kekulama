import { NextRequest, NextResponse } from "next/server";
import { requireOwner } from "@/lib/security/authBridge";
import { getDriveOAuthSettings } from "@/lib/security/settingsStorage";
import { decryptToken } from "@/lib/security/tokenEncryption";

export const dynamic = "force-dynamic";

/**
 * GET: Returns Google Drive OAuth connection status for Owner dashboard.
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

    const isConnected = Boolean(canDecryptToken || hasEnvRefreshToken);

    return NextResponse.json({
      connected: isConnected,
      email: settings?.connectedEmail || process.env.OWNER_EMAIL || "kekulamaecocabana@gmail.com",
      folderName: settings?.folderName || "Kekulama_Backups_Secure",
      folderId: settings?.folderId || process.env.GOOGLE_DRIVE_FOLDER_ID || "Dedicated Drive Folder",
      updatedAt: settings?.updatedAt || null,
      status: isConnected ? (settings?.status || "active") : "not_connected",
    });
  } catch (err: any) {
    console.error("[DRIVE STATUS ERROR]", err);
    return NextResponse.json(
      { error: err?.message || "Failed to retrieve Drive connection status." },
      { status: 500 }
    );
  }
}

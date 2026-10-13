import { NextRequest, NextResponse } from "next/server";
import { requireOwner } from "@/lib/security/authBridge";
import { getGmailOAuthSettings } from "@/lib/security/settingsStorage";
import { decryptToken } from "@/lib/security/tokenEncryption";

export const dynamic = "force-dynamic";

/**
 * GET: Returns authoritative Gmail OAuth connection status for Owner dashboard.
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

    const settings = await getGmailOAuthSettings();
    let canDecryptToken = false;
    if (settings?.encryptedRefreshToken) {
      const decrypted = decryptToken(settings.encryptedRefreshToken);
      canDecryptToken = Boolean(decrypted && decrypted.length > 0);
    }

    const isConnected = Boolean(settings?.status === "active" && canDecryptToken);

    return NextResponse.json({
      connected: isConnected,
      email: settings?.connectedEmail || process.env.OWNER_EMAIL || "kekulamaecocabana@gmail.com",
      status: isConnected ? "active" : "inactive",
      updatedAt: settings?.updatedAt || null,
    });
  } catch (error: any) {
    console.error("[GMAIL STATUS API ERROR]", error);
    return NextResponse.json(
      { error: error?.message || "Failed to retrieve status." },
      { status: 500 }
    );
  }
}

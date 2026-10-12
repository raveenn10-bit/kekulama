import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseSessionOrToken } from "@/lib/security/authBridge";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/**
 * Initiates the Google OAuth 2.0 flow for Gmail transactional notifications.
 * Restricted to authenticated Owner accounts only.
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Authorize: Ensure requester is an authenticated Owner
    const authUser = await verifyFirebaseSessionOrToken(req);
    const isDev = process.env.NODE_ENV === "development";

    // Determine Base URL
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const baseUrl = `${protocol}://${host}`;

    if (!isDev && (!authUser || !authUser.isApprovedOwner)) {
      return NextResponse.redirect(`${baseUrl}/admin/login?error=owner_authorization_required`);
    }

    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.GMAIL_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json(
        { error: "GOOGLE_CLIENT_ID is not configured in server environment variables." },
        { status: 500 }
      );
    }

    // Determine redirect URI: use GOOGLE_REDIRECT_URI if defined, otherwise derive from host
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${baseUrl}/api/admin/oauth/gmail/callback`;

    // 2. Generate cryptographically random CSRF state
    const stateToken = crypto.randomBytes(24).toString("hex");

    // 3. Google OAuth 2.0 Authorization URL (gmail.send scope only)
    const scopes = "https://www.googleapis.com/auth/gmail.send";

    const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    googleAuthUrl.searchParams.set("client_id", clientId);
    googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
    googleAuthUrl.searchParams.set("response_type", "code");
    googleAuthUrl.searchParams.set("scope", scopes);
    googleAuthUrl.searchParams.set("access_type", "offline"); // Crucial: gets refresh_token
    googleAuthUrl.searchParams.set("prompt", "consent"); // Force consent to ensure refresh_token returned
    googleAuthUrl.searchParams.set("state", stateToken);

    // 4. Set state in an HTTP-only secure cookie and redirect
    const response = NextResponse.redirect(googleAuthUrl.toString());
    response.cookies.set("gmail_oauth_state", stateToken, {
      httpOnly: true,
      secure: protocol === "https",
      sameSite: "lax",
      maxAge: 60 * 10, // 10 minutes
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("[GMAIL OAUTH INIT ERROR]", err);
    return NextResponse.json(
      { error: err.message || "Failed to initiate Gmail OAuth flow" },
      { status: 500 }
    );
  }
}

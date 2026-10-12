import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Initiates the Google OAuth 2.0 flow for Gmail transactional notifications.
 * Generates a cryptographically random CSRF nonce and redirects to Google.
 */
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin || "https://www.kekulamaecocabanagalle.com";

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.GMAIL_CLIENT_ID;
    if (!clientId) {
      return NextResponse.redirect(
        `${origin}/admin/notifications?oauth=error&reason=missing_google_client_id_in_vercel_env`,
        307
      );
    }

    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${origin}/api/admin/oauth/gmail/callback`;

    // 1. Generate cryptographically random CSRF state nonce
    const stateToken = crypto.randomBytes(24).toString("hex");

    // 2. Google OAuth 2.0 Authorization URL (gmail.send scope only)
    const scopes = "https://www.googleapis.com/auth/gmail.send";

    const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    googleAuthUrl.searchParams.set("client_id", clientId);
    googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
    googleAuthUrl.searchParams.set("response_type", "code");
    googleAuthUrl.searchParams.set("scope", scopes);
    googleAuthUrl.searchParams.set("access_type", "offline"); // Crucial: gets refresh_token
    googleAuthUrl.searchParams.set("prompt", "consent"); // Force consent to ensure refresh_token returned
    googleAuthUrl.searchParams.set("state", stateToken);

    // 3. Set state in an HTTP-only secure cookie and redirect to Google
    const isHttps = origin.startsWith("https") || req.headers.get("x-forwarded-proto") === "https";
    const response = NextResponse.redirect(googleAuthUrl.toString(), 307);
    
    response.cookies.set("gmail_oauth_state", stateToken, {
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      maxAge: 60 * 10, // 10 minutes
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("[GMAIL OAUTH INIT ERROR]", err);
    return NextResponse.redirect(
      `${origin}/admin/notifications?oauth=error&reason=${encodeURIComponent(err.message || "init_failed")}`,
      307
    );
  }
}

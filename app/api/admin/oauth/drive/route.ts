import { NextRequest, NextResponse } from "next/server";
import { createSignedOAuthState } from "@/lib/security/oauthState";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Initiates the Google OAuth 2.0 flow for Google Drive Automated Backup Integration.
 * Strictly uses the minimum required scope: https://www.googleapis.com/auth/drive.file
 */
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin || "https://www.kekulamaecocabanagalle.com";

  try {
    const clientId =
      process.env.GOOGLE_DRIVE_CLIENT_ID ||
      process.env.GOOGLE_CLIENT_ID ||
      process.env.GMAIL_CLIENT_ID;

    if (!clientId) {
      return NextResponse.redirect(
        `${origin}/admin/backup?oauth=error&reason=missing_google_client_id_in_vercel_env`,
        307
      );
    }

    const redirectUri =
      process.env.GOOGLE_DRIVE_REDIRECT_URI ||
      process.env.GOOGLE_REDIRECT_URI ||
      `${origin}/api/admin/oauth/drive/callback`;

    // 1. Generate cryptographically signed, timestamped CSRF state token
    const stateToken = createSignedOAuthState("drive");

    // 2. Google OAuth 2.0 Authorization URL with minimum required Drive scope
    // https://www.googleapis.com/auth/drive.file allows creating and managing only files
    // created by this app, avoiding broad drive access.
    const scopes = "https://www.googleapis.com/auth/drive.file";

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

    response.cookies.set("drive_oauth_state", stateToken, {
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      maxAge: 60 * 10, // 10 minutes
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("[DRIVE OAUTH INIT ERROR]", err);
    return NextResponse.redirect(
      `${origin}/admin/backup?oauth=error&reason=${encodeURIComponent(err.message || "init_failed")}`,
      307
    );
  }
}

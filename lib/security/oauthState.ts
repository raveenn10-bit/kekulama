import crypto from "crypto";

/**
 * Derives a secure secret key for signing OAuth CSRF state tokens.
 */
function getOAuthSigningSecret(): string {
  return (
    process.env.APP_SECRET ||
    process.env.SESSION_COOKIE_SECRET ||
    process.env.BACKUP_ENCRYPTION_KEY ||
    "kekulama-luxury-oauth-csrf-protection-secret-2026"
  );
}

/**
 * Creates a cryptographically signed, timestamped OAuth CSRF state token.
 * Format: `${timestamp}.${nonce}.${hmacSignature}`
 * 
 * This enables robust CSRF protection that:
 * 1. Remains verifiable even if browsers drop cookies during cross-domain redirects (e.g. www vs apex domain).
 * 2. Enforces strict cryptographic authenticity (cannot be forged by attackers).
 * 3. Enforces an expiration window (15 minutes).
 */
export function createSignedOAuthState(purpose: string = "drive"): string {
  const timestamp = Date.now().toString();
  const nonce = crypto.randomBytes(16).toString("hex");
  const payload = `${timestamp}.${nonce}.${purpose}`;
  const hmac = crypto
    .createHmac("sha256", getOAuthSigningSecret())
    .update(payload)
    .digest("hex");

  return `${payload}.${hmac}`;
}

/**
 * Verifies a signed OAuth CSRF state token.
 * Returns true if the HMAC signature is authentic and the token was generated within 15 minutes.
 */
export function verifySignedOAuthState(
  state: string | null | undefined,
  expectedPurpose: string = "drive"
): boolean {
  if (!state || typeof state !== "string") {
    return false;
  }

  const parts = state.split(".");
  // Format is: timestamp.nonce.purpose.hmac
  if (parts.length !== 4) {
    return false;
  }

  const [timestampStr, , purpose, receivedHmac] = parts;
  if (purpose !== expectedPurpose) {
    return false;
  }

  const payload = `${parts[0]}.${parts[1]}.${parts[2]}`;
  const expectedHmac = crypto
    .createHmac("sha256", getOAuthSigningSecret())
    .update(payload)
    .digest("hex");

  // Constant-time comparison to prevent timing side-channel attacks
  try {
    const receivedBuf = Buffer.from(receivedHmac, "hex");
    const expectedBuf = Buffer.from(expectedHmac, "hex");
    if (receivedBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(receivedBuf, expectedBuf)) {
      return false;
    }
  } catch {
    return false;
  }

  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) {
    return false;
  }

  // Token is valid for 15 minutes (900,000 ms)
  const age = Date.now() - timestamp;
  if (age < 0 || age > 15 * 60 * 1000) {
    return false;
  }

  return true;
}

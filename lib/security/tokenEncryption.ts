import crypto from "crypto";

/**
 * Derives a consistent 256-bit encryption key for token encryption.
 */
function getEncryptionKey(): Buffer {
  const secret =
    process.env.OAUTH_ENCRYPTION_KEY ||
    process.env.BACKUP_ENCRYPTION_KEY ||
    process.env.APP_SECRET ||
    "kekulama-luxury-galle-oauth-secret-key-2026";
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypts a sensitive string (e.g. OAuth refresh token) using AES-256-GCM.
 * Never stores or returns plaintext tokens.
 * Output format: `ivHex:authTagHex:encryptedHex`
 */
export function encryptToken(token: string): string {
  if (!token || typeof token !== "string") {
    return "";
  }

  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(12); // Standard 96-bit IV for AES-GCM
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

    let encrypted = cipher.update(token, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag();

    return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
  } catch (err) {
    console.error("[TOKEN ENCRYPTION FAILED]", err instanceof Error ? err.message : err);
    throw new Error("Failed to encrypt token securely.");
  }
}

/**
 * Decrypts an AES-256-GCM encrypted token string.
 * Validates the authentication tag to ensure ciphertext integrity.
 */
export function decryptToken(encryptedString: string): string {
  if (!encryptedString || typeof encryptedString !== "string") {
    return "";
  }

  try {
    const parts = encryptedString.split(":");
    // If not in `ivHex:authTagHex:encryptedHex` format, check if legacy or return empty
    if (parts.length !== 3) {
      // If someone stored an unencrypted token previously, return as fallback
      if (encryptedString.startsWith("1//") || encryptedString.startsWith("ya29.")) {
        return encryptedString;
      }
      return "";
    }

    const [ivHex, tagHex, cipherHex] = parts;
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(tagHex, "hex");

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(cipherHex, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (err) {
    console.error("[TOKEN DECRYPTION FAILED]", err instanceof Error ? err.message : err);
    return "";
  }
}

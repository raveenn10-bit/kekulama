import crypto from "crypto";

/**
 * Safely parses a secret into a 32-byte key Buffer.
 */
function deriveTokenKey(secret: string): Buffer {
  const trimmed = (secret || "").trim();
  if (!trimmed) {
    return crypto.createHash("sha256").update("kekulama-luxury-galle-oauth-secret-key-2026", "utf8").digest();
  }
  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    return Buffer.from(trimmed, "hex");
  }
  if (/^(?:[A-Za-z0-9+/]{43}=|[A-Za-z0-9+/]{42}==|[A-Za-z0-9_-]{43})$/.test(trimmed) || trimmed.length === 44) {
    try {
      const decoded = Buffer.from(trimmed, trimmed.includes("-") ? "base64url" : "base64");
      if (decoded.length === 32) return decoded;
    } catch {}
  }
  return crypto.createHash("sha256").update(trimmed, "utf8").digest();
}

/**
 * Derives a consistent 256-bit encryption key for token encryption.
 */
function getEncryptionKey(): Buffer {
  const secret =
    process.env.OAUTH_ENCRYPTION_KEY ||
    process.env.BACKUP_ENCRYPTION_KEY ||
    process.env.APP_SECRET ||
    "kekulama-luxury-galle-oauth-secret-key-2026";
  return deriveTokenKey(secret);
}

/**
 * Collects candidate keys for decrypting tokens.
 */
function getTokenCandidateKeys(): Buffer[] {
  const rawSecrets = [
    process.env.OAUTH_ENCRYPTION_KEY,
    process.env.BACKUP_ENCRYPTION_KEY,
    process.env.OLD_BACKUP_ENCRYPTION_KEY,
    process.env.APP_SECRET,
    "kekulama-luxury-galle-oauth-secret-key-2026",
    "kekulama-aes256-oauth-token-encryption-key-2026",
  ].filter(Boolean) as string[];

  const keys: Buffer[] = [];
  const seen = new Set<string>();

  for (const s of rawSecrets) {
    const k1 = deriveTokenKey(s);
    const hex1 = k1.toString("hex");
    if (!seen.has(hex1)) {
      seen.add(hex1);
      keys.push(k1);
    }
    const k2 = crypto.createHash("sha256").update(s, "utf8").digest();
    const hex2 = k2.toString("hex");
    if (!seen.has(hex2)) {
      seen.add(hex2);
      keys.push(k2);
    }
  }

  return keys;
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
 * Tries candidate keys if primary key fails, ensuring zero-downtime key rotation.
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
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(tagHex, "hex");

    const candidateKeys = getTokenCandidateKeys();

    for (const key of candidateKeys) {
      try {
        const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(cipherHex, "hex", "utf8");
        decrypted += decipher.final("utf8");
        if (decrypted) return decrypted;
      } catch {
        // Try next candidate key
      }
    }

    return "";
  } catch (err) {
    console.error("[TOKEN DECRYPTION FAILED]", err instanceof Error ? err.message : err);
    return "";
  }
}

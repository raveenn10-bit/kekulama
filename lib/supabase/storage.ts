import { supabaseAdmin, isSupabaseConfigured } from "./admin";
import crypto from "crypto";

export const GUEST_PRIVATE_BUCKET = "guest-private-documents";
export const MAX_DOCUMENT_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  detectedMime?: string;
}

/**
 * Validates buffer size, MIME type whitelist, and magic bytes / binary file signatures.
 * Rejects disguised files (e.g. executable renamed to .jpg).
 */
export function validateFile({
  buffer,
  mimeType,
  size,
}: {
  buffer: Buffer;
  mimeType: string;
  size: number;
}): FileValidationResult {
  // 1. File Size Verification
  if (size > MAX_DOCUMENT_FILE_SIZE || buffer.length > MAX_DOCUMENT_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds the 5 MB limit (received ${Math.round(size / 1024 / 1024)} MB).`,
    };
  }

  if (size <= 0 || buffer.length === 0) {
    return {
      valid: false,
      error: "File is empty.",
    };
  }

  // 2. MIME Whitelist Verification
  if (!ALLOWED_MIME_TYPES.includes(mimeType as AllowedMimeType)) {
    return {
      valid: false,
      error: `Unsupported file type: ${mimeType}. Allowed formats are JPEG, PNG, WebP, and PDF.`,
    };
  }

  // 3. Binary Magic Byte Validation
  // JPEG: FF D8 FF
  const isJpeg =
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff;

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  const isPng =
    buffer.length >= 4 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47;

  // WebP: RIFF (52 49 46 46) at 0, WEBP (57 45 42 50) at 8
  const isWebp =
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50;

  // PDF: %PDF- (25 50 44 46)
  const isPdf =
    buffer.length >= 4 &&
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46;

  if (mimeType === "image/jpeg" && !isJpeg) {
    return { valid: false, error: "File signature mismatch: Invalid JPEG format." };
  }
  if (mimeType === "image/png" && !isPng) {
    return { valid: false, error: "File signature mismatch: Invalid PNG format." };
  }
  if (mimeType === "image/webp" && !isWebp) {
    return { valid: false, error: "File signature mismatch: Invalid WebP format." };
  }
  if (mimeType === "application/pdf" && !isPdf) {
    return { valid: false, error: "File signature mismatch: Invalid PDF format." };
  }

  return { valid: true };
}

/**
 * Generates an unguessable, collision-resistant server-side object path for guest documents
 * Format: guests/{guestId}/{docType}/{uuid}.{extension}
 */
export function generateObjectPath({
  guestId,
  docType,
  extension,
}: {
  guestId: string;
  docType: string;
  extension: string;
}): string {
  const sanitizedGuestId = guestId.replace(/[^a-zA-Z0-9_-]/g, "");
  const sanitizedDocType = docType.replace(/[^a-zA-Z0-9_-]/g, "");
  const sanitizedExt = extension.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "bin";
  const uniqueId = crypto.randomUUID();

  return `guests/${sanitizedGuestId}/${sanitizedDocType}/${uniqueId}.${sanitizedExt}`;
}

/**
 * Generates an unguessable object path for bank transfer receipts
 * Format: payments/{paymentId}/receipt/{uuid}.{extension}
 */
export function generatePaymentReceiptPath({
  paymentId,
  extension,
}: {
  paymentId: string;
  extension: string;
}): string {
  const sanitizedPaymentId = paymentId.replace(/[^a-zA-Z0-9_-]/g, "");
  const sanitizedExt = extension.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "bin";
  const uniqueId = crypto.randomUUID();

  return `payments/${sanitizedPaymentId}/receipt/${uniqueId}.${sanitizedExt}`;
}

/**
 * Uploads a validated document buffer to Supabase Private Storage
 */
export async function uploadPrivateDocument({
  path,
  buffer,
  mimeType,
}: {
  path: string;
  buffer: Buffer;
  mimeType: string;
}): Promise<{ path: string; error?: string }> {
  if (!isSupabaseConfigured()) {
    console.warn(`[SUPABASE STORAGE MOCK] Supabase credentials not set. Simulated upload for path: ${path}`);
    return { path };
  }

  const { data, error } = await supabaseAdmin.storage
    .from(GUEST_PRIVATE_BUCKET)
    .upload(path, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    console.error("[SUPABASE UPLOAD ERROR]", error);
    return { path, error: error.message };
  }

  return { path: data.path };
}

/**
 * Generates a short-lived (default 5-minute / 300-second) signed URL for private viewing
 */
export async function createSignedDocumentUrl({
  path,
  expiresInSeconds = 300,
}: {
  path: string;
  expiresInSeconds?: number;
}): Promise<{ signedUrl?: string; error?: string }> {
  if (!isSupabaseConfigured()) {
    return {
      signedUrl: `https://mock-storage.kekulama.local/view?path=${encodeURIComponent(path)}&expires=${expiresInSeconds}`,
    };
  }

  const { data, error } = await supabaseAdmin.storage
    .from(GUEST_PRIVATE_BUCKET)
    .createSignedUrl(path, expiresInSeconds);

  if (error || !data) {
    console.error("[SUPABASE SIGNED URL ERROR]", error);
    return { error: error?.message || "Failed to generate signed document URL" };
  }

  return { signedUrl: data.signedUrl };
}

/**
 * Deletes a document from the private Supabase Storage bucket
 */
export async function deletePrivateDocument(path: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  const { error } = await supabaseAdmin.storage
    .from(GUEST_PRIVATE_BUCKET)
    .remove([path]);

  if (error) {
    console.error("[SUPABASE DELETE ERROR]", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

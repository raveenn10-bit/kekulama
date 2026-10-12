import crypto from "crypto";

/**
 * Generates an official Kekulama Booking Reference ID
 * Example: KEK-2026-7842
 */
export function generateBookingReference(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit number
  return `KEK-${year}-${randomNum}`;
}

/**
 * Generates an official Payment Receipt ID
 * Example: RCP-2026-9214
 */
export function generateReceiptId(): string {
  const year = new Date().getFullYear();
  const randomHex = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `RCP-${year}-${randomHex}`;
}

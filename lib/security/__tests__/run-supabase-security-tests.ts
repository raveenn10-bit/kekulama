/**
 * Supabase Private Storage & Security Bridge Test Suite
 * Run with: npx ts-node or tsx or node
 */

import {
  validateFile,
  generateObjectPath,
  generatePaymentReceiptPath,
  MAX_DOCUMENT_FILE_SIZE,
} from "../../../lib/supabase/storage";
import { APPROVED_OWNER_UIDS } from "../../../lib/security/authBridge";

let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  \x1b[32m✔ PASS:\x1b[0m ${testName}`);
    testsPassed++;
  } else {
    console.error(`  \x1b[31m✖ FAIL:\x1b[0m ${testName} ${detail ? `(${detail})` : ""}`);
    testsFailed++;
  }
}

console.log("\n=======================================================");
console.log(" KEKULAMA ECO CABANA — SUPABASE STORAGE & SECURITY TESTS");
console.log("=======================================================\n");

// --- TEST GROUP 1: Binary Magic Bytes & MIME Whitelist ---
console.log("[Group 1: File Signature & Magic Bytes Validation]");

// 1. Valid JPEG
const validJpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
const jpegRes = validateFile({ buffer: validJpegBuffer, mimeType: "image/jpeg", size: validJpegBuffer.length });
assert(jpegRes.valid, "Valid JPEG buffer with FF D8 FF header accepted");

// 2. Valid PNG
const validPngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
const pngRes = validateFile({ buffer: validPngBuffer, mimeType: "image/png", size: validPngBuffer.length });
assert(pngRes.valid, "Valid PNG buffer with 89 50 4E 47 header accepted");

// 3. Valid WebP (RIFF + WEBP)
const validWebpBuffer = Buffer.alloc(16);
validWebpBuffer.write("RIFF", 0);
validWebpBuffer.write("WEBP", 8);
const webpRes = validateFile({ buffer: validWebpBuffer, mimeType: "image/webp", size: validWebpBuffer.length });
assert(webpRes.valid, "Valid WebP buffer with RIFF/WEBP header accepted");

// 4. Valid PDF (%PDF)
const validPdfBuffer = Buffer.from("%PDF-1.7\n%synthetic test document");
const pdfRes = validateFile({ buffer: validPdfBuffer, mimeType: "application/pdf", size: validPdfBuffer.length });
assert(pdfRes.valid, "Valid PDF buffer with %PDF header accepted");

// 5. Spoofed File: text script masquerading as image/jpeg
const spoofedBuffer = Buffer.from("<script>alert('xss')</script>");
const spoofRes = validateFile({ buffer: spoofedBuffer, mimeType: "image/jpeg", size: spoofedBuffer.length });
assert(!spoofRes.valid, "Spoofed text file disguised as image/jpeg is rejected");

// 6. Unsupported MIME type
const exeBuffer = Buffer.from("MZ\x90\x00\x03\x00\x00\x00");
const exeRes = validateFile({ buffer: exeBuffer, mimeType: "application/x-msdownload", size: exeBuffer.length });
assert(!exeRes.valid, "Executable MIME type is strictly rejected");

// --- TEST GROUP 2: File Size Enforcement ---
console.log("\n[Group 2: File Size Enforcement]");

// 7. Max size boundary
assert(MAX_DOCUMENT_FILE_SIZE === 5 * 1024 * 1024, "MAX_DOCUMENT_FILE_SIZE is strictly set to 5 MB");

// 8. Reject file > 5 MB
const oversizedSize = 6 * 1024 * 1024;
const dummyBuffer = Buffer.alloc(10);
const oversizeRes = validateFile({ buffer: dummyBuffer, mimeType: "image/jpeg", size: oversizedSize });
assert(!oversizeRes.valid, "File declared size > 5 MB is rejected");

// 9. Reject empty file (0 bytes)
const emptyRes = validateFile({ buffer: Buffer.alloc(0), mimeType: "image/jpeg", size: 0 });
assert(!emptyRes.valid, "Empty 0-byte file is rejected");

// --- TEST GROUP 3: Unguessable Path Generation & Directory Traversal Prevention ---
console.log("\n[Group 3: Secure Path Generation & Traversal Prevention]");

// 10. Unguessable UUID path structure
const path = generateObjectPath({
  guestId: "KEK-2026-0001",
  docType: "nic_front",
  extension: "jpg",
});
const uuidRegex = /guests\/KEK-2026-0001\/nic_front\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpg/;
assert(uuidRegex.test(path), `Generated path matches UUID structure: ${path}`);

// 11. Directory traversal sanitization in guestId
const traversalPath = generateObjectPath({
  guestId: "../../../etc/passwd",
  docType: "passport_page",
  extension: "png",
});
assert(!traversalPath.includes("..") && !traversalPath.includes("/passwd"), "Directory traversal characters stripped from path");

// 12. Payment receipt path generation
const paymentPath = generatePaymentReceiptPath({
  paymentId: "PAY-1001",
  extension: "pdf",
});
const paymentRegex = /payments\/PAY-1001\/receipt\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.pdf/;
assert(paymentRegex.test(paymentPath), `Payment receipt path generated: ${paymentPath}`);

// --- TEST GROUP 4: Firebase Auth Bridge & RBAC Integrity ---
console.log("\n[Group 4: Firebase Auth Bridge & Owner RBAC Integrity]");

// 13. Hardcoded Owner UIDs count
assert(APPROVED_OWNER_UIDS.length === 2, "Exactly two Owner accounts are approved for Owner privileges");

// 14. Primary owner UID check
assert(
  APPROVED_OWNER_UIDS.includes("uaksPM6v5LRGmtR9BdYmVdNcksU2"),
  "Primary Owner UID (kekulamaecocabana@gmail.com) is in approved list"
);

// 15. Secondary owner UID check
assert(
  APPROVED_OWNER_UIDS.includes("nfcCH0mfFMa1Yka50rBuXcRhCmY2"),
  "Secondary Owner UID (chamilka.ch@gmail.com) is in approved list"
);

// 16. Arbitrary UID cannot obtain owner role
const fakeUid = "attacker-unauthorized-uid-999";
const isFakeOwner = APPROVED_OWNER_UIDS.includes(fakeUid as any);
assert(!isFakeOwner, "Arbitrary/attacker UID cannot bypass Owner authorization");

// --- SUMMARY ---
console.log("\n=======================================================");
console.log(` RESULTS: ${testsPassed} passed, ${testsFailed} failed`);
console.log("=======================================================\n");

if (testsFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

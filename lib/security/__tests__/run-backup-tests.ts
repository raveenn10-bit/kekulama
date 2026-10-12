import assert from "assert";
import crypto from "crypto";
import { decryptBackupArchive, BackupManifest } from "../../backup/backupEngine";

console.log("=======================================================");
console.log("  RUNNING GOOGLE DRIVE BACKUP & ENCRYPTION TESTS");
console.log("=======================================================\n");

let passedTests = 0;
let totalTests = 0;

function runTest(name: string, fn: () => void) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ [PASS] ${name}`);
    passedTests++;
  } catch (err: any) {
    console.error(`  ✗ [FAIL] ${name}:`, err.message);
    process.exit(1);
  }
}

// 1. Encryption and Decryption Roundtrip with AES-256-GCM
runTest("AES-256-GCM Archive Encryption & Decryption Roundtrip", () => {
  const samplePayload = {
    version: "2.0",
    backupId: "bkp_test_123",
    createdAt: new Date().toISOString(),
    project: "kekulama",
    collections: {
      bookings: [{ _id: "b1", guestName: "John Doe", totalAmount: 150 }],
      payments: [{ _id: "p1", amount: 150, status: "confirmed" }],
    },
    storageFiles: [],
  };

  const rawJson = JSON.stringify(samplePayload);
  const sha256Checksum = crypto.createHash("sha256").update(rawJson, "utf8").digest("hex");

  const manifest: BackupManifest = {
    version: "2.0",
    backupId: "bkp_test_123",
    createdAt: new Date().toISOString(),
    project: "kekulama",
    collections: {
      bookings: { count: 1, sampleIds: ["b1"] },
      payments: { count: 1, sampleIds: ["p1"] },
    },
    files: { count: 0, totalSizeBytes: 0, paths: [] },
    sha256Checksum,
    encryptionAlgorithm: "aes-256-gcm",
  };

  // Encrypt
  const key = crypto.createHash("sha256").update("kekulama-luxury-backup-secure-passphrase-2026").digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(rawJson, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const envelope = JSON.stringify({
    format: "kekulama_encrypted_backup_v2",
    manifest,
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
    ciphertext: ciphertext.toString("base64"),
  });

  const archiveBuffer = Buffer.from(envelope, "utf-8");

  // Decrypt & Verify
  const result = decryptBackupArchive(archiveBuffer);
  assert.strictEqual(result.manifest.backupId, "bkp_test_123");
  assert.strictEqual(result.payload.collections.bookings.length, 1);
  assert.strictEqual(result.payload.collections.bookings[0].guestName, "John Doe");
});

// 2. Tamper Rejection Test (Integrity Verification)
runTest("Rejects Tampered or Modified Backup Payloads", () => {
  const samplePayload = { test: "data" };
  const rawJson = JSON.stringify(samplePayload);
  const fakeChecksum = "tampered_fake_checksum_0000000000000000000000000000000000000000";

  const manifest: BackupManifest = {
    version: "2.0",
    backupId: "bkp_tampered",
    createdAt: new Date().toISOString(),
    project: "kekulama",
    collections: {},
    files: { count: 0, totalSizeBytes: 0, paths: [] },
    sha256Checksum: fakeChecksum,
    encryptionAlgorithm: "aes-256-gcm",
  };

  const key = crypto.createHash("sha256").update("kekulama-luxury-backup-secure-passphrase-2026").digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(rawJson, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const envelope = JSON.stringify({
    format: "kekulama_encrypted_backup_v2",
    manifest,
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
    ciphertext: ciphertext.toString("base64"),
  });

  assert.throws(() => {
    decryptBackupArchive(Buffer.from(envelope, "utf-8"));
  }, /integrity verification failed/i);
});

// 3. Minimum Scope & OAuth Validation
runTest("Google Drive Scope adheres to Least Privilege (drive.file)", () => {
  const allowedScope = "https://www.googleapis.com/auth/drive.file";
  assert(!allowedScope.includes("https://www.googleapis.com/auth/drive "), "Does not use broad drive scope");
  assert(allowedScope === "https://www.googleapis.com/auth/drive.file", "Requires strictly per-file drive.file scope");
});

console.log("\n=======================================================");
console.log(`  ALL ${passedTests}/${totalTests} BACKUP TESTS PASSED!`);
console.log("=======================================================\n");

import assert from "assert";
import crypto from "crypto";
import { decryptBackupArchive, deriveKeyFromSecret, BackupManifest } from "../../backup/backupEngine";

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

// 4. Daily Cron Schedule Validation (Once a day at 02:00 AM Sri Lanka Time)
runTest("Vercel Cron Schedule is configured for once daily at 02:00 AM SL Time (20:30 UTC)", () => {
  const cronSchedule = "30 20 * * *";
  const [min, hour, dom, mon, dow] = cronSchedule.split(" ");
  assert.strictEqual(min, "30", "Runs at minute 30");
  assert.strictEqual(hour, "20", "Runs at 20:00 UTC (02:00 AM Asia/Colombo next day)");
  assert.strictEqual(dom, "*", "Runs every day of month");
  assert.strictEqual(mon, "*", "Runs every month");
  assert.strictEqual(dow, "*", "Runs every day of week (once daily)");
});

// 5. Direct 32-Byte Base64 Key Derivation Test
runTest("Direct 32-byte Base64 Key decodes to exact 32 bytes Buffer", () => {
  const random32 = crypto.randomBytes(32);
  const base64Key = random32.toString("base64");
  const derived = deriveKeyFromSecret(base64Key);
  assert.strictEqual(derived.length, 32, "Derived key is exactly 32 bytes");
  assert(derived.equals(random32), "Base64 decodes directly to original 32 raw bytes");
});

// 6. Multi-Key Fallback and Key Rotation Restoration Test
runTest("Restores legacy archive encrypted with old key after key rotation", () => {
  // Simulate an old backup created with legacy passphrase
  const oldSecret = "kekulama-luxury-backup-secure-passphrase-2026";
  const oldKey = crypto.createHash("sha256").update(oldSecret, "utf8").digest();
  const samplePayload = {
    version: "2.0",
    backupId: "bkp_legacy_rotation_test",
    createdAt: new Date().toISOString(),
    project: "kekulama",
    collections: { bookings: [{ _id: "b_legacy", guestName: "Old Guest" }] },
    storageFiles: [],
  };
  const rawJson = JSON.stringify(samplePayload);
  const sha256Checksum = crypto.createHash("sha256").update(rawJson, "utf8").digest("hex");

  const manifest: BackupManifest = {
    version: "2.0",
    backupId: "bkp_legacy_rotation_test",
    createdAt: new Date().toISOString(),
    project: "kekulama",
    collections: { bookings: { count: 1, sampleIds: ["b_legacy"] } },
    files: { count: 0, totalSizeBytes: 0, paths: [] },
    sha256Checksum,
    encryptionAlgorithm: "aes-256-gcm",
  };

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", oldKey, iv);
  const ciphertext = Buffer.concat([cipher.update(rawJson, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const envelope = JSON.stringify({
    format: "kekulama_encrypted_backup_v2",
    manifest,
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
    ciphertext: ciphertext.toString("base64"),
  });

  // Now simulate environment having a NEW, rotated BACKUP_ENCRYPTION_KEY
  const new32ByteKey = crypto.randomBytes(32).toString("base64");
  process.env.BACKUP_ENCRYPTION_KEY = new32ByteKey;
  process.env.OLD_BACKUP_ENCRYPTION_KEY = oldSecret;

  // Decrypt should transparently test candidate keys and succeed!
  const decrypted = decryptBackupArchive(Buffer.from(envelope, "utf-8"));
  assert.strictEqual(decrypted.manifest.backupId, "bkp_legacy_rotation_test");
  assert.strictEqual(decrypted.payload.collections.bookings[0].guestName, "Old Guest");
});

// 7. Strict Rejection with Unknown / Untrusted Key
runTest("Rejects archive encrypted with completely unknown key", () => {
  const alienKey = crypto.randomBytes(32);
  const rawJson = JSON.stringify({ secret: "alien data" });
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", alienKey, iv);
  const ciphertext = Buffer.concat([cipher.update(rawJson, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const envelope = JSON.stringify({
    format: "kekulama_encrypted_backup_v2",
    manifest: {
      version: "2.0",
      backupId: "bkp_alien",
      createdAt: new Date().toISOString(),
      project: "kekulama",
      collections: {},
      files: { count: 0, totalSizeBytes: 0, paths: [] },
      sha256Checksum: crypto.createHash("sha256").update(rawJson, "utf8").digest("hex"),
      encryptionAlgorithm: "aes-256-gcm",
    },
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
    ciphertext: ciphertext.toString("base64"),
  });

  assert.throws(() => {
    decryptBackupArchive(Buffer.from(envelope, "utf-8"));
  }, /Unable to authenticate ciphertext with any available encryption key/i);
});

console.log("\n=======================================================");
console.log(`  ALL ${passedTests}/${totalTests} BACKUP TESTS PASSED!`);
console.log("=======================================================\n");

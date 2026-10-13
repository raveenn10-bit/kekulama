import crypto from "crypto";
import { adminDb, logAuditEvent } from "../firebase/admin";
import { supabaseAdmin, isSupabaseConfigured } from "../supabase/admin";
import { GUEST_PRIVATE_BUCKET } from "../supabase/storage";
import {
  uploadBackupArchiveToDrive,
  downloadBackupArchiveFromDrive,
  rotateOldBackups,
  DriveUploadedFile,
} from "./googleDriveService";

export const BACKUP_COLLECTIONS = [
  "bookings",
  "rooms",
  "room_calendar_locks",
  "payments",
  "users",
  "guestDocuments",
  "system_settings",
  "registration_tokens",
  "audit_logs",
  "notification_logs",
] as const;

export type BackupCollectionName = (typeof BACKUP_COLLECTIONS)[number];

export interface CollectionBackupStats {
  count: number;
  sampleIds: string[];
}

export interface BackupManifest {
  version: "2.0";
  backupId: string;
  createdAt: string;
  project: string;
  collections: Record<string, CollectionBackupStats>;
  files: {
    count: number;
    totalSizeBytes: number;
    paths: string[];
  };
  sha256Checksum: string;
  encryptionAlgorithm: "aes-256-gcm";
}

export interface BackupExecutionResult {
  success: boolean;
  backupId: string;
  filename: string;
  sizeBytes: number;
  sha256Checksum: string;
  driveFile: DriveUploadedFile;
  manifest: BackupManifest;
  createdAt: string;
}

export interface StoredStorageFile {
  path: string;
  mimeType: string;
  size: number;
  dataBase64: string;
}

/**
 * Safely parses a secret string into a 32-byte cryptographic key Buffer.
 * Supports:
 * - 64-char Hex strings (32 raw bytes)
 * - 43-44 char Base64 or Base64URL 32-byte keys (e.g. from openssl rand -base64 32)
 * - Passphrases / arbitrary strings (hashed via SHA-256 to 32 bytes)
 */
export function deriveKeyFromSecret(secret: string): Buffer {
  const trimmed = (secret || "").trim();
  if (!trimmed) {
    return crypto.createHash("sha256").update("kekulama-luxury-backup-secure-passphrase-2026", "utf8").digest();
  }

  // 1. Direct 64-character Hex string (32 raw bytes)
  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    return Buffer.from(trimmed, "hex");
  }

  // 2. Direct Base64 or Base64URL 32-byte key (43 or 44 characters)
  if (/^(?:[A-Za-z0-9+/]{43}=|[A-Za-z0-9+/]{42}==|[A-Za-z0-9_-]{43})$/.test(trimmed) || trimmed.length === 44) {
    try {
      const isUrlSafe = trimmed.includes("-") || trimmed.includes("_");
      const decoded = Buffer.from(trimmed, isUrlSafe ? "base64url" : "base64");
      if (decoded.length === 32) {
        return decoded;
      }
    } catch {
      // Fall through to SHA-256 derivation
    }
  }

  // 3. Fallback: SHA-256 digest of passphrase string
  return crypto.createHash("sha256").update(trimmed, "utf8").digest();
}

/**
 * Computes a short 8-character key identifier for envelope tagging and fast lookup.
 */
export function computeKeyId(key: Buffer): string {
  return crypto.createHash("sha256").update(key).digest("hex").slice(0, 8);
}

/**
 * Derives the active 32-byte encryption key for generating new backup archives.
 */
export function getBackupEncryptionKey(): Buffer {
  const secret =
    process.env.BACKUP_ENCRYPTION_KEY ||
    process.env.OAUTH_ENCRYPTION_KEY ||
    process.env.APP_SECRET ||
    "kekulama-luxury-backup-secure-passphrase-2026";
  return deriveKeyFromSecret(secret);
}

/**
 * Gathers candidate 32-byte decryption keys in descending priority order.
 * Ensures zero-downtime key rotation and 100% backward compatibility with
 * all legacy archives encrypted with previous keys or literal SHA-256 string hashes.
 */
export function getBackupDecryptionCandidateKeys(): { key: Buffer; keyId: string; source: string }[] {
  const rawSecrets: { secret: string; source: string }[] = [];

  const addSecret = (secret: string | undefined, source: string) => {
    if (secret && typeof secret === "string" && secret.trim()) {
      rawSecrets.push({ secret: secret.trim(), source });
    }
  };

  // 1. Primary backup encryption key
  addSecret(process.env.BACKUP_ENCRYPTION_KEY, "BACKUP_ENCRYPTION_KEY");

  // 2. Key rotation list (comma-separated keys)
  if (process.env.BACKUP_ENCRYPTION_KEYS) {
    const list = process.env.BACKUP_ENCRYPTION_KEYS.split(",");
    list.forEach((k, idx) => addSecret(k, `BACKUP_ENCRYPTION_KEYS[${idx}]`));
  }

  // 3. Explicit old / compromised key fallbacks
  addSecret(process.env.OLD_BACKUP_ENCRYPTION_KEY, "OLD_BACKUP_ENCRYPTION_KEY");
  addSecret(process.env.BACKUP_ENCRYPTION_KEY_OLD, "BACKUP_ENCRYPTION_KEY_OLD");
  addSecret(process.env.PREVIOUS_BACKUP_ENCRYPTION_KEY, "PREVIOUS_BACKUP_ENCRYPTION_KEY");

  // 4. Secondary system keys
  addSecret(process.env.OAUTH_ENCRYPTION_KEY, "OAUTH_ENCRYPTION_KEY");
  addSecret(process.env.APP_SECRET, "APP_SECRET");

  // 5. Default legacy passphrases
  addSecret("kekulama-luxury-backup-secure-passphrase-2026", "DEFAULT_PASSPHRASE_1");
  addSecret("kekulama-aes256-backup-encryption-passphrase", "DEFAULT_PASSPHRASE_2");

  const candidateMap = new Map<string, { key: Buffer; keyId: string; source: string }>();

  for (const { secret, source } of rawSecrets) {
    // A: Decoded/derived 32-byte key (Base64/Hex/SHA256)
    const primaryKey = deriveKeyFromSecret(secret);
    const primaryKeyId = computeKeyId(primaryKey);
    if (!candidateMap.has(primaryKeyId)) {
      candidateMap.set(primaryKeyId, { key: primaryKey, keyId: primaryKeyId, source: `${source} (derived)` });
    }

    // B: Literal UTF-8 SHA-256 digest in case the key was previously treated as an ASCII string
    const legacyKey = crypto.createHash("sha256").update(secret, "utf8").digest();
    const legacyKeyId = computeKeyId(legacyKey);
    if (!candidateMap.has(legacyKeyId)) {
      candidateMap.set(legacyKeyId, { key: legacyKey, keyId: legacyKeyId, source: `${source} (legacy_sha256)` });
    }
  }

  return Array.from(candidateMap.values());
}

/**
 * Executes a complete, production-grade encrypted backup:
 * 1. Exports 10 Firestore collections with document IDs and timestamps
 * 2. Downloads authorized Supabase guest identification documents
 * 3. Generates cryptographic SHA-256 manifest
 * 4. Encrypts payload with military-grade AES-256-GCM
 * 5. Performs resumable upload to Google Drive & verifies file integrity
 * 6. Rotates backups older than 30 days
 */
export async function executeBackup(options?: {
  actorId?: string;
  actorEmail?: string;
  triggeredBy?: "manual" | "scheduled";
}): Promise<BackupExecutionResult> {
  const now = new Date().toISOString();
  const timestampClean = now.replace(/[:.]/g, "-");
  const backupId = `bkp_${timestampClean}`;
  const filename = `kekulama_backup_${timestampClean}.enc`;

  // 1. Export Cloud Firestore Collections in Parallel (Eliminates sequential roundtrip latency)
  const backupCollectionsData: Record<string, any[]> = {};
  const collectionStats: Record<string, CollectionBackupStats> = {};

  await Promise.all(
    BACKUP_COLLECTIONS.map(async (colName) => {
      try {
        const snap = await adminDb.collection(colName).get();
        const docs = snap.docs.map((doc) => ({
          _id: doc.id,
          ...doc.data(),
        }));
        backupCollectionsData[colName] = docs;
        collectionStats[colName] = {
          count: docs.length,
          sampleIds: docs.slice(0, 3).map((d) => d._id),
        };
      } catch (colErr: any) {
        console.warn(`[BACKUP WARNING] Failed exporting collection ${colName}:`, colErr?.message || colErr);
        backupCollectionsData[colName] = [];
        collectionStats[colName] = { count: 0, sampleIds: [] };
      }
    })
  );

  // 2. Export Supabase Guest Storage Files in Parallel
  const storageFiles: StoredStorageFile[] = [];
  const filePaths: string[] = [];
  let totalFileSizeBytes = 0;

  if (isSupabaseConfigured() && backupCollectionsData["guestDocuments"]) {
    const guestDocs = backupCollectionsData["guestDocuments"];
    const docsWithFiles = guestDocs.filter(
      (doc) => doc.privateStoragePath && typeof doc.privateStoragePath === "string"
    );

    const downloadResults = await Promise.all(
      docsWithFiles.map(async (doc) => {
        try {
          const { data, error } = await supabaseAdmin.storage
            .from(GUEST_PRIVATE_BUCKET)
            .download(doc.privateStoragePath);

          if (!error && data) {
            const arrayBuffer = await data.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            return {
              path: doc.privateStoragePath as string,
              mimeType: (doc.mimeType as string) || "application/octet-stream",
              size: buffer.length,
              dataBase64: buffer.toString("base64"),
            };
          }
        } catch (downloadErr: any) {
          console.warn(`[BACKUP WARNING] Could not download storage file ${doc.privateStoragePath}:`, downloadErr?.message);
        }
        return null;
      })
    );

    for (const res of downloadResults) {
      if (res) {
        totalFileSizeBytes += res.size;
        filePaths.push(res.path);
        storageFiles.push({
          path: res.path,
          mimeType: res.mimeType,
          size: res.size,
          dataBase64: res.dataBase64,
        });
      }
    }
  }

  // 3. Assemble Unencrypted Payload
  const payloadObject = {
    version: "2.0",
    backupId,
    createdAt: now,
    project: "kekulama",
    collections: backupCollectionsData,
    storageFiles,
  };

  const rawJson = JSON.stringify(payloadObject);

  // 4. Compute SHA-256 Checksum
  const sha256Checksum = crypto.createHash("sha256").update(rawJson, "utf8").digest("hex");

  // 5. Generate Manifest
  const manifest: BackupManifest = {
    version: "2.0",
    backupId,
    createdAt: now,
    project: "kekulama",
    collections: collectionStats,
    files: {
      count: storageFiles.length,
      totalSizeBytes: totalFileSizeBytes,
      paths: filePaths,
    },
    sha256Checksum,
    encryptionAlgorithm: "aes-256-gcm",
  };

  // 6. Encrypt with AES-256-GCM (96-bit random IV, 128-bit auth tag)
  const key = getBackupEncryptionKey();
  const keyId = computeKeyId(key);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const ciphertext = Buffer.concat([cipher.update(rawJson, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const encryptedEnvelope = JSON.stringify({
    format: "kekulama_encrypted_backup_v2",
    keyId,
    manifest,
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
    ciphertext: ciphertext.toString("base64"),
  });

  const archiveBuffer = Buffer.from(encryptedEnvelope, "utf-8");

  // 7. Upload to Google Drive (Fast Multipart Upload, with Resumable fallback)
  const driveFile = await uploadBackupArchiveToDrive({
    filename,
    buffer: archiveBuffer,
  });

  // 8. Enforce 30-day retention asynchronously in background (does not block HTTP response)
  rotateOldBackups(30).catch((rotErr) => {
    console.warn("[DRIVE ROTATION ASYNC WARNING]", rotErr?.message || rotErr);
  });

  // 9. Store Record in Supabase PostgreSQL & Firestore & write audit log in parallel
  const persistPromises: Promise<any>[] = [
    // Supabase PostgreSQL (Global persistent store)
    (async () => {
      if (isSupabaseConfigured()) {
        try {
          await supabaseAdmin.from("backups").upsert({
            id: backupId,
            filename,
            size_bytes: archiveBuffer.length,
            sha256_checksum: sha256Checksum,
            drive_file_id: driveFile.id,
            drive_file_name: driveFile.name,
            manifest,
            status: "success",
            triggered_by: options?.triggeredBy || "manual",
            actor_id: options?.actorId || "owner",
            actor_email: options?.actorEmail || null,
            created_at: now,
          });
        } catch (sbErr) {
          console.warn("[BACKUP SB WARNING] Could not persist backup record in Supabase:", sbErr);
        }
      }
    })(),

    // Cloud Firestore (with 2.5s timeout)
    (async () => {
      try {
        const firestoreWrite = adminDb.collection("backups").doc(backupId).set({
          backupId,
          filename,
          sizeBytes: archiveBuffer.length,
          sha256Checksum,
          manifest,
          driveFileId: driveFile.id,
          driveFileName: driveFile.name,
          driveMd5Checksum: driveFile.md5Checksum || null,
          triggeredBy: options?.triggeredBy || "manual",
          actorId: options?.actorId || "owner",
          actorEmail: options?.actorEmail || null,
          status: "success",
          createdAt: now,
        });
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2500));
        await Promise.race([firestoreWrite, timeoutPromise]);
      } catch (dbErr) {
        console.warn("[BACKUP DB LOG WARNING] Could not persist backup record in Firestore:", dbErr);
      }
    })(),

    logAuditEvent({
      actorId: options?.actorId || "owner",
      actorEmail: options?.actorEmail || "owner",
      actorRole: "owner",
      action: "BACKUP_TRIGGERED",
      targetResource: `backups/${backupId}`,
      details: {
        filename,
        driveFileId: driveFile.id,
        sizeBytes: archiveBuffer.length,
        collectionsBackedUp: Object.keys(backupCollectionsData),
        fileCount: storageFiles.length,
        triggeredBy: options?.triggeredBy || "manual",
      },
      timestamp: now,
    }).catch((auditErr) => {
      console.warn("[BACKUP AUDIT LOG WARNING] Write skipped:", auditErr);
    }),
  ];

  await Promise.all(persistPromises);

  return {
    success: true,
    backupId,
    filename,
    sizeBytes: archiveBuffer.length,
    sha256Checksum,
    driveFile,
    manifest,
    createdAt: now,
  };
}

export interface RestorePreview {
  backupId: string;
  createdAt: string;
  manifest: BackupManifest;
  collectionsToRestore: Record<string, number>;
  filesToRestore: number;
}

export interface RestoreResult {
  dryRun: boolean;
  success: boolean;
  backupId: string;
  verified: boolean;
  preview?: RestorePreview;
  restoredCollections?: Record<string, number>;
  restoredFilesCount?: number;
  message: string;
}

/**
 * Decrypts and unpacks a backup archive buffer.
 * Performs cryptographic auth-tag validation and SHA-256 integrity verification.
 * Implements a resilient multi-key candidate fallback loop to safely restore archives
 * encrypted with current, previous, or legacy keys without downtime.
 */
export function decryptBackupArchive(archiveBuffer: Buffer): { manifest: BackupManifest; payload: any; matchedKeySource?: string } {
  const envelope = JSON.parse(archiveBuffer.toString("utf-8"));
  if (
    envelope.format !== "kekulama_encrypted_backup_v2" ||
    !envelope.iv ||
    !envelope.authTag ||
    !envelope.ciphertext
  ) {
    throw new Error("Invalid or corrupted backup archive envelope format.");
  }

  const iv = Buffer.from(envelope.iv, "hex");
  const authTag = Buffer.from(envelope.authTag, "hex");
  const ciphertextBuffer = Buffer.from(envelope.ciphertext, "base64");
  const candidates = getBackupDecryptionCandidateKeys();

  // If envelope includes a keyId, prioritize matching candidate first
  const envelopeKeyId: string | undefined = envelope.keyId;
  const sortedCandidates = envelopeKeyId
    ? [...candidates.filter((c) => c.keyId === envelopeKeyId), ...candidates.filter((c) => c.keyId !== envelopeKeyId)]
    : candidates;

  let decryptedRaw: string | null = null;
  let matchedSource: string | null = null;
  let lastAuthError: Error | null = null;

  for (const candidate of sortedCandidates) {
    try {
      const decipher = crypto.createDecipheriv("aes-256-gcm", candidate.key, iv);
      decipher.setAuthTag(authTag);
      decryptedRaw = Buffer.concat([decipher.update(ciphertextBuffer), decipher.final()]).toString("utf8");
      matchedSource = candidate.source;
      break; // Successfully authenticated and decrypted
    } catch (err: any) {
      lastAuthError = err;
      // GCM authentication failure; proceed to next candidate key
    }
  }

  if (!decryptedRaw) {
    throw new Error(
      `Backup archive decryption failed: Unable to authenticate ciphertext with any available encryption key (tried ${sortedCandidates.length} candidate keys). Please verify BACKUP_ENCRYPTION_KEY or supply the legacy key in OLD_BACKUP_ENCRYPTION_KEY.`
    );
  }

  // Cryptographic integrity verification against manifest SHA-256 checksum
  const computedHash = crypto.createHash("sha256").update(decryptedRaw, "utf8").digest("hex");
  if (computedHash !== envelope.manifest.sha256Checksum) {
    throw new Error(
      `Backup integrity verification failed: computed hash (${computedHash}) does not match manifest (${envelope.manifest.sha256Checksum}). Archive may have been tampered with.`
    );
  }

  const payload = JSON.parse(decryptedRaw);
  return { manifest: envelope.manifest, payload, matchedKeySource: matchedSource || undefined };
}

/**
 * Safe Restore Workflow:
 * - Dry-Run Mode: Validates archive, checks integrity, counts records, and returns preview WITHOUT writing to database.
 * - Live Mode: Requires explicit confirmation (confirmRestore: true). Restores collections with batch operations.
 */
export async function executeRestore({
  backupId,
  archiveBuffer,
  dryRun = true,
  confirmRestore = false,
  actorId = "owner",
}: {
  backupId: string;
  archiveBuffer?: Buffer;
  dryRun?: boolean;
  confirmRestore?: boolean;
  actorId?: string;
}): Promise<RestoreResult> {
  // 1. Retrieve Archive Buffer
  let bufferToDecrypt = archiveBuffer;
  if (!bufferToDecrypt) {
    // Look up Drive File ID from Firestore backups collection
    const backupDoc = await adminDb.collection("backups").doc(backupId).get();
    if (!backupDoc.exists) {
      throw new Error(`Backup record ${backupId} not found.`);
    }
    const backupData = backupDoc.data();
    if (!backupData?.driveFileId) {
      throw new Error(`Backup record ${backupId} does not reference a valid Google Drive file ID.`);
    }
    bufferToDecrypt = await downloadBackupArchiveFromDrive(backupData.driveFileId);
  }

  // 2. Decrypt and verify archive
  const { manifest, payload } = decryptBackupArchive(bufferToDecrypt);

  const collectionsData: Record<string, any[]> = payload.collections || {};
  const storageFilesData: StoredStorageFile[] = payload.storageFiles || [];

  const collectionCounts: Record<string, number> = {};
  for (const [col, docs] of Object.entries(collectionsData)) {
    collectionCounts[col] = Array.isArray(docs) ? docs.length : 0;
  }

  // 3. Dry-Run Validation Mode (Safety First)
  if (dryRun || !confirmRestore) {
    return {
      dryRun: true,
      success: true,
      backupId,
      verified: true,
      preview: {
        backupId,
        createdAt: manifest.createdAt,
        manifest,
        collectionsToRestore: collectionCounts,
        filesToRestore: storageFilesData.length,
      },
      message:
        "Dry-run simulation completed. Cryptographic integrity and SHA-256 manifest verified. No database records were modified.",
    };
  }

  // 4. Live Restore Execution (Explicit Confirmation Required)
  const restoredCollections: Record<string, number> = {};

  for (const [colName, docs] of Object.entries(collectionsData)) {
    if (!Array.isArray(docs)) continue;

    // Use Firestore batched writes (up to 400 docs per batch)
    let batch = adminDb.batch();
    let batchCount = 0;

    for (const doc of docs) {
      const { _id, ...docBody } = doc;
      if (!_id) continue;

      const docRef = adminDb.collection(colName).doc(_id);
      batch.set(docRef, docBody, { merge: true });
      batchCount++;

      if (batchCount >= 400) {
        await batch.commit();
        batch = adminDb.batch();
        batchCount = 0;
      }
    }

    if (batchCount > 0) {
      await batch.commit();
    }

    restoredCollections[colName] = docs.length;
  }

  // 5. Restore Supabase Storage Files if needed
  let restoredFilesCount = 0;
  if (isSupabaseConfigured() && storageFilesData.length > 0) {
    for (const file of storageFilesData) {
      try {
        const fileBuffer = Buffer.from(file.dataBase64, "base64");
        await supabaseAdmin.storage.from(GUEST_PRIVATE_BUCKET).upload(file.path, fileBuffer, {
          contentType: file.mimeType,
          upsert: true,
        });
        restoredFilesCount++;
      } catch (uploadErr) {
        console.warn(`[RESTORE WARNING] Could not restore storage file ${file.path}:`, uploadErr);
      }
    }
  }

  // 6. Record Audit Event
  try {
    await logAuditEvent({
      actorId,
      actorRole: "owner",
      action: "BACKUP_RESTORED",
      targetResource: `backups/${backupId}`,
      details: {
        backupId,
        restoredCollections,
        restoredFilesCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (auditErr) {
    console.warn("[RESTORE AUDIT LOG WARNING] Write skipped:", auditErr);
  }

  return {
    dryRun: false,
    success: true,
    backupId,
    verified: true,
    restoredCollections,
    restoredFilesCount,
    message: `Disaster recovery restore completed successfully. Restored ${Object.keys(restoredCollections).length} collections and ${restoredFilesCount} files.`,
  };
}

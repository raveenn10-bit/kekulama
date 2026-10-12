import fs from "fs";
import path from "path";
import { adminDb } from "../firebase/admin";
import { encryptToken, decryptToken } from "./tokenEncryption";

export interface GmailOAuthSettings {
  provider: "gmail";
  connectedEmail: string;
  encryptedRefreshToken: string | null;
  hasRefreshToken: boolean;
  scopes: string;
  tokenType: string;
  status: "active" | "inactive";
  updatedAt: string;
}

// In serverless environments (Vercel), process.cwd() is read-only, so use /tmp if needed
const getFallbackFilePath = (): string => {
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  const baseDir = isServerless ? "/tmp" : process.cwd();
  return path.join(baseDir, ".system_settings.enc");
};

/**
 * Persists Gmail OAuth settings.
 * First attempts to save directly to Cloud Firestore `system_settings/gmail_oauth`.
 * If Firestore permissions are missing or denied (e.g. running without a service account key),
 * safely falls back to storing in an AES-256-GCM encrypted local store so the OAuth flow
 * and email sending continue to operate without crashing.
 */
export async function saveGmailOAuthSettings(settings: GmailOAuthSettings): Promise<{ storageType: "firestore" | "encrypted_file" }> {
  // 1. Try Cloud Firestore
  try {
    const docRef = adminDb.collection("system_settings").doc("gmail_oauth");
    await docRef.set(settings, { merge: true });
    return { storageType: "firestore" };
  } catch (firestoreErr: any) {
    console.warn(
      "[SETTINGS STORAGE] Firestore write failed (" +
        (firestoreErr?.message || "PERMISSION_DENIED") +
        "). Falling back to AES-256-GCM encrypted storage."
    );
  }

  // 2. Fallback to AES-256-GCM encrypted store
  try {
    const filePath = getFallbackFilePath();
    const rawPayload = JSON.stringify(settings);
    const encryptedPayload = encryptToken(rawPayload);
    fs.writeFileSync(filePath, encryptedPayload, "utf-8");
    return { storageType: "encrypted_file" };
  } catch (fsErr: any) {
    console.error("[SETTINGS STORAGE] Fallback file write failed:", fsErr);
    throw new Error("Unable to persist OAuth settings to Firestore or encrypted storage.");
  }
}

/**
 * Retrieves Gmail OAuth settings.
 * Checks Cloud Firestore first, then falls back to the encrypted local store.
 */
export async function getGmailOAuthSettings(): Promise<GmailOAuthSettings | null> {
  // 1. Try Cloud Firestore
  try {
    const docRef = adminDb.collection("system_settings").doc("gmail_oauth");
    const snap = await docRef.get();
    if (snap.exists) {
      return snap.data() as GmailOAuthSettings;
    }
  } catch (firestoreErr: any) {
    // Fall through to fallback file
  }

  // 2. Try Encrypted Fallback File
  try {
    const filePath = getFallbackFilePath();
    if (fs.existsSync(filePath)) {
      const encryptedData = fs.readFileSync(filePath, "utf-8");
      const decryptedJson = decryptToken(encryptedData);
      if (decryptedJson) {
        return JSON.parse(decryptedJson) as GmailOAuthSettings;
      }
    }
  } catch (fsErr: any) {
    console.warn("[SETTINGS STORAGE] Failed reading fallback file:", fsErr?.message);
  }

  return null;
}

export interface GoogleDriveOAuthSettings {
  provider: "google_drive";
  connectedEmail: string;
  encryptedRefreshToken: string | null;
  hasRefreshToken: boolean;
  folderId?: string;
  folderName?: string;
  scopes: string;
  tokenType: string;
  status: "active" | "inactive";
  updatedAt: string;
}

const getDriveFallbackFilePath = (): string => {
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  const baseDir = isServerless ? "/tmp" : process.cwd();
  return path.join(baseDir, ".drive_settings.enc");
};

/**
 * Persists Google Drive OAuth settings.
 * Saves to Cloud Firestore `system_settings/google_drive_oauth` with encrypted fallback.
 */
export async function saveDriveOAuthSettings(settings: GoogleDriveOAuthSettings): Promise<{ storageType: "firestore" | "encrypted_file" }> {
  // 1. Try Cloud Firestore
  try {
    const docRef = adminDb.collection("system_settings").doc("google_drive_oauth");
    await docRef.set(settings, { merge: true });
    return { storageType: "firestore" };
  } catch (firestoreErr: any) {
    console.warn(
      "[SETTINGS STORAGE] Firestore write failed (" +
        (firestoreErr?.message || "PERMISSION_DENIED") +
        "). Falling back to AES-256-GCM encrypted storage for Drive OAuth."
    );
  }

  // 2. Fallback to AES-256-GCM encrypted store
  try {
    const filePath = getDriveFallbackFilePath();
    const rawPayload = JSON.stringify(settings);
    const encryptedPayload = encryptToken(rawPayload);
    fs.writeFileSync(filePath, encryptedPayload, "utf-8");
    return { storageType: "encrypted_file" };
  } catch (fsErr: any) {
    console.error("[SETTINGS STORAGE] Drive fallback file write failed:", fsErr);
    throw new Error("Unable to persist Drive OAuth settings to Firestore or encrypted storage.");
  }
}

/**
 * Retrieves Google Drive OAuth settings.
 */
export async function getDriveOAuthSettings(): Promise<GoogleDriveOAuthSettings | null> {
  // 1. Try Cloud Firestore
  try {
    const docRef = adminDb.collection("system_settings").doc("google_drive_oauth");
    const snap = await docRef.get();
    if (snap.exists) {
      return snap.data() as GoogleDriveOAuthSettings;
    }
  } catch (firestoreErr: any) {
    // Fall through to fallback file
  }

  // 2. Try Encrypted Fallback File
  try {
    const filePath = getDriveFallbackFilePath();
    if (fs.existsSync(filePath)) {
      const encryptedData = fs.readFileSync(filePath, "utf-8");
      const decryptedJson = decryptToken(encryptedData);
      if (decryptedJson) {
        return JSON.parse(decryptedJson) as GoogleDriveOAuthSettings;
      }
    }
  } catch (fsErr: any) {
    console.warn("[SETTINGS STORAGE] Failed reading Drive fallback file:", fsErr?.message);
  }

  return null;
}


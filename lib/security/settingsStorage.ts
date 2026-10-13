import fs from "fs";
import path from "path";
import { adminDb } from "../firebase/admin";
import { encryptToken, decryptToken } from "./tokenEncryption";
import { supabaseAdmin, isSupabaseConfigured } from "../supabase/admin";
import { GUEST_PRIVATE_BUCKET } from "../supabase/storage";

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
 * Persists Gmail OAuth settings across multi-tier storage:
 * 1. Cloud Firestore `system_settings/gmail_oauth`
 * 2. Supabase Storage `.system_settings/gmail_oauth.enc` (AES-256-GCM encrypted)
 * 3. Ephemeral local store `/tmp/.system_settings.enc`
 */
export async function saveGmailOAuthSettings(settings: GmailOAuthSettings): Promise<{ storageType: "firestore" | "supabase" | "encrypted_file" }> {
  let savedToFirestore = false;
  let savedToSupabase = false;

  // 1. Try Cloud Firestore
  try {
    const docRef = adminDb.collection("system_settings").doc("gmail_oauth");
    await docRef.set(settings, { merge: true });
    savedToFirestore = true;
  } catch (firestoreErr: any) {
    console.warn(
      "[SETTINGS STORAGE] Firestore write failed (" +
        (firestoreErr?.message || "PERMISSION_DENIED") +
        ")."
    );
  }

  // 2. Try Supabase Private Storage (Persistent across all Vercel instances)
  try {
    if (isSupabaseConfigured()) {
      const rawPayload = JSON.stringify(settings);
      const encryptedPayload = encryptToken(rawPayload);
      const buffer = Buffer.from(encryptedPayload, "utf-8");
      const { error } = await supabaseAdmin.storage
        .from(GUEST_PRIVATE_BUCKET)
        .upload(".system_settings/gmail_oauth.enc", buffer, {
          contentType: "application/octet-stream",
          upsert: true,
        });
      if (!error) {
        savedToSupabase = true;
      }
    }
  } catch (supabaseErr: any) {
    console.warn("[SETTINGS STORAGE] Supabase storage write skipped:", supabaseErr?.message);
  }

  // 3. Fallback to AES-256-GCM encrypted local store
  try {
    const filePath = getFallbackFilePath();
    const rawPayload = JSON.stringify(settings);
    const encryptedPayload = encryptToken(rawPayload);
    fs.writeFileSync(filePath, encryptedPayload, "utf-8");
  } catch (fsErr: any) {
    // Ephemeral write skipped
  }

  if (savedToFirestore) return { storageType: "firestore" };
  if (savedToSupabase) return { storageType: "supabase" };
  return { storageType: "encrypted_file" };
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
    // Fall through to Supabase Storage
  }

  // 2. Try Supabase Private Storage
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin.storage
        .from(GUEST_PRIVATE_BUCKET)
        .download(".system_settings/gmail_oauth.enc");
      if (!error && data) {
        const text = await data.text();
        const decryptedJson = decryptToken(text);
        if (decryptedJson) {
          return JSON.parse(decryptedJson) as GmailOAuthSettings;
        }
      }
    }
  } catch (supabaseErr: any) {
    // Fall through to fallback file
  }

  // 3. Try Encrypted Fallback File
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
 * Persists Google Drive OAuth settings across multi-tier storage:
 * 1. Cloud Firestore `system_settings/google_drive_oauth`
 * 2. Supabase Storage `.system_settings/google_drive_oauth.enc` (AES-256-GCM encrypted)
 * 3. Ephemeral local store `/tmp/.drive_settings.enc`
 */
export async function saveDriveOAuthSettings(settings: GoogleDriveOAuthSettings): Promise<{ storageType: "firestore" | "supabase" | "encrypted_file" }> {
  let savedToFirestore = false;
  let savedToSupabase = false;

  // 1. Try Cloud Firestore
  try {
    const docRef = adminDb.collection("system_settings").doc("google_drive_oauth");
    await docRef.set(settings, { merge: true });
    savedToFirestore = true;
  } catch (firestoreErr: any) {
    console.warn(
      "[SETTINGS STORAGE] Firestore write failed (" +
        (firestoreErr?.message || "PERMISSION_DENIED") +
        ")."
    );
  }

  // 2. Try Supabase Private Storage (Persistent across all Vercel instances)
  try {
    if (isSupabaseConfigured()) {
      const rawPayload = JSON.stringify(settings);
      const encryptedPayload = encryptToken(rawPayload);
      const buffer = Buffer.from(encryptedPayload, "utf-8");
      const { error } = await supabaseAdmin.storage
        .from(GUEST_PRIVATE_BUCKET)
        .upload(".system_settings/google_drive_oauth.enc", buffer, {
          contentType: "application/octet-stream",
          upsert: true,
        });
      if (!error) {
        savedToSupabase = true;
      }
    }
  } catch (supabaseErr: any) {
    console.warn("[SETTINGS STORAGE] Supabase storage write skipped for Drive OAuth:", supabaseErr?.message);
  }

  // 3. Fallback to AES-256-GCM encrypted local store
  try {
    const filePath = getDriveFallbackFilePath();
    const rawPayload = JSON.stringify(settings);
    const encryptedPayload = encryptToken(rawPayload);
    fs.writeFileSync(filePath, encryptedPayload, "utf-8");
  } catch (fsErr: any) {
    // Ephemeral write skipped
  }

  if (savedToFirestore) return { storageType: "firestore" };
  if (savedToSupabase) return { storageType: "supabase" };
  return { storageType: "encrypted_file" };
}

/**
 * Retrieves Google Drive OAuth settings with multi-tier failover.
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
    // Fall through to Supabase Storage
  }

  // 2. Try Supabase Private Storage
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin.storage
        .from(GUEST_PRIVATE_BUCKET)
        .download(".system_settings/google_drive_oauth.enc");
      if (!error && data) {
        const text = await data.text();
        const decryptedJson = decryptToken(text);
        if (decryptedJson) {
          return JSON.parse(decryptedJson) as GoogleDriveOAuthSettings;
        }
      }
    }
  } catch (supabaseErr: any) {
    // Fall through to local fallback file
  }

  // 3. Try Encrypted Fallback File
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


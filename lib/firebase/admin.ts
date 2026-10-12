import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore, FieldValue } from "firebase-admin/firestore";
import { getStorage, Storage } from "firebase-admin/storage";
import { AuditLogEntry } from "@/types/admin";

function getFirebaseAdminApp(): App {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0]!;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "kekulama";
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  if (projectId && clientEmail && privateKey) {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
    });
  }

  return initializeApp({
    projectId: projectId || "kekulama",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "kekulama.firebasestorage.app",
  });
}

const adminApp = getFirebaseAdminApp();
export const adminAuth: Auth = getAuth(adminApp);
export const adminDb: Firestore = getFirestore(adminApp);
export const adminStorage: Storage = getStorage(adminApp);

/**
 * Immutable Audit Logging Helper
 * Writes security-critical events directly to the firestore audit_logs collection
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    const logData = {
      ...entry,
      timestamp: new Date().toISOString(),
      createdAt: FieldValue.serverTimestamp(),
    };
    await adminDb.collection("audit_logs").add(logData);
  } catch (err) {
    console.error("[AUDIT LOG ERROR]", err);
  }
}

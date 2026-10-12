"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Database,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Lock,
  Cloud,
  ExternalLink,
  History,
  FileCheck2,
  AlertCircle,
  Eye,
  RotateCcw,
} from "lucide-react";
import { useAdminAuth } from "@/components/admin/AdminAuthContext";

interface BackupItem {
  id: string;
  backupId: string;
  filename: string;
  sizeBytes: number;
  sha256Checksum?: string;
  driveFileId?: string;
  driveFileName?: string;
  triggeredBy?: string;
  status: string;
  createdAt: string;
  manifest?: {
    collections?: Record<string, { count: number }>;
    files?: { count: number; totalSizeBytes: number };
  };
}

interface DriveStatus {
  connected: boolean;
  email: string;
  folderName: string;
  status: string;
  updatedAt?: string;
}

interface RestorePreviewData {
  backupId: string;
  createdAt: string;
  collectionsToRestore: Record<string, number>;
  filesToRestore: number;
}

function AdminBackupContent() {
  const { role, getIdToken } = useAdminAuth();
  const searchParams = useSearchParams();
  const oauthStatus = searchParams.get("oauth");
  const oauthEmail = searchParams.get("email");
  const oauthReason = searchParams.get("reason");

  const [backingUp, setBackingUp] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [driveStatus, setDriveStatus] = useState<DriveStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Reconciled OAuth Banner state
  const [oauthBanner, setOauthBanner] = useState<{
    status: string;
    email?: string | null;
    reason?: string | null;
  } | null>(null);

  // Restore state
  const [selectedBackupForRestore, setSelectedBackupForRestore] = useState<BackupItem | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [restorePreview, setRestorePreview] = useState<RestorePreviewData | null>(null);
  const [restoreSuccessMsg, setRestoreSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (oauthStatus) {
      setOauthBanner({
        status: oauthStatus,
        email: oauthEmail,
        reason: oauthReason,
      });
      // Clean query parameters from address bar to prevent sticky banner on page reloads
      if (typeof window !== "undefined" && window.history?.replaceState) {
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, [oauthStatus, oauthEmail, oauthReason]);

  // Load Drive status & backup history
  const fetchStatusAndHistory = async () => {
    try {
      const token = await getIdToken();
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

      // 1. Fetch Drive connection status
      const statusRes = await fetch("/api/admin/backup/status", { headers });
      if (statusRes.ok) {
        const data = await statusRes.json();
        setDriveStatus(data);
      }

      // 2. Fetch Backup history
      const listRes = await fetch("/api/admin/backup", { headers });
      if (listRes.ok) {
        const listData = await listRes.json();
        setBackups(listData.backups || []);
      }
    } catch (err) {
      console.warn("Failed fetching backup status/history:", err);
    } finally {
      setLoadingStatus(false);
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchStatusAndHistory();
  }, []);

  if (role !== "owner") {
    return (
      <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center">
        <p className="text-xs text-rose-600 font-semibold">
          Access Restricted: Only confirmed Owners can view or trigger database backups.
        </p>
      </div>
    );
  }

  const handleBackupNow = async () => {
    setBackingUp(true);
    setBackupSuccess(null);
    setErrorMessage(null);

    try {
      const token = await getIdToken();
      const res = await fetch("/api/admin/backup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      let data: any = null;
      let text = "";
      try {
        text = await res.text();
        data = JSON.parse(text);
      } catch {
        // Non-JSON response
      }

      if (res.ok && data?.success) {
        setBackupSuccess(
          `Backup archive ${data.filename} (${Math.round((data.sizeBytes || 0) / 1024)} KB) created and synchronized to Google Drive!`
        );
        fetchStatusAndHistory();
        setTimeout(() => setBackupSuccess(null), 8000);
      } else {
        const errorDetail =
          data?.error ||
          (text && text.length < 250 ? text : `Server error: HTTP ${res.status} (${res.statusText})`);
        setErrorMessage(errorDetail || "Failed to generate backup.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message ? `Network request failed: ${err.message}` : "Network error during backup.");
    } finally {
      setBackingUp(false);
    }
  };

  // Step 1: Initiate Dry-Run restore
  const handleInitiateRestore = async (item: BackupItem) => {
    setSelectedBackupForRestore(item);
    setRestorePreview(null);
    setRestoreSuccessMsg(null);
    setRestoring(true);

    try {
      const token = await getIdToken();
      const res = await fetch("/api/admin/backup/restore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          backupId: item.backupId || item.id,
          dryRun: true,
        }),
      });

      let data: any = null;
      try {
        const text = await res.text();
        data = JSON.parse(text);
      } catch {}

      if (res.ok && data?.success && data.preview) {
        setRestorePreview(data.preview);
      } else {
        alert(data?.error || `Dry-run validation failed (HTTP ${res.status}).`);
        setSelectedBackupForRestore(null);
      }
    } catch (err: any) {
      alert(`Network error during restore dry-run: ${err?.message || "Unknown error"}`);
      setSelectedBackupForRestore(null);
    } finally {
      setRestoring(false);
    }
  };

  // Step 2: Confirm and execute Live restore
  const handleConfirmLiveRestore = async () => {
    if (!selectedBackupForRestore) return;
    setRestoring(true);

    try {
      const token = await getIdToken();
      const res = await fetch("/api/admin/backup/restore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          backupId: selectedBackupForRestore.backupId || selectedBackupForRestore.id,
          dryRun: false,
          confirmRestore: true,
        }),
      });

      let data: any = null;
      try {
        const text = await res.text();
        data = JSON.parse(text);
      } catch {}

      if (res.ok && data?.success) {
        setRestoreSuccessMsg(data.message || "Disaster recovery restore completed successfully!");
        fetchStatusAndHistory();
      } else {
        alert(data?.error || `Restore execution failed (HTTP ${res.status}).`);
      }
    } catch (err: any) {
      alert(`Network error during restore execution: ${err?.message || "Unknown error"}`);
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Database size={20} className="text-blue-600" />
            <span>Encrypted Cloud Backup & Disaster Recovery Console</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated Google Drive synchronization (AES-256-GCM) with 30-day rotation and integrity verification.
          </p>
        </div>

        <button
          onClick={handleBackupNow}
          disabled={backingUp}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50 shrink-0"
        >
          {backingUp ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
          <span>{backingUp ? "Backing up..." : "Run Backup Now"}</span>
        </button>
      </div>

      {/* OAuth Callback Alerts - Reconciled with Backend Verification */}
      {oauthBanner?.status === "success" && (loadingStatus || driveStatus?.connected) && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold">Google Drive Connected Successfully!</span> Authorized destination:{" "}
              <span className="font-mono">{oauthBanner.email || driveStatus?.email || "kekulamaecocabana@gmail.com"}</span>. Daily 02:00 AM automated backups are active.
            </div>
          </div>
          <button
            onClick={() => setOauthBanner(null)}
            className="text-emerald-700 hover:text-emerald-950 px-2 py-0.5 font-bold cursor-pointer"
            title="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      {oauthBanner?.status === "success" && !loadingStatus && !driveStatus?.connected && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">OAuth Redirect Received:</span> Google completed authorization, but the backend could not verify a decryptable refresh token in storage. Please click <strong>Reconnect Google Drive</strong> to grant offline consent.
            </div>
          </div>
          <button
            onClick={() => setOauthBanner(null)}
            className="text-amber-700 hover:text-amber-950 px-2 py-0.5 font-bold cursor-pointer"
            title="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      {oauthBanner?.status === "error" && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-rose-600 shrink-0" />
            <div>
              <span className="font-bold">Drive OAuth Authorization Error:</span> {oauthBanner.reason || "Unknown error"}. Please check Google Cloud credentials and reconnect.
            </div>
          </div>
          <button
            onClick={() => setOauthBanner(null)}
            className="text-rose-700 hover:text-rose-950 px-2 py-0.5 font-bold cursor-pointer"
            title="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      {/* Backup Success / Error Banners */}
      {backupSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{backupSuccess}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Grid: Google Drive Connection Status & Schedule */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Drive OAuth Integration Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <Cloud size={16} className="text-blue-600" />
              <span>Google Drive Integration</span>
            </div>
            {driveStatus?.connected ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                <CheckCircle2 size={11} /> Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                Not Connected
              </span>
            )}
          </div>

          <p className="text-slate-600 leading-relaxed text-[11px]">
            Backups are uploaded to a dedicated folder in Google Drive using minimum required scope (<code>drive.file</code>).
          </p>

          <div className="p-3 bg-slate-50 rounded-xl space-y-1 font-mono text-[11px] text-slate-700">
            <div>
              <span className="text-slate-400">Account: </span>
              <strong>{driveStatus?.email || "kekulamaecocabana@gmail.com"}</strong>
            </div>
            <div>
              <span className="text-slate-400">Target Folder: </span>
              <strong>{driveStatus?.folderName || "Kekulama_Backups_Secure"}</strong>
            </div>
          </div>

          <div className="pt-1">
            <a
              href="/api/admin/oauth/drive"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <ExternalLink size={13} />
              <span>{driveStatus?.connected ? "Reconnect Google Drive" : "Connect Google Drive"}</span>
            </a>
          </div>
        </div>

        {/* Schedule & Encryption Policy Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>Schedule & Encryption Policy</span>
          </div>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            Automated Vercel Cron triggers once a day (dawasakata 1 serayak) with military-grade AES-256-GCM encryption and SHA-256 integrity checksums.
          </p>
          <div className="p-3 bg-slate-50 rounded-xl font-mono text-xs font-bold text-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <CheckCircle2 size={13} className="text-emerald-600" />
              Auto-Backup: Active (1x Daily)
            </span>
            <span className="text-[11px] text-slate-700 font-semibold">02:00 AM (SL Time) / 20:30 UTC</span>
          </div>
          <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 font-semibold text-[11px] flex items-center gap-1.5">
            <Lock size={13} />
            <span>10 Firestore Collections + Supabase Guest Vault Included</span>
          </div>
        </div>
      </div>

      {/* Backup History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History size={16} className="text-slate-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Backup History & Disaster Recovery Vault
            </h3>
          </div>
          <button
            onClick={fetchStatusAndHistory}
            className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 cursor-pointer font-medium"
          >
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Backup Archive</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Integrity (SHA-256)</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans text-[11px]">
              {loadingHistory ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading backup history...
                  </td>
                </tr>
              ) : backups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No backup archives found. Click "Run Backup Now" to create your first archive.
                  </td>
                </tr>
              ) : (
                backups.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-800">
                      {item.filename || item.backupId}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {item.sizeBytes ? `${Math.round(item.sizeBytes / 1024)} KB` : "—"}
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-500">
                      {item.sha256Checksum ? `${item.sha256Checksum.substring(0, 12)}...` : "Verified"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-slate-100 text-slate-700">
                        {item.triggeredBy || "manual"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {item.createdAt ? new Date(item.createdAt).toLocaleString() : "—"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleInitiateRestore(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                      >
                        <RotateCcw size={11} />
                        <span>Restore...</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Safe Restore Modal */}
      {selectedBackupForRestore && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <RotateCcw size={16} className="text-amber-600" />
                <span>Disaster Recovery Restore Simulation</span>
              </h3>
              <button
                onClick={() => setSelectedBackupForRestore(null)}
                className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                Target Archive: <strong className="font-mono">{selectedBackupForRestore.filename}</strong>
              </p>

              {restoring && (
                <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-600 flex items-center justify-center gap-2">
                  <RefreshCw size={14} className="animate-spin text-blue-600" />
                  <span>Decrypting and validating integrity...</span>
                </div>
              )}

              {restorePreview && (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px]">
                    <div className="font-bold flex items-center gap-1.5">
                      <FileCheck2 size={14} /> Cryptographic SHA-256 Checksum Verified
                    </div>
                    <div className="text-[10px] mt-1 text-emerald-700">
                      Dry-run verification completed. No live database changes have occurred.
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl">
                    <span className="font-semibold text-slate-700 block mb-1">
                      Collections to be Restored:
                    </span>
                    <div className="grid grid-cols-2 gap-1 text-[11px] font-mono">
                      {Object.entries(restorePreview.collectionsToRestore).map(([col, count]) => (
                        <div key={col} className="flex justify-between border-b border-slate-200/60 py-0.5">
                          <span className="text-slate-600">{col}:</span>
                          <strong className="text-slate-900">{count} docs</strong>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 text-[11px] text-slate-600">
                      Supabase Storage Files: <strong>{restorePreview.filesToRestore} files</strong>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] space-y-1">
                    <div className="font-bold flex items-center gap-1">
                      <AlertTriangle size={14} className="text-amber-700" /> Warning: Live Restoration
                    </div>
                    <p className="text-[10px] text-amber-800">
                      Executing restore will merge records from this archive into Firestore. Make sure you intend to apply this disaster recovery restore.
                    </p>
                  </div>

                  {restoreSuccessMsg ? (
                    <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-semibold">
                      {restoreSuccessMsg}
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setSelectedBackupForRestore(null)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleConfirmLiveRestore}
                        disabled={restoring}
                        className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold cursor-pointer disabled:opacity-50"
                      >
                        {restoring ? "Restoring..." : "Confirm & Execute Live Restore"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminBackupPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
          Loading cloud backup console...
        </div>
      }
    >
      <AdminBackupContent />
    </Suspense>
  );
}

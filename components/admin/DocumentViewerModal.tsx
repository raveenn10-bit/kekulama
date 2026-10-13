"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  ExternalLink, 
  FileText, 
  RefreshCw,
  Loader2 
} from "lucide-react";
import { FirestoreGuestDocument } from "@/types/document";
import { auth } from "@/lib/firebase/client";
import { useAdminAuth } from "@/components/admin/AdminAuthContext";

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId?: string;
  documentId?: string;
  isOwner: boolean;
  onStatusChange?: () => void;
}

export function DocumentViewerModal({
  isOpen,
  onClose,
  bookingId,
  documentId: initialDocumentId,
  isOwner,
  onStatusChange,
}: DocumentViewerModalProps) {
  const { getIdToken } = useAdminAuth();
  const [documents, setDocuments] = useState<FirestoreGuestDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<FirestoreGuestDocument | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(300);
  const [rejectionModalOpen, setRejectionModalOpen] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Load documents on open
  useEffect(() => {
    if (!isOpen) {
      setDocuments([]);
      setSelectedDoc(null);
      setSignedUrl(null);
      return;
    }

    async function loadDocuments() {
      setLoading(true);
      setErrorMessage("");
      try {
        const idToken = (await getIdToken()) || (auth.currentUser ? await auth.currentUser.getIdToken() : "");
        const headers: Record<string, string> = {};
        if (idToken) headers["Authorization"] = `Bearer ${idToken}`;

        if (initialDocumentId) {
          const res = await fetch(`/api/admin/documents/${initialDocumentId}`, { headers });
          const data = await res.json();
          if (data.success && data.document) {
            setDocuments([data.document]);
            setSelectedDoc(data.document);
            setSignedUrl(data.signedUrl);
            setCountdown(data.expiresInSeconds || 300);
          } else {
            setErrorMessage(data.error || "Failed to load document");
          }
        } else if (bookingId) {
          const res = await fetch(`/api/admin/documents?bookingId=${bookingId}`, { headers });
          const data = await res.json();
          if (data.success && data.documents) {
            setDocuments(data.documents);
            if (data.documents.length > 0) {
              fetchSignedUrl(data.documents[0].documentId, headers);
            }
          } else {
            setErrorMessage(data.error || "No documents found for this reservation");
          }
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Network error loading documents");
      } finally {
        setLoading(false);
      }
    }

    loadDocuments();
  }, [isOpen, bookingId, initialDocumentId]);

  // Fetch signed URL for specific document
  async function fetchSignedUrl(docId: string, customHeaders?: Record<string, string>) {
    setLoading(true);
    try {
      const idToken = (await getIdToken()) || (auth.currentUser ? await auth.currentUser.getIdToken() : "");
      const headers: Record<string, string> = customHeaders || {};
      if (idToken && !headers["Authorization"]) headers["Authorization"] = `Bearer ${idToken}`;

      const res = await fetch(`/api/admin/documents/${docId}`, { headers });
      const data = await res.json();
      if (data.success && data.document) {
        setSelectedDoc(data.document);
        setSignedUrl(data.signedUrl);
        setCountdown(data.expiresInSeconds || 300);
      } else {
        setErrorMessage(data.error || "Failed to generate private view link");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Error generating document view link");
    } finally {
      setLoading(false);
    }
  }

  // 5-minute signed URL countdown timer
  useEffect(() => {
    if (!signedUrl || countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [signedUrl, countdown]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleVerify = async (status: "verified" | "rejected", reason?: string) => {
    if (!selectedDoc) return;
    setActionLoading(true);
    try {
      const idToken = auth.currentUser ? await auth.currentUser.getIdToken() : "";
      const res = await fetch(`/api/admin/documents/${selectedDoc.documentId}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({
          status,
          rejectionReason: reason || "",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSelectedDoc((prev) => prev ? { ...prev, verificationStatus: status, rejectionReason: reason } : null);
        setDocuments((prev) =>
          prev.map((d) =>
            d.documentId === selectedDoc.documentId
              ? { ...d, verificationStatus: status, rejectionReason: reason }
              : d
          )
        );
        setRejectionModalOpen(false);
        setRejectionReason("");
        if (onStatusChange) onStatusChange();
      } else {
        alert(data.error || "Failed to update verification status");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDoc) return;
    if (!confirm("Are you sure you want to permanently delete this document from private storage? This action is logged.")) {
      return;
    }

    setActionLoading(true);
    try {
      const idToken = auth.currentUser ? await auth.currentUser.getIdToken() : "";
      const res = await fetch(`/api/admin/documents/${selectedDoc.documentId}/delete`, {
        method: "POST",
        headers: {
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
      });

      const data = await res.json();
      if (data.success) {
        const remaining = documents.filter((d) => d.documentId !== selectedDoc.documentId);
        setDocuments(remaining);
        if (remaining.length > 0) {
          setSelectedDoc(remaining[0]);
          fetchSignedUrl(remaining[0].documentId);
        } else {
          setSelectedDoc(null);
          setSignedUrl(null);
        }
        if (onStatusChange) onStatusChange();
      } else {
        alert(data.error || "Failed to delete document");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Secure Guest Document Vault
              </h3>
              <p className="text-xs text-slate-500">
                Private Supabase Storage • AES Encrypted Links • Authenticated Access Only
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="text-sm font-medium text-slate-600">Retrieving encrypted private document...</p>
            </div>
          ) : errorMessage ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="font-medium text-slate-700">No documents uploaded for this guest</p>
              <p className="text-xs text-slate-400 mt-1">Send a registration link to request NIC/Passport verification.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Document Tabs / List */}
              <div className="space-y-2 md:border-r md:border-slate-200 md:pr-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Attached Documents</span>
                {documents.map((doc) => {
                  const isSelected = selectedDoc?.documentId === doc.documentId;
                  return (
                    <button
                      key={doc.documentId}
                      onClick={() => fetchSignedUrl(doc.documentId)}
                      className={`w-full text-left p-3 rounded-xl border text-sm transition-all flex flex-col space-y-1 ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50/50 text-emerald-950 font-semibold shadow-sm"
                          : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="capitalize">{doc.documentType.replace("_", " ")}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            doc.verificationStatus === "verified"
                              ? "bg-emerald-100 text-emerald-800"
                              : doc.verificationStatus === "rejected"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {doc.verificationStatus}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-normal">
                        Size: {Math.round(doc.fileSize / 1024)} KB
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Document Preview & Details */}
              <div className="md:col-span-2 space-y-4">
                {selectedDoc && (
                  <>
                    {/* Security Ribbon */}
                    <div className="flex items-center justify-between bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-emerald-400" />
                        <span>Link expires in: </span>
                        <span className="font-mono font-bold text-emerald-400">
                          {formatCountdown(countdown)}
                        </span>
                      </div>
                      {countdown === 0 ? (
                        <button
                          onClick={() => fetchSignedUrl(selectedDoc.documentId)}
                          className="flex items-center space-x-1 text-emerald-300 hover:text-emerald-100 underline"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Renew Link</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400">Private Bucket: guest-private-documents</span>
                      )}
                    </div>

                    {/* Preview Box */}
                    <div className="relative rounded-xl border border-slate-200 bg-slate-100 overflow-hidden min-h-[280px] flex items-center justify-center">
                      {countdown === 0 ? (
                        <div className="text-center p-6 space-y-2">
                          <Clock className="w-8 h-8 text-amber-500 mx-auto" />
                          <p className="text-sm font-semibold text-slate-700">Signed URL Expired</p>
                          <p className="text-xs text-slate-500">For security, private links expire in 5 minutes.</p>
                          <button
                            onClick={() => fetchSignedUrl(selectedDoc.documentId)}
                            className="mt-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                          >
                            Generate Fresh Link
                          </button>
                        </div>
                      ) : signedUrl ? (
                        selectedDoc.mimeType === "application/pdf" ? (
                          <iframe src={signedUrl} className="w-full h-80 rounded-xl" title="PDF Preview" />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={signedUrl}
                            alt={selectedDoc.documentType}
                            className="max-h-96 w-auto object-contain mx-auto rounded-lg shadow-sm"
                          />
                        )
                      ) : (
                        <p className="text-xs text-slate-400">No preview available</p>
                      )}
                    </div>

                    {/* Document Meta Information */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5 text-slate-600">
                      <div className="flex justify-between">
                        <span className="font-semibold text-slate-700">Uploaded At:</span>
                        <span>{new Date(selectedDoc.uploadedAt).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-slate-700">Uploaded By:</span>
                        <span>{selectedDoc.uploadedBy}</span>
                      </div>
                      {selectedDoc.verifiedBy && (
                        <div className="flex justify-between">
                          <span className="font-semibold text-slate-700">Verified By:</span>
                          <span className="text-emerald-700 font-medium">{selectedDoc.verifiedBy}</span>
                        </div>
                      )}
                      {selectedDoc.rejectionReason && (
                        <div className="flex justify-between">
                          <span className="font-semibold text-rose-700">Rejection Reason:</span>
                          <span className="text-rose-700">{selectedDoc.rejectionReason}</span>
                        </div>
                      )}
                    </div>

                    {/* Owner Action Buttons */}
                    {isOwner && (
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                        <div className="flex items-center space-x-2">
                          {selectedDoc.verificationStatus !== "verified" && (
                            <button
                              disabled={actionLoading}
                              onClick={() => handleVerify("verified")}
                              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Verify & Approve</span>
                            </button>
                          )}
                          {selectedDoc.verificationStatus !== "rejected" && (
                            <button
                              disabled={actionLoading}
                              onClick={() => setRejectionModalOpen(true)}
                              className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                            >
                              <ShieldAlert className="w-4 h-4" />
                              <span>Reject</span>
                            </button>
                          )}
                        </div>

                        <button
                          disabled={actionLoading}
                          onClick={handleDelete}
                          className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete Document</span>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Rejection Reason Modal */}
        {rejectionModalOpen && (
          <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-5 max-w-md w-full space-y-4">
              <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Specify Rejection Reason</span>
              </h4>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Unclear blurry photo, Name does not match reservation, Expired document..."
                className="w-full text-xs p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                rows={3}
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setRejectionModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleVerify("rejected", rejectionReason)}
                  className="px-3 py-1.5 text-xs bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

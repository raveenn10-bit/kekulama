"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  Camera,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  Lock,
  RefreshCw,
  X,
  Hotel,
} from "lucide-react";
import { doc, getDoc, updateDoc, collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase/client";
import { GuestRegistrationToken } from "@/types/guest";
import { Booking } from "@/types/booking";
import { compressImage } from "@/lib/guest/imageCompressor";

function GuestRegistrationContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [tokenData, setTokenData] = useState<GuestRegistrationToken | null>(null);
  const [bookingData, setBookingData] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [nationality, setNationality] = useState("Sri Lankan");
  const [address, setAddress] = useState("");
  const [idType, setIdType] = useState<"nic" | "passport">("nic");
  const [idNumber, setIdNumber] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  // Files & Previews
  const [nicFrontFile, setNicFrontFile] = useState<Blob | null>(null);
  const [nicFrontPreview, setNicFrontPreview] = useState<string | null>(null);
  const [nicBackFile, setNicBackFile] = useState<Blob | null>(null);
  const [nicBackPreview, setNicBackPreview] = useState<string | null>(null);

  // Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<"front" | "back">("front");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function verifyToken() {
      if (!token) {
        setError("Missing registration token. Please check the link provided in your booking confirmation.");
        setLoading(false);
        return;
      }

      try {
        const tokenRef = doc(db, "registration_tokens", token);
        const tokenSnap = await getDoc(tokenRef);

        if (!tokenSnap.exists()) {
          setError("Invalid registration token. Please contact Kekulama Eco Cabana.");
          setLoading(false);
          return;
        }

        const tData = tokenSnap.data() as GuestRegistrationToken;
        if (new Date(tData.expiresAt).getTime() < Date.now()) {
          setError("This registration link has expired (48-hour limit). Please request a fresh link.");
          setLoading(false);
          return;
        }

        setTokenData(tData);

        // Fetch associated booking
        const bookingRef = doc(db, "bookings", tData.bookingId);
        const bookingSnap = await getDoc(bookingRef);
        if (bookingSnap.exists()) {
          const bData = bookingSnap.data() as Booking;
          setBookingData(bData);
          setFullName(bData.guestName || "");
        }

        setLoading(false);
      } catch (err: any) {
        console.error(err);
        setError("Error validating registration credentials.");
        setLoading(false);
      }
    }

    verifyToken();
  }, [token]);

  // Handle File Input Selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, target: "front" | "back") => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file, 1600, 0.82);
      const previewUrl = URL.createObjectURL(compressed);

      if (target === "front") {
        setNicFrontFile(compressed);
        setNicFrontPreview(previewUrl);
      } else {
        setNicBackFile(compressed);
        setNicBackPreview(previewUrl);
      }
    } catch {
      alert("Failed to process image. Please try a different photograph.");
    }
  };

  // Start Camera
  const startCamera = async (target: "front" | "back") => {
    setCameraTarget(target);
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error(err);
      alert("Unable to access camera. Please allow camera permissions in your browser or select a file from gallery.");
      setIsCameraOpen(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const previewUrl = URL.createObjectURL(blob);
          if (cameraTarget === "front") {
            setNicFrontFile(blob);
            setNicFrontPreview(previewUrl);
          } else {
            setNicBackFile(blob);
            setNicBackPreview(previewUrl);
          }
          stopCamera();
        }
      },
      "image/jpeg",
      0.85
    );
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    setIsCameraOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nicFrontFile) {
      alert("Please upload or capture your identification document.");
      return;
    }

    setSubmitting(true);
    try {
      const bookingId = tokenData?.bookingId || "KEK-GUEST";
      const nowIso = new Date().toISOString();
      const retentionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30-day retention

      // 1. Upload Front Document to Supabase Private Storage via Secure Server Route
      const frontFormData = new FormData();
      frontFormData.append("file", nicFrontFile, "id_front.jpg");
      frontFormData.append("token", token!);
      frontFormData.append("docType", idType === "nic" ? "nic_front" : "passport_page");

      const frontUploadRes = await fetch("/api/guest/documents/upload", {
        method: "POST",
        body: frontFormData,
      });

      if (!frontUploadRes.ok) {
        const errJson = await frontUploadRes.json();
        throw new Error(errJson.error || "Failed to upload identification document.");
      }

      // 2. Upload Back Document if present (for NIC)
      if (nicBackFile) {
        const backFormData = new FormData();
        backFormData.append("file", nicBackFile, "id_back.jpg");
        backFormData.append("token", token!);
        backFormData.append("docType", "nic_back");

        const backUploadRes = await fetch("/api/guest/documents/upload", {
          method: "POST",
          body: backFormData,
        });

        if (!backUploadRes.ok) {
          const errJson = await backUploadRes.json();
          throw new Error(errJson.error || "Failed to upload back side of identification document.");
        }
      }

      // 4. Update Booking details
      if (tokenData?.bookingId) {
        await updateDoc(doc(db, "bookings", tokenData.bookingId), {
          isRegistered: true,
          status: "registered",
          guestName: fullName,
          nationality,
          address,
          idType,
          idNumber,
          specialRequests: specialRequests || "",
          updatedAt: nowIso,
        });

        // 5. Mark Token as Used
        await updateDoc(doc(db, "registration_tokens", token!), {
          status: "used",
          usedAt: nowIso,
        });
      }

      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      alert("Failed to submit registration documents. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Validating Secure Registration Token...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Registration Link Invalid</h2>
          <p className="text-xs text-slate-500 leading-relaxed">{error}</p>
          <a
            href="/"
            className="inline-block px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
          >
            Return to Homepage
          </a>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 size={36} />
          </div>
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest block">
            Registration Verified
          </span>
          <h2 className="text-2xl font-bold text-slate-900">Ayubowan, {fullName}!</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your identification documents for reservation <strong>#{bookingData?.id}</strong> have been securely uploaded and submitted for Owner review.
          </p>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-left space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Cabana:</span>
              <span className="font-bold text-slate-800">A-Frame Eco Cabana</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Check-in:</span>
              <span className="font-bold text-slate-800">{bookingData?.checkIn} (2:00 PM)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Check-out:</span>
              <span className="font-bold text-slate-800">{bookingData?.checkOut} (10:00 AM)</span>
            </div>
          </div>

          <a
            href="/"
            className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider block transition-all"
          >
            Explore Kekulama Experiences
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center mx-auto shadow-sm mb-2">
            <Hotel size={20} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Kekulama Eco Cabana</h1>
          <p className="text-xs text-slate-500 font-medium">
            Guest Self-Registration & Identity Document Portal
          </p>
        </div>

        {/* Stay Summary Card */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Reservation Reference
            </span>
            <span className="font-mono font-bold text-slate-900 text-sm">#{bookingData?.id}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Dates of Stay
            </span>
            <span className="font-semibold text-slate-800">
              {bookingData?.checkIn} &rarr; {bookingData?.checkOut}
            </span>
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-xs">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center gap-1.5">
              <User size={14} className="text-emerald-600" />
              <span>1. Guest Profile Information</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="As shown in NIC or Passport"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 text-slate-900 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nationality *</label>
                  <input
                    type="text"
                    required
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 text-slate-900 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Document Type *</label>
                  <select
                    value={idType}
                    onChange={(e) => setIdType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 text-slate-900 text-xs"
                  >
                    <option value="nic">Sri Lankan National ID (NIC)</option>
                    <option value="passport">International Passport</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {idType === "nic" ? "NIC Number *" : "Passport Number *"}
                </label>
                <input
                  type="text"
                  required
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder={idType === "nic" ? "e.g. 199512345678 or 951234567V" : "e.g. N1234567"}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 text-slate-900 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Permanent Address *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="City, Country"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 text-slate-900 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 2: ID Upload / Camera Capture */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center gap-1.5">
              <Camera size={14} className="text-emerald-600" />
              <span>2. Identification Document Verification</span>
            </h3>

            <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
              Please take a clear photo or upload an image of your {idType === "nic" ? "National ID Card" : "Passport photo page"}. All documents are encrypted and kept strictly confidential.
            </p>

            <div className="space-y-4">
              {/* Front or Main Document */}
              <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-3">
                <span className="text-xs font-bold text-slate-800 block">
                  {idType === "nic" ? "NIC Front Side *" : "Passport Photo Page *"}
                </span>

                {nicFrontPreview ? (
                  <div className="relative inline-block">
                    <img
                      src={nicFrontPreview}
                      alt="Front Document"
                      className="max-h-40 rounded-xl border border-slate-200 mx-auto object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setNicFrontFile(null);
                        setNicFrontPreview(null);
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-rose-600 text-white rounded-full flex items-center justify-center text-xs shadow-sm cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 justify-center pt-2">
                    <button
                      type="button"
                      onClick={() => startCamera("front")}
                      className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-semibold text-xs cursor-pointer"
                    >
                      <Camera size={14} />
                      <span>Take Photo</span>
                    </button>

                    <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs cursor-pointer">
                      <UploadCloud size={14} />
                      <span>Upload File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelect(e, "front")}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Back side if NIC */}
              {idType === "nic" && (
                <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-3">
                  <span className="text-xs font-bold text-slate-800 block">NIC Back Side (Optional)</span>

                  {nicBackPreview ? (
                    <div className="relative inline-block">
                      <img
                        src={nicBackPreview}
                        alt="Back Document"
                        className="max-h-40 rounded-xl border border-slate-200 mx-auto object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setNicBackFile(null);
                          setNicBackPreview(null);
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-rose-600 text-white rounded-full flex items-center justify-center text-xs shadow-sm cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 justify-center pt-2">
                      <button
                        type="button"
                        onClick={() => startCamera("back")}
                        className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs cursor-pointer"
                      >
                        <Camera size={14} />
                        <span>Take Photo</span>
                      </button>

                      <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs cursor-pointer">
                        <UploadCloud size={14} />
                        <span>Upload File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileSelect(e, "back")}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl text-[11px] text-slate-500 leading-relaxed flex items-start gap-2">
            <Lock size={14} className="shrink-0 mt-0.5 text-slate-400" />
            <span>
              Your documents are transferred over 256-bit TLS encryption and stored in a private vault accessible only by the verified property owner. Identity images are automatically purged 30 days following checkout.
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Encrypting & Submitting Registration...</span>
              </>
            ) : (
              <span>Complete Verification & Submit</span>
            )}
          </button>
        </form>
      </div>

      {/* In-Browser Camera Capture Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-between p-4">
          <div className="w-full flex items-center justify-between text-white max-w-md pt-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Capture {cameraTarget === "front" ? "Front Side" : "Back Side"}
            </span>
            <button onClick={stopCamera} className="p-1 rounded-lg text-white/80 hover:text-white">
              ✕
            </button>
          </div>

          <div className="relative w-full max-w-md aspect-3/4 rounded-2xl overflow-hidden border border-white/20 bg-black flex items-center justify-center">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            {/* Document Guide Frame */}
            <div className="absolute inset-8 border-2 border-emerald-400/80 rounded-xl pointer-events-none" />
          </div>

          <div className="w-full max-w-md pb-6 flex items-center justify-center gap-4">
            <button
              onClick={capturePhoto}
              className="w-16 h-16 rounded-full bg-white text-slate-900 border-4 border-slate-300 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
              <Camera size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GuestRegistrationPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <div className="text-white text-sm font-medium animate-pulse">Loading registration portal...</div>
        </div>
      }
    >
      <GuestRegistrationContent />
    </React.Suspense>
  );
}

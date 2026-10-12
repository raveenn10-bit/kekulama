import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/security/auth";
import { verifyRegistrationToken, verifyFirebaseSessionOrToken } from "@/lib/security/authBridge";
import { validateFile, generateObjectPath, generatePaymentReceiptPath, uploadPrivateDocument } from "@/lib/supabase/storage";
import { adminDb, logAuditEvent } from "@/lib/firebase/admin";
import { DocumentType, FirestoreGuestDocument } from "@/types/document";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting Check
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const limitCheck = checkRateLimit(`upload-${ip}`, { maxRequests: 20, windowMs: 60 * 1000 });
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { error: "Too many upload requests. Please wait a minute before trying again." },
        { status: 429 }
      );
    }

    // 2. Parse Multipart Form Data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const token = formData.get("token") as string | null;
    const docType = formData.get("docType") as DocumentType | null;
    const bookingIdFromForm = formData.get("bookingId") as string | null;
    const paymentIdFromForm = formData.get("paymentId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "Missing file payload" }, { status: 400 });
    }

    if (!docType || !["nic_front", "nic_back", "passport_page", "payment_receipt"].includes(docType)) {
      return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
    }

    // 3. Authorization Bridge: Must be authorized either via valid single-use registration token OR Staff/Owner Firebase auth
    let authorizedBookingId = "";
    let uploaderIdentity = "anonymous";

    if (token) {
      // Guest self-registration flow with single-use token
      const tokenData = await verifyRegistrationToken(token);
      if (!tokenData) {
        return NextResponse.json(
          { error: "Invalid, expired, or completed registration token." },
          { status: 403 }
        );
      }
      authorizedBookingId = tokenData.bookingId;
      uploaderIdentity = `guest:${tokenData.guestName} (token:${token.slice(0, 8)}...)`;
    } else {
      // Authenticated staff or owner flow
      const authUser = await verifyFirebaseSessionOrToken(req);
      if (!authUser) {
        return NextResponse.json(
          { error: "Unauthorized. Valid token or authenticated session is required." },
          { status: 401 }
        );
      }
      if (!bookingIdFromForm && !paymentIdFromForm) {
        return NextResponse.json(
          { error: "bookingId or paymentId is required for staff uploads." },
          { status: 400 }
        );
      }
      authorizedBookingId = bookingIdFromForm || "payment-attachment";
      uploaderIdentity = `staff:${authUser.email} (${authUser.role})`;
    }

    // 4. Read File Buffer & Validate Size, MIME, and Magic Bytes
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const validation = validateFile({
      buffer,
      mimeType: file.type,
      size: file.size,
    });

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Determine extension safely
    const ext = file.name.split(".").pop()?.toLowerCase() || (file.type === "application/pdf" ? "pdf" : "jpg");

    // 5. Generate Unguessable Path & Upload to Supabase Private Bucket
    let storagePath = "";
    if (docType === "payment_receipt" && paymentIdFromForm) {
      storagePath = generatePaymentReceiptPath({
        paymentId: paymentIdFromForm,
        extension: ext,
      });
    } else {
      storagePath = generateObjectPath({
        guestId: authorizedBookingId,
        docType,
        extension: ext,
      });
    }

    const uploadRes = await uploadPrivateDocument({
      path: storagePath,
      buffer,
      mimeType: file.type,
    });

    if (uploadRes.error) {
      return NextResponse.json(
        { error: `Storage upload failed: ${uploadRes.error}` },
        { status: 500 }
      );
    }

    // 6. Write Document Metadata into Firestore 'guestDocuments'
    const documentId = `doc_${crypto.randomUUID()}`;
    const retentionDate = new Date();
    retentionDate.setFullYear(retentionDate.getFullYear() + 1); // 1-year retention

    const docMetadata: FirestoreGuestDocument = {
      documentId,
      guestId: authorizedBookingId,
      bookingId: authorizedBookingId,
      documentType: docType,
      storageProvider: "supabase",
      bucketName: "guest-private-documents",
      privateStoragePath: storagePath,
      mimeType: file.type,
      fileSize: file.size,
      verificationStatus: "pending",
      uploadedBy: uploaderIdentity,
      uploadedAt: new Date().toISOString(),
      retentionUntil: retentionDate.toISOString(),
    };

    await adminDb.collection("guestDocuments").doc(documentId).set(docMetadata);

    // 7. Audit Logging
    await logAuditEvent({
      actorId: uploaderIdentity,
      actorEmail: uploaderIdentity,
      actorRole: token ? "guest" : "reception",
      action: "DOCUMENT_UPLOADED",
      targetResource: `guestDocuments/${documentId}`,
      details: {
        documentType: docType,
        path: storagePath,
        bookingId: authorizedBookingId,
        size: file.size,
      },
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      documentId,
      documentType: docType,
      path: storagePath,
      verificationStatus: "pending",
    });
  } catch (error: any) {
    console.error("[UPLOAD API ERROR]", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during upload" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { requireOwner } from "@/lib/security/authBridge";
import { adminDb, logAuditEvent } from "@/lib/firebase/admin";
import { deletePrivateDocument } from "@/lib/supabase/storage";
import { FirestoreGuestDocument } from "@/types/document";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleDelete(req, params.id);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleDelete(req, params.id);
}

async function handleDelete(req: NextRequest, documentId: string) {
  try {
    // 1. Authorization: Only verified Owners can delete guest documents
    const owner = await requireOwner(req);
    if (!owner) {
      return NextResponse.json(
        { error: "Forbidden: Only confirmed Owners are authorized to delete guest documents." },
        { status: 403 }
      );
    }

    if (!documentId) {
      return NextResponse.json({ error: "Missing document ID." }, { status: 400 });
    }

    const docRef = adminDb.collection("guestDocuments").doc(documentId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    const docData = docSnap.data() as FirestoreGuestDocument;

    // 2. Delete file from Supabase Private Storage
    const deleteRes = await deletePrivateDocument(docData.privateStoragePath);
    if (!deleteRes.success) {
      console.warn("[DOCUMENT DELETE WARNING] Could not remove file from storage:", deleteRes.error);
    }

    // 3. Delete metadata record from Firestore
    await docRef.delete();

    // 4. Audit Log
    await logAuditEvent({
      actorId: owner.uid,
      actorEmail: owner.email,
      actorRole: "owner",
      action: "DOCUMENT_DELETED",
      targetResource: `guestDocuments/${documentId}`,
      details: {
        documentType: docData.documentType,
        bookingId: docData.bookingId,
        privateStoragePath: docData.privateStoragePath,
      },
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      documentId,
      message: "Document successfully deleted from private storage and database.",
    });
  } catch (error: any) {
    console.error("[DOCUMENT DELETE API ERROR]", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

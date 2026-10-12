export type DocumentType = 'nic_front' | 'nic_back' | 'passport_page' | 'payment_receipt';

export type DocVerificationStatus = 'pending' | 'verified' | 'rejected';

export interface FirestoreGuestDocument {
  documentId: string;
  guestId: string;
  bookingId: string;
  documentType: DocumentType;
  storageProvider: 'supabase';
  bucketName: 'guest-private-documents';
  privateStoragePath: string;
  mimeType: string;
  fileSize: number;
  verificationStatus: DocVerificationStatus;
  uploadedBy: string;
  uploadedAt: string;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  retentionUntil: string;
}

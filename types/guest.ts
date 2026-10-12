export type IdDocumentType =
  | "nic_front"
  | "nic_back"
  | "passport_page"
  | "optional_photo";

export type DocumentVerificationStatus = "pending" | "verified" | "rejected";

export interface GuestDocument {
  id: string;
  bookingId: string;
  guestId?: string;
  docType: IdDocumentType;
  storagePath: string; // private path in Firebase Storage
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  verificationStatus: DocumentVerificationStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  uploadedAt: string;
  retentionExpiresAt: string; // ISO date for automatic document purge
}

export interface GuestRegistrationToken {
  token: string; // 32-char hex token
  bookingId: string;
  guestEmail: string;
  guestPhone: string;
  status: "active" | "used" | "expired";
  expiresAt: string; // ISO date (48 hours from generation)
  usedAt?: string;
  createdAt: string;
}

export interface GuestProfile {
  id: string; // guest unique id
  fullName: string;
  email: string;
  phone: string;
  nationality: string;
  address?: string;
  idType: "nic" | "passport";
  idNumber: string;
  totalVisits: number;
  lastVisitDate?: string;
  bookingHistory: string[]; // array of booking IDs
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

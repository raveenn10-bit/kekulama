export type UserRole = "owner" | "reception";

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  isActive: boolean;
  phone?: string;
  mfaEnabled?: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface SessionPayload {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
}

export type AuditAction =
  | "USER_LOGIN"
  | "USER_LOGOUT"
  | "STAFF_CREATED"
  | "STAFF_UPDATED"
  | "STAFF_DEACTIVATED"
  | "BOOKING_CREATED"
  | "BOOKING_MODIFIED"
  | "BOOKING_CONFIRMED"
  | "BOOKING_CANCELLED"
  | "CHECK_IN"
  | "CHECK_OUT"
  | "GUEST_REGISTERED"
  | "DOCUMENT_VIEWED"
  | "DOCUMENT_ACCESSED"
  | "DOCUMENT_UPLOADED"
  | "DOCUMENT_VERIFIED"
  | "DOCUMENT_REJECTED"
  | "DOCUMENT_DELETED"
  | "DOCUMENT_PURGED"
  | "PAYMENT_RECORDED"
  | "PAYMENT_CONFIRMED"
  | "PAYMENT_REVERSED"
  | "BACKUP_TRIGGERED"
  | "BACKUP_RESTORED"
  | "SETTINGS_CHANGED";

export interface AuditLogEntry {
  id?: string;
  actorId: string;
  actorEmail?: string;
  actorRole: UserRole | "guest" | "system";
  action: AuditAction;
  targetResource: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

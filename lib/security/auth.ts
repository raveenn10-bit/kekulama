import crypto from "crypto";
import { UserRole, AuditLogEntry } from "@/types/admin";

/**
 * Sliding-window rate limiter per client IP
 */
const rateLimitStore = new Map<string, number[]>();

export interface RateLimitOptions {
  windowMs?: number;
  maxRequests?: number;
}

export function checkRateLimit(
  ip: string,
  options: RateLimitOptions = {}
): { allowed: boolean; remaining: number } {
  const windowMs = options.windowMs || 60 * 1000; // default 1 min
  const maxRequests = options.maxRequests || 30; // default 30 req/min
  const now = Date.now();

  const timestamps = rateLimitStore.get(ip) || [];
  const validTimestamps = timestamps.filter((t) => now - t < windowMs);

  if (validTimestamps.length >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  validTimestamps.push(now);
  rateLimitStore.set(ip, validTimestamps);
  return { allowed: true, remaining: maxRequests - validTimestamps.length };
}

/**
 * Generates a cryptographically secure 32-character hex registration token
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(16).toString("hex");
}

/**
 * Validates role-based permission
 */
export function hasPermission(
  userRole: UserRole | undefined,
  requiredRole: UserRole | UserRole[]
): boolean {
  if (!userRole) return false;
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole);
  }
  return userRole === requiredRole;
}

/**
 * Permission Matrix definition for server enforcement
 */
export const ROLE_PERMISSIONS: Record<string, UserRole[]> = {
  VIEW_DASHBOARD: ["owner", "reception"],
  VIEW_CALENDAR: ["owner", "reception"],
  MANAGE_BOOKINGS: ["owner", "reception"],
  MANAGE_CHECKIN: ["owner", "reception"],
  VIEW_GUESTS: ["owner", "reception"],
  RECORD_PAYMENT: ["owner", "reception"],
  CONFIRM_PAYMENT: ["owner"],
  REVERSE_PAYMENT: ["owner"],
  VIEW_FINANCIAL_REPORTS: ["owner"],
  VIEW_IDENTITY_DOCUMENTS: ["owner"],
  MANAGE_STAFF: ["owner"],
  MANAGE_BACKUPS: ["owner"],
  CHANGE_SETTINGS: ["owner"],
};

export function canPerform(action: keyof typeof ROLE_PERMISSIONS, role: UserRole): boolean {
  const allowedRoles = ROLE_PERMISSIONS[action];
  return allowedRoles ? allowedRoles.includes(role) : false;
}

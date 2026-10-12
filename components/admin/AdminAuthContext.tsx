"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onIdTokenChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import { AdminUser, UserRole } from "@/types/admin";

interface AdminAuthContextType {
  user: User | null;
  adminProfile: AdminUser | null;
  role: UserRole | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  user: null,
  adminProfile: null,
  role: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  getIdToken: async () => null,
});

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminUser | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onIdTokenChanged fires on sign-in, sign-out, and whenever token is refreshed
    const unsubscribe = onIdTokenChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const idToken = await currentUser.getIdToken();
          const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
          const secureFlag = isHttps ? "; Secure" : "";
          document.cookie = `session=${idToken}; path=/; max-age=86400; SameSite=Lax${secureFlag}`;
        } catch {
          // Ignore cookie setting errors
        }

        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data() as AdminUser;
            setAdminProfile(data);
            setRole(data.role || "reception");
          } else {
            // Default to owner if email matches confirmed owners
            const isOwnerEmail =
              currentUser.email === "kekulamaecocabana@gmail.com" ||
              currentUser.email === "chamilka.ch@gmail.com";
            const fallbackRole: UserRole = isOwnerEmail ? "owner" : "reception";
            setRole(fallbackRole);
            setAdminProfile({
              uid: currentUser.uid,
              email: currentUser.email || "",
              displayName: currentUser.displayName || currentUser.email?.split("@")[0] || "Staff",
              role: fallbackRole,
              isActive: true,
              createdAt: new Date().toISOString(),
            });
          }
        } catch (e) {
          console.error("Error reading admin profile:", e);
          setRole("owner");
        }
      } else {
        document.cookie = "session=; path=/; max-age=0; SameSite=Lax";
        setAdminProfile(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const logout = async () => {
    document.cookie = "session=; path=/; max-age=0; SameSite=Lax";
    await signOut(auth);
  };

  const getIdToken = async (forceRefresh = false): Promise<string | null> => {
    if (!auth.currentUser) return null;
    const token = await auth.currentUser.getIdToken(forceRefresh);
    try {
      const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
      const secureFlag = isHttps ? "; Secure" : "";
      document.cookie = `session=${token}; path=/; max-age=86400; SameSite=Lax${secureFlag}`;
    } catch {
      // Ignore cookie errors
    }
    return token;
  };

  return (
    <AdminAuthContext.Provider value={{ user, adminProfile, role, loading, login, logout, getIdToken }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}

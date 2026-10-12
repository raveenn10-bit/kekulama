"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
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
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  user: null,
  adminProfile: null,
  role: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminUser | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const idToken = await currentUser.getIdToken();
          document.cookie = `session=${idToken}; path=/; max-age=3600; SameSite=Lax`;
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

  return (
    <AdminAuthContext.Provider value={{ user, adminProfile, role, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}

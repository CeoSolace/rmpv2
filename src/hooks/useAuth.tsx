"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { account, databases, ID } from '@/lib/appwrite';
import { Profile } from '@/types';

interface AuthContextValue {
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, username: string, displayName?: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch the logged in user and associated profile document.
   */
  const fetchCurrentUser = async () => {
    try {
      const current = await account.get();
      setUser(current);
      // Fetch profile document by user ID
      const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
      const colId = process.env.NEXT_PUBLIC_APPWRITE_PROFILES_COLLECTION_ID;
      if (dbId && colId) {
        const result = await databases.getDocument(dbId, colId, current.$id);
        setProfile(result as unknown as Profile);
      }
    } catch (error) {
      // Not logged in
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await account.createEmailSession(email, password);
      await fetchCurrentUser();
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await account.deleteSession('current');
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, username: string, displayName?: string) => {
    setLoading(true);
    try {
      // Create Appwrite user
      // Normalize username to lower case to avoid duplicates with different casing
      const normalizedUsername = username.trim().toLowerCase();
      const newUser = await account.create(ID.unique(), email, password, normalizedUsername);
      // Create email session immediately after registration
      await account.createEmailSession(email, password);
      // Create profile document
      const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
      const colId = process.env.NEXT_PUBLIC_APPWRITE_PROFILES_COLLECTION_ID;
      if (dbId && colId) {
        const data: Partial<Profile> = {
          n: normalizedUsername,
          d: displayName?.trim(),
          f: 0,
          g: 0,
          ts: Date.now(),
        };
        const readPerms = ['role:all'];
        const writePerms = [`user:${newUser.$id}`];
        await databases.createDocument(dbId, colId, newUser.$id, data, readPerms, writePerms);
      }
      await fetchCurrentUser();
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    const colId = process.env.NEXT_PUBLIC_APPWRITE_PROFILES_COLLECTION_ID;
    if (dbId && colId) {
      const result = await databases.getDocument(dbId, colId, user.$id);
      setProfile(result as unknown as Profile);
    }
  };

  const value: AuthContextValue = {
    user,
    profile,
    loading,
    login,
    logout,
    register,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
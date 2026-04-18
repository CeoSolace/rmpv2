"use client";

import { ReactNode } from 'react';
import { AuthProvider } from '@/hooks/useAuth';

/**
 * Providers component wraps the application in any context providers
 * that need to persist across routes (e.g. auth, theme, modals).
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
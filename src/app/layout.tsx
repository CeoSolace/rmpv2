import './globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'RampChat',
  description: 'A hybrid chat and social platform built with Next.js, Appwrite and Cloudinary.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950 text-gray-50">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
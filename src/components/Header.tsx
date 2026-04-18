"use client";

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getCloudinaryImageUrl } from '@/lib/cloudinary';

export default function Header() {
  const { user, profile, logout } = useAuth();
  const handleLogout = async () => {
    await logout();
  };
  return (
    <header className="w-full bg-gray-900 border-b border-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-blue-500">
          RampChat
        </Link>
        <nav className="flex items-center gap-6">
          {user ? (
            <>
              <Link href="/" className="hover:text-blue-400">Home</Link>
              <Link href="/servers" className="hover:text-blue-400">Servers</Link>
              <Link href={`/profile/${user.$id}`} className="hover:text-blue-400">Profile</Link>
              <button onClick={handleLogout} className="text-red-400 hover:text-red-300">Logout</button>
              {profile?.a && (
                <img
                  src={getCloudinaryImageUrl(profile.a, { width: 32, height: 32, crop: 'fill' })}
                  alt="avatar"
                  className="h-8 w-8 rounded-full border border-gray-700"
                />
              )}
            </>
          ) : (
            <Link href="/login" className="hover:text-blue-400">Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
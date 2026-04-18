"use client";

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { account } from '@/lib/appwrite';
// import { databases } from '@/lib/appwrite';
// import { Query } from '@appwrite/client';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Server {
  $id: string;
  n: string; // name
  d?: string; // description
  a?: string; // avatar id
  p?: boolean; // is private
}

export default function ServersPage() {
  const { user } = useAuth();
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServers = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        // Create a JWT for API authentication
        const jwt = await account.createJWT();
        const res = await fetch('/api/servers', {
          headers: {
            'x-appwrite-jwt': jwt.jwt,
          },
        });
        const json = await res.json();
        setServers((json.servers || []) as Server[]);
      } catch (err) {
        console.error('Failed to fetch servers', err);
      } finally {
        setLoading(false);
      }
    };
    fetchServers();
  }, [user]);

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-4">Servers</h1>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="space-y-4">
            {servers.map((srv) => (
              <article key={srv.$id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h2 className="text-xl font-semibold">{srv.n}</h2>
                {srv.d && <p className="text-gray-400">{srv.d}</p>}
              </article>
            ))}
            {servers.length === 0 && (
              <p className="text-gray-400">You’re not a member of any servers yet.</p>
            )}
          </div>
        )}
      </main>
    </>
  );
}
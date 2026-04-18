"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Profile, Post } from '@/types';
// import { databases } from '@/lib/appwrite';
// import { Query } from '@appwrite/client';
import { getCloudinaryImageUrl } from '@/lib/cloudinary';

export default function ProfilePage() {
  const params = useParams();
  const userId = params?.id as string;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      try {
        // Fetch profile via server API to hide database details
        const resProf = await fetch(`/api/profile/${userId}`);
        const jsonProf = await resProf.json();
        setProfile(jsonProf.profile as Profile);
        // Fetch posts for this user via posts API with query parameters
        const resPosts = await fetch(`/api/posts?userId=${userId}`);
        const jsonPosts = await resPosts.json();
        setPosts((jsonPosts.posts || []) as Post[]);
      } catch (err) {
        console.error('Failed to fetch profile data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <>
        <Header />
        <LoadingSpinner />
      </>
    );
  }
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-6">
        {profile && (
          <section className="bg-gray-800 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-4">
              {profile.a && (
                <img
                  src={getCloudinaryImageUrl(profile.a, { width: 80, height: 80, crop: 'fill' })}
                  alt="avatar"
                  className="h-20 w-20 rounded-full border border-gray-700"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold">{profile.d || profile.n}</h1>
                <p className="text-gray-400">@{profile.n}</p>
                {profile.b && <p className="mt-2 text-gray-300">{profile.b}</p>}
              </div>
            </div>
          </section>
        )}
        <section className="space-y-4">
          {posts.map((post) => (
            <article key={post.$id} className="bg-gray-800 border border-gray-700 p-4 rounded-lg">
              {post.t && <p className="text-gray-200 mb-2 whitespace-pre-wrap">{post.t}</p>}
              {post.a && (
                <img
                  src={getCloudinaryImageUrl(post.a, { width: 600, height: 400, crop: 'fit' })}
                  alt="post media"
                  className="w-full rounded-md border border-gray-700"
                />
              )}
              <p className="text-xs text-gray-500 mt-2">{new Date(post.ts).toLocaleString()}</p>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}
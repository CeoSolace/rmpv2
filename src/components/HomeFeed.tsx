"use client";

import { useEffect, useState } from 'react';
// Note: we no longer import `databases` here because author profiles are
// fetched via the server API rather than querying Appwrite directly from
// the client.  This hides collection IDs and reduces client bundle size.
import { getCloudinaryImageUrl } from '@/lib/cloudinary';
import { Post, Profile } from '@/types';
import LoadingSpinner from './LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import NewPostForm from './NewPostForm';

/**
 * HomeFeed displays posts from the current user and the people they follow.  It
 * demonstrates paginated queries and minimal Appwrite reads.  This
 * implementation fetches the first 20 posts and does not subscribe to
 * realtime updates to keep costs low.
 */
export default function HomeFeed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        // Fetch posts via server API to avoid exposing collection IDs
        const res = await fetch('/api/posts');
        const json = await res.json();
        setPosts((json.posts || []) as Post[]);
      } catch (err) {
        console.error('Failed to fetch posts', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [user]);

  if (loading) return <LoadingSpinner />;
  return (
    <div className="py-6">
      {/* Show new post form at the top if user is logged in */}
      {user && <NewPostForm />}
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.$id} post={post} />
        ))}
        {posts.length === 0 && (
          <p className="text-center text-gray-400">No posts yet. Start by following someone or posting yourself!</p>
        )}
      </div>
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  const [author, setAuthor] = useState<Profile | null>(null);
  useEffect(() => {
    const fetchAuthor = async () => {
      if (!post.u) return;
      try {
        // Fetch the author's profile via the server API.  This hides
        // collection IDs from the client and ensures permissions are
        // enforced on the server.
        const res = await fetch(`/api/profile/${post.u}`);
        if (!res.ok) return;
        const json = await res.json();
        setAuthor(json.profile as Profile);
      } catch (err) {
        console.error('Failed to fetch author profile', err);
      }
    };
    fetchAuthor();
  }, [post.u]);
  return (
    <article className="bg-gray-800 border border-gray-700 p-4 rounded-lg">
      <div className="flex items-center gap-3 mb-2">
        {author?.a && (
          <img
            src={getCloudinaryImageUrl(author.a, { width: 40, height: 40, crop: 'fill' })}
            alt="avatar"
            className="h-10 w-10 rounded-full border border-gray-700"
          />
        )}
        <div>
          <p className="font-semibold text-gray-100">{author?.d || author?.n}</p>
          <p className="text-xs text-gray-400">{new Date(post.ts).toLocaleString()}</p>
        </div>
      </div>
      {post.t && <p className="text-gray-200 mb-2 whitespace-pre-wrap">{post.t}</p>}
      {post.a && (
        <img
          src={getCloudinaryImageUrl(post.a, { width: 600, height: 400, crop: 'fit' })}
          alt="post media"
          className="w-full rounded-md border border-gray-700"
        />
      )}
    </article>
  );
}
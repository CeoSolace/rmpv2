"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { account } from '@/lib/appwrite';

export default function NewPostForm() {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setStatus('submitting');
    setError(null);
    try {
      let attachmentId: string | undefined;
      // If file provided, upload to Cloudinary using unsigned upload preset; this is a placeholder
      if (file) {
        // Reject files larger than 8MB to avoid excessive usage
        const maxSize = 8 * 1024 * 1024;
        if (file.size > maxSize) {
          throw new Error('File size exceeds 8MB limit');
        }
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        if (!uploadPreset || !cloudName) {
          throw new Error('Cloudinary configuration missing');
        }
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        // Use unsigned upload; ensure your preset restricts allowed formats and sizes
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.error) {
          throw new Error(data.error.message || 'Upload failed');
        }
        attachmentId = data.public_id;
      }
      // Create JWT for server call.  Requires logged in user.
      const jwt = await account.createJWT();
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-appwrite-jwt': jwt.jwt,
        },
        body: JSON.stringify({ text, attachment: attachmentId }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to create post');
      }
      setText('');
      setFile(null);
      setStatus('success');
    } catch (err: any) {
      setError(err.message);
      setStatus('error');
    }
  };

  if (!user) return null;
  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 border border-gray-700 p-4 rounded-lg mb-6">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What's on your mind?"
        className="w-full h-24 p-2 mb-3 rounded-md bg-gray-700 border border-gray-600 text-gray-100 resize-none"
      />
      <div className="flex items-center justify-between">
        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="text-gray-300"
        />
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-md"
        >
          {status === 'submitting' ? 'Posting…' : 'Post'}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      {status === 'success' && <p className="text-green-500 text-sm mt-2">Post created!</p>}
    </form>
  );
}
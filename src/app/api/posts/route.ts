import { NextRequest, NextResponse } from 'next/server';
import { account, databases, ID } from '@/lib/appwrite';
import { Query } from '@appwrite/client';
import { logAction } from '@/server/log';

// Simple in-memory rate limiter.  Tracks number of requests per user within a
// sliding window.  Note: This resets when the server restarts and should be
// replaced with a persistent store (e.g. Redis) for production.
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;
const rateLimit = new Map<string, { count: number; lastReset: number }>();

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const record = rateLimit.get(userId);
  if (!record) {
    rateLimit.set(userId, { count: 1, lastReset: now });
    return false;
  }
  if (now - record.lastReset > RATE_LIMIT_WINDOW) {
    // Reset window
    record.count = 1;
    record.lastReset = now;
    return false;
  }
  if (record.count >= MAX_REQUESTS) {
    return true;
  }
  record.count++;
  return false;
}
import { z } from 'zod';

const createPostSchema = z.object({
  text: z.string().max(500).optional(),
  attachment: z.string().optional(),
});

export async function GET(req: NextRequest) {
  // For demonstration we proxy to Appwrite list documents, but in practice
  // you'd implement pagination and feed logic here.
  const dbId = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
  const postsId = process.env.APPWRITE_POSTS_COLLECTION_ID || process.env.NEXT_PUBLIC_APPWRITE_POSTS_COLLECTION_ID;
  if (!dbId || !postsId) {
    return NextResponse.json({ error: 'Misconfigured database or collection ID' }, { status: 500 });
  }
  // Optional query parameter to filter posts by author
  const userId = req.nextUrl.searchParams.get('userId');
  const queries = [] as any[];
  if (userId) {
    queries.push(Query.equal('u', userId));
  }
  queries.push(Query.orderDesc('ts'));
  queries.push(Query.limit(20));
  const { documents } = await databases.listDocuments(dbId, postsId, queries);
  return NextResponse.json({ posts: documents }, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Sanitize input and enforce max length to prevent abuse
    const parsed = createPostSchema.parse({
      text: typeof body.text === 'string' ? body.text.trim().slice(0, 500) : undefined,
      attachment: typeof body.attachment === 'string' ? body.attachment : undefined,
    });
    // Get current user from JWT header.  This header is passed from the client after
    // calling account.createJWT().  If it is missing or invalid the call will fail.
    const jwt = req.headers.get('x-appwrite-jwt');
    if (!jwt) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }
    // Apply the JWT to the account client so that account.get() uses the user's context.
    account.setJWT(jwt);
    const user = await account.get();
    const dbId = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    const postsId = process.env.APPWRITE_POSTS_COLLECTION_ID || process.env.NEXT_PUBLIC_APPWRITE_POSTS_COLLECTION_ID;
    if (!dbId || !postsId) {
      return NextResponse.json({ error: 'Misconfigured database or collection' }, { status: 500 });
    }
    const data = {
      u: user.$id,
      t: parsed.text,
      a: parsed.attachment,
      ts: Date.now(),
    };
    // Rate limiting: prevent spamming posts
    if (isRateLimited(user.$id)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    // Define fine‑grained permissions: allow all users to read but only the
    // author can write/update.  Adjust based on your moderation model.
    const readPerms = ['role:all'];
    const writePerms = [`user:${user.$id}`];
    const doc = await databases.createDocument(dbId, postsId, ID.unique(), data, readPerms, writePerms);
    // Audit log
    await logAction({ userId: user.$id, action: 'create_post', context: { postId: doc.$id } });
    return NextResponse.json({ post: doc }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create post' }, { status: 400 });
  }
}
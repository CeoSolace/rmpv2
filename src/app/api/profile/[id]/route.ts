import { NextRequest, NextResponse } from 'next/server';
import { databases } from '@/lib/appwrite';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id;
    const dbId = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    const profilesId = process.env.APPWRITE_PROFILES_COLLECTION_ID || process.env.NEXT_PUBLIC_APPWRITE_PROFILES_COLLECTION_ID;
    if (!dbId || !profilesId) {
      return NextResponse.json({ error: 'Misconfigured database or collection' }, { status: 500 });
    }
    const profile = await databases.getDocument(dbId, profilesId, userId);
    return NextResponse.json({ profile }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Profile not found' }, { status: 404 });
  }
}
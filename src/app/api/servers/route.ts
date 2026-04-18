import { NextRequest, NextResponse } from 'next/server';
import { account, databases } from '@/lib/appwrite';
import { Query } from '@appwrite/client';

export async function GET(req: NextRequest) {
  try {
    const jwt = req.headers.get('x-appwrite-jwt');
    if (!jwt) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }
    account.setJWT(jwt);
    const user = await account.get();
    const dbId = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    const membershipsId = process.env.APPWRITE_MEMBERSHIPS_COLLECTION_ID || process.env.NEXT_PUBLIC_APPWRITE_MEMBERSHIPS_COLLECTION_ID;
    const orgsId = process.env.APPWRITE_ORGS_COLLECTION_ID || process.env.NEXT_PUBLIC_APPWRITE_ORGS_COLLECTION_ID;
    if (!dbId || !membershipsId || !orgsId) {
      return NextResponse.json({ error: 'Misconfigured collections' }, { status: 500 });
    }
    // list memberships for current user
    const membershipRes = await databases.listDocuments(dbId, membershipsId, [
      Query.equal('u', user.$id),
      Query.limit(50),
    ]);
    const memberships = membershipRes.documents;
    const servers = [];
    for (const m of memberships) {
      const org = await databases.getDocument(dbId, orgsId, m.o);
      servers.push(org);
    }
    return NextResponse.json({ servers }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch servers' }, { status: 500 });
  }
}
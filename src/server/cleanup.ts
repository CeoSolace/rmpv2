import { databases } from '@/lib/appwrite';
import { Query } from '@appwrite/client';

/**
 * Cleanup script to be run on a schedule (e.g. daily) via Appwrite functions
 * or an external cron service.  It removes expired invites, stale temp
 * uploads, broken media references and orphaned records (messages referencing
 * deleted conversations, likes referencing deleted posts, etc.).  This file
 * runs server‑side only and should never be imported into client bundles.
 */
export async function runCleanup() {
  const dbId = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
  if (!dbId) throw new Error('Database ID is not configured');
  // Example: remove stale notifications older than 30 days
  const notificationsId = process.env.APPWRITE_NOTIFICATIONS_COLLECTION_ID;
  if (notificationsId) {
    const thirtyDaysAgo = Date.now() - 1000 * 60 * 60 * 24 * 30;
    const { documents } = await databases.listDocuments(dbId, notificationsId, [
      Query.lessThan('ts', thirtyDaysAgo),
      Query.limit(100),
    ]);
    for (const doc of documents) {
      await databases.deleteDocument(dbId, notificationsId, doc.$id);
    }
  }
  // TODO: implement other cleanup tasks (orphan messages, expired invites, etc.)
}
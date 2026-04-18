import { databases, account, ID } from '@/lib/appwrite';

/**
 * Helper to log administrative or user actions into the audit logs collection.
 * Should be called from server context only.  Uses the server API key set on
 * the client (APPWRITE_API_KEY) to bypass user permissions.
 */
export async function logAction(params: {
  userId: string;
  action: string;
  context?: Record<string, any>;
}) {
  const dbId = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
  const auditId = process.env.APPWRITE_AUDIT_LOGS_COLLECTION_ID || process.env.NEXT_PUBLIC_APPWRITE_AUDIT_LOGS_COLLECTION_ID;
  if (!dbId || !auditId) return;
  const { userId, action, context = {} } = params;
  const data = {
    u: userId,
    a: action,
    c: context,
    ts: Date.now(),
  };
  try {
    const readPerms = ['role:owner', 'role:admin', 'role:moderator'];
    const writePerms = ['role:owner', 'role:admin'];
    await databases.createDocument(dbId, auditId, ID.unique(), data, readPerms, writePerms);
  } catch (err) {
    // Failing to log should not crash the request
    console.error('Failed to write audit log', err);
  }
}
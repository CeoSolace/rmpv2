import { Client, Account, Databases, Avatars, ID } from '@appwrite/client';

/**
 * Initialise the Appwrite client on the client side.  The endpoint and
 * project ID are provided via NEXT_PUBLIC_* env variables at build time.
 * Note: never expose your API key in client‑side code.
 */
const client = new Client();
if (process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT && process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) {
  client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
}

// When running in a server context (Node.js), apply the API key if available.  This
// allows privileged operations such as writing to the audit logs collection.  The
// APPWRITE_API_KEY env var should never be exposed to the client, so we only
// call setKey on the server.  See https://appwrite.io/docs for details.
if (typeof window === 'undefined' && process.env.APPWRITE_API_KEY) {
  client.setKey(process.env.APPWRITE_API_KEY);
}

export const account = new Account(client);
export const databases = new Databases(client);
export const avatars = new Avatars(client);

export { ID } from '@appwrite/client';
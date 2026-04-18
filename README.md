# RampChat

RampChat is a full‑stack social and communication platform built with **Next.js** (App Router), **TypeScript**, **Tailwind CSS**, **Appwrite** and **Cloudinary**.  It combines the best of real‑time chat and social media – inspired by Discord and Twitter – into a single scalable application that runs on the **Appwrite free plan** as long as possible.

> **Important:** this repository contains the source code only.  The code is structured and commented for clarity and to help you build, deploy and extend the platform.  You must supply your own environment variables and provision Appwrite and Cloudinary accounts before the application will run.

## Features

RampChat is designed to feel like a production‑ready product from day one.  The core V1 includes:

- **Authentication** – email/password login, session management, onboarding, unique usernames.  Built using Appwrite’s Auth service (no MFA or email verification for simplicity).
- **Profiles** – each user has a username, display name, avatar, banner image, bio, followers/following counts and a feed of their posts.  Media files are stored in Cloudinary to avoid burning Appwrite storage credits.
- **Direct Messages** – one‑to‑one conversations with real‑time updates (only for the active thread), unread counts and support for attachments (again stored in Cloudinary).
- **Servers (Organisations)** – public or private servers with invites, members and roles (owner, admin, mod, member).  Servers contain channels.
- **Channels** – text channels with real‑time message updates, per‑channel permissions and moderation features.
- **Posts & Feeds** – users can create posts, reply, like and repost.  Each profile shows a personal feed and there’s also a discovery feed.  All queries are paginated to minimise reads.
- **Follow System** – follow/unfollow, follower/following lists, counts and notifications.
- **Admin & Moderation** – global roles (User, Staff, Moderator, Admin, Owner) plus per‑server roles.  Includes dashboards for managing users, servers, reports and audit logs, along with tools to ban, kick, mute, remove content and more.
- **Data Cleanup** – scheduled jobs (cron) to remove broken media references, expired invites, stale temporary uploads and orphaned records (e.g. messages referencing deleted conversations).  Hard deletes junk and soft deletes only where required for moderation history.

## Project Structure

This project uses Next.js’ App Router and a clean modular architecture:

- `src/app` – routes, layouts and top‑level pages.
- `src/components` – reusable UI components (navigation, post cards, message bubbles, etc.).
- `src/lib` – shared libraries (Appwrite client, Cloudinary helpers, validation and query helpers).
- `src/hooks` – custom React hooks for authentication, data fetching and more.
- `src/types` – TypeScript interfaces and types.
- `src/server` – server‑only utilities and API route handlers (e.g. scheduled cleanup jobs).

## Getting Started

1. **Clone the repository** and install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and fill in all variables with your Appwrite and Cloudinary credentials.  **Never commit secret keys.**
3. Create the Appwrite collections described below.  Use short field names and indexes to minimise read/write costs.  See `docs/appwrite-collections.md` for detailed definitions.
4. Create a Cloudinary account and set up a single folder for RampChat media.  Configure the API key/secret and folder in your environment.
5. Run the development server with `npm run dev` and open `http://localhost:3000` to view the app.

### Deployment

Deploying on [Render.com](https://render.com) is the recommended path.  The `render.yaml` file provides a baseline service definition for a Next.js app.  You will need to:

1. Create a new **Web Service** on Render and connect it to your GitHub repository.
2. Set environment variables on Render using the values from your `.env.local` file.
3. Use the start command `npm run build && npm run start`.
4. Ensure that your Render service points to the correct build directory and port (default is `10000`).

## Appwrite Setup

RampChat relies on Appwrite for authentication, data storage and real‑time messaging.  To stay within the free plan, collections are kept lean and queries are paginated.  The environment variables specify a number of collection IDs; create these in your Appwrite project before deploying.  A summary of the core collections:

| Collection ID                | Purpose                                       | Key Fields           |
|-----------------------------|-----------------------------------------------|----------------------|
| `rc_profiles`               | User profiles                                 | `u` (user id), `n` (username), `d` (displayName), `a` (avatarId), `b` (bio), `f` (followers count) |
| `rc_conversations`          | Direct message conversations                  | `p` (participant ids), `l` (last message id), `u` (updated at) |
| `rc_messages`               | Messages for DMs and channels                 | `c` (conversation/channel id), `s` (sender id), `m` (message text), `a` (attachment publicId), `t` (timestamp) |
| `rc_posts`                  | Posts                                         | `u` (user id), `t` (text), `a` (attachment id), `ts` (timestamp) |
| `rc_post_likes`             | Post likes                                    | `p` (post id), `u` (user id) |
| `rc_post_replies`           | Replies to posts                              | `p` (post id), `u` (user id), `m` (message), `ts` (timestamp) |
| `rc_follows`                | Follow relationships                          | `f` (follower id), `t` (target id) |
| `rc_memberships`            | Server memberships                            | `o` (org id), `u` (user id), `r` (role) |
| `rc_notifications`          | Notifications                                 | `u` (recipient), `t` (type), `d` (data), `r` (read?) |
| `rc_reports`                | Moderation reports                            | `r` (reported id), `u` (reporter id), `t` (type), `c` (comment) |
| `rc_audit_logs`             | System audit logs (admin actions)             | `u` (user id), `a` (action), `c` (context), `ts` (timestamp) |

**Indexes:** define composite indexes on frequently queried fields (e.g. `u` for user‑scoped queries, `c` for conversation messages).  Only create indexes you actually need to minimise costs.

## Cloudinary Setup

All user uploaded media (avatars, banners, message attachments, post images) live in a single Cloudinary folder defined by `CLOUDINARY_FOLDER`.  Store only the `publicId` in Appwrite and generate signed URLs on the fly in the frontend.  Compress images and validate file types before uploading.

## Scripts & Cleanup

Scheduled cleanup tasks run server‑side to remove expired invites, stale uploads, broken media references and orphaned records.  See `src/server/cleanup.ts` for a sample implementation.  Use Appwrite’s `functions` service or a separate cron service to run these tasks daily.

## Future Improvements

- Integrate a search service (e.g. Typesense or Algolia) for efficient user and post search without heavy database queries.
- Add WebRTC voice/video channels.
- Implement push notifications using Web Push or a third‑party service.
- Extend the moderation system with AI‑assisted content analysis and automatic abuse detection.

## License

This project is provided under the MIT license.  Feel free to fork, modify and share your improvements.  Please contribute back if you build something useful!
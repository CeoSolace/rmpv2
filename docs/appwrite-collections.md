# Appwrite Collections for RampChat

This document describes the core collections used by RampChat and how to configure them in the Appwrite console.  Collections and field names are deliberately short to save storage and reduce transfer cost on the free plan.  Where appropriate, indexes are suggested to speed up common queries without incurring unnecessary read overhead.  Adjust the indexes based on your actual usage patterns.

## Profiles (`rc_profiles`)

**Purpose:** store user profile information separate from the built‑in Appwrite user record.  Each profile document ID should match the Appwrite user ID so that you can fetch it directly by ID.

| Field | Type     | Description                           |
|------|----------|---------------------------------------|
| `n`  | string   | username (unique)                     |
| `d`  | string   | display name                          |
| `a`  | string   | avatar Cloudinary publicId            |
| `bn` | string   | banner Cloudinary publicId            |
| `b`  | string   | bio                                    |
| `f`  | integer  | followers count (denormalised)        |
| `g`  | integer  | following count (denormalised)        |
| `ts` | integer  | timestamp (ms since epoch)            |

**Indexes:**

- Unique index on `n` to enforce unique usernames.
- Index on `f` and `g` if you need to sort by follower counts.

**Permissions:**

- **Write:** Only the user themselves should be able to update their profile.
- **Read:** Anyone can read profiles.

## Conversations (`rc_conversations`)

**Purpose:** represent direct message conversations between two users.

| Field | Type     | Description                          |
|------|----------|--------------------------------------|
| `p`  | array    | array of two user IDs (participants) |
| `l`  | string   | last message document ID             |
| `u`  | integer  | timestamp of last update             |

**Indexes:**

- Index on `p` to find conversations by participant.
- Index on `u` to sort by last update time.

**Permissions:**

- **Write:** Only participants can create/update.
- **Read:** Only participants can read.

## Messages (`rc_messages`)

**Purpose:** messages for both direct messages and channel chats.  Use a single collection to minimise index overhead.

| Field | Type     | Description                                             |
|------|----------|---------------------------------------------------------|
| `c`  | string   | conversation or channel ID                             |
| `s`  | string   | sender user ID                                          |
| `m`  | string   | message text (optional)                                 |
| `a`  | string   | attachment publicId (optional)                          |
| `t`  | integer  | timestamp (ms since epoch)                              |

**Indexes:**

- Composite index on `c` and `t` (ascending) to retrieve messages by conversation/channel and sorted by time.
- Index on `s` if you need to filter by sender.

**Permissions:**

- **Write:** Only participants of the conversation or members of the channel can write.
- **Read:** Only participants/members can read.

## Posts (`rc_posts`)

**Purpose:** user posts similar to tweets.

| Field | Type     | Description                          |
|------|----------|--------------------------------------|
| `u`  | string   | author user ID                       |
| `t`  | string   | text content                         |
| `a`  | string   | attachment publicId (optional)       |
| `ts` | integer  | timestamp                            |
| `rp` | integer  | number of replies (optional)         |
| `lk` | integer  | number of likes (optional)           |

**Indexes:**

- Index on `u` to fetch posts by user.
- Index on `ts` (descending) for feeds.

## Post Likes (`rc_post_likes`)

**Purpose:** track which users like which posts.  Avoid storing an array of user IDs on the post document because arrays are expensive and have size limits.

| Field | Type   | Description        |
|------|--------|--------------------|
| `p`  | string | post ID           |
| `u`  | string | user ID           |
| `ts` | integer| timestamp         |

**Indexes:**

- Composite index on `p` and `u` to prevent duplicate likes and count likes quickly.

## Post Replies (`rc_post_replies`)

**Purpose:** store replies to posts.

| Field | Type   | Description            |
|------|--------|------------------------|
| `p`  | string | post ID               |
| `u`  | string | author user ID        |
| `m`  | string | reply text            |
| `ts` | integer| timestamp             |

**Indexes:**

- Composite index on `p` and `ts` (ascending) for retrieving replies.

## Follows (`rc_follows`)

**Purpose:** track user follow relationships.

| Field | Type   | Description               |
|------|--------|---------------------------|
| `f`  | string | follower user ID          |
| `t`  | string | target user ID            |
| `ts` | integer| timestamp                 |

**Indexes:**

- Composite index on `f` and `t` to ensure uniqueness and fetch both followers and followings.

## Memberships (`rc_memberships`)

**Purpose:** represent a user’s membership in a server/organisation.

| Field | Type   | Description             |
|------|--------|-------------------------|
| `o`  | string | organisation/server ID  |
| `u`  | string | user ID                 |
| `r`  | string | role (`owner`, `admin`, `mod`, `member`) |
| `ts` | integer| timestamp               |

**Indexes:**

- Composite index on `o` and `u` for membership lookups.

## Notifications (`rc_notifications`)

**Purpose:** deliver notifications to users for follows, likes, replies, invites, etc.  Keep payloads small by storing only IDs and types.

| Field | Type     | Description                               |
|------|----------|-------------------------------------------|
| `u`  | string   | recipient user ID                         |
| `t`  | string   | type (`follow`, `like`, `reply`, `invite`) |
| `d`  | object   | data payload with relevant IDs            |
| `r`  | boolean  | read flag (default false)                 |
| `ts` | integer  | timestamp                                 |

**Indexes:**

- Index on `u` and `r` to fetch unread notifications quickly.

## Reports (`rc_reports`)

**Purpose:** moderation reports filed by users.

| Field | Type     | Description                        |
|------|----------|------------------------------------|
| `r`  | string   | ID of reported entity               |
| `u`  | string   | reporter user ID                    |
| `t`  | string   | type (`user`, `post`, `message`)    |
| `c`  | string   | comment from reporter               |
| `ts` | integer  | timestamp                           |

**Indexes:**

- Index on `r` to group reports by target.
- Index on `t` if you need to filter by type.

## Audit Logs (`rc_audit_logs`)

**Purpose:** record administrative actions (e.g. bans, deletions) with context for accountability.

| Field | Type     | Description                       |
|------|----------|-----------------------------------|
| `u`  | string   | admin user ID                     |
| `a`  | string   | action                            |
| `c`  | object   | context (IDs of affected records)  |
| `ts` | integer  | timestamp                          |

**Indexes:**

- Index on `u` to audit actions per admin.
- Index on `a` if you need to filter by action type.

## Organisations/Servers (`rc_orgs`)

**Purpose:** represent servers analogous to Discord servers.

| Field | Type     | Description                            |
|------|----------|----------------------------------------|
| `n`  | string   | name                                   |
| `d`  | string   | description                            |
| `a`  | string   | avatar Cloudinary publicId             |
| `bn` | string   | banner publicId                        |
| `p`  | boolean  | whether the server is private          |
| `ow` | string   | owner user ID                          |
| `ts` | integer  | timestamp                              |

**Indexes:**

- Index on `ow` to fetch servers by owner.
- Index on `p` to filter public/private servers.

## Channel Recommendations

Channels can be modelled as a sub‑collection or a separate collection (`rc_channels`) if you need global unique IDs across all servers.  To minimise collections, you can store channels as documents in a single `rc_channels` collection with fields:

| Field | Type     | Description                          |
|------|----------|--------------------------------------|
| `o`  | string   | organisation/server ID              |
| `n`  | string   | name                                 |
| `d`  | string   | description                          |
| `p`  | boolean  | is private                           |
| `ts` | integer  | timestamp                            |

Index on `o` for listing channels by server.

## Security & Rules

For each collection, configure **document security** in the Appwrite console.  RampChat uses a combination of the following permissions:

- `role:all` – allow public reads (profiles, public servers).
- `user:{userId}` – restrict writes to the owner of a document.
- `team:{serverId}/{role}` – restrict access based on membership role.

Use functions or server‑side endpoints to enforce complex logic (e.g. only mods can delete messages).
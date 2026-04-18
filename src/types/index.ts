export interface Profile {
  /** Document ID corresponding to the Appwrite user ID. */
  $id: string;
  /** Username (unique). */
  n: string;
  /** Display name. */
  d?: string;
  /** Avatar image Cloudinary publicId. */
  a?: string;
  /** Banner image Cloudinary publicId. */
  bn?: string;
  /** Bio text. */
  b?: string;
  /** Followers count (denormalised for quick display). */
  f?: number;
  /** Following count (denormalised for quick display). */
  g?: number;
  /** Timestamp of profile creation. */
  ts?: number;
}

export interface Conversation {
  $id: string;
  /** Participants (two user ids). */
  p: string[];
  /** Last message id (for quick sorting). */
  l?: string;
  /** Updated at timestamp. */
  u?: number;
}

export interface Message {
  $id: string;
  /** Conversation or channel id. */
  c: string;
  /** Sender user id. */
  s: string;
  /** Message text. */
  m?: string;
  /** Attachment Cloudinary publicId. */
  a?: string;
  /** Created at timestamp. */
  t: number;
}

export interface Post {
  $id: string;
  /** Author user id. */
  u: string;
  /** Text content. */
  t?: string;
  /** Attachment publicId (image/video). */
  a?: string;
  /** Timestamp. */
  ts: number;
  /** Number of replies (denormalised). */
  rp?: number;
  /** Number of likes (denormalised). */
  lk?: number;
}

export interface Follow {
  $id: string;
  /** Follower user id. */
  f: string;
  /** Target user id (the person being followed). */
  t: string;
  /** Timestamp. */
  ts: number;
}

export type MembershipRole = 'owner' | 'admin' | 'mod' | 'member';

export interface Membership {
  $id: string;
  /** Organisation/server id. */
  o: string;
  /** User id. */
  u: string;
  /** Role within server. */
  r: MembershipRole;
  /** Joined at timestamp. */
  ts: number;
}

export interface Notification {
  $id: string;
  /** Recipient user id. */
  u: string;
  /** Notification type (e.g. follow, like, reply, invite). */
  t: string;
  /** Arbitrary data (ids of related docs). */
  d: Record<string, any>;
  /** Read flag. */
  r?: boolean;
  /** Timestamp. */
  ts: number;
}

export interface Report {
  $id: string;
  /** ID of the reported entity (user, post, message, server). */
  r: string;
  /** Reporter user id. */
  u: string;
  /** Type of report (user/post/message/server). */
  t: string;
  /** Additional comments. */
  c?: string;
  /** Timestamp. */
  ts: number;
}
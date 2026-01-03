/**
 * Type definitions for Message feature
 */

export interface Message {
  id: string;
  content: string;
  type?: string;
  edited?: boolean;
  createdAt: string | Date;
  user: {
    id: string;
    username: string;
    avatar: string | null;
  };
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
}

export type UserStatus = "ONLINE" | "OFFLINE" | "AWAY";

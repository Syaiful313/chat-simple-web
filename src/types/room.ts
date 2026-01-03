/**
 * Type definitions for Room feature
 */

export interface Room {
  id: string;
  name: string;
  description: string | null;
  type: "PUBLIC" | "PRIVATE" | "DIRECT";
  creatorId?: string; // For chat room
  creator: {
    username: string;
  };
  _count: {
    members: number;
    messages: number;
  };
  messages?: Array<{
    content: string;
    createdAt: string | Date;
  }>;
  members?: Array<{
    unreadCount: number;
    userId: string;
    role?: string; // For chat room
  }>;
}

export type RoomType = "PUBLIC" | "PRIVATE" | "DIRECT";

"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Create or get existing direct message room between two users
 */
export async function createDirectMessage(targetUserId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    if (targetUserId === session.user.id) {
      throw new Error("Cannot create DM with yourself");
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        username: true,
        avatar: true,
      },
    });

    if (!targetUser) {
      throw new Error("User not found");
    }

    // Check if DM already exists between these two users
    const existingDM = await prisma.room.findFirst({
      where: {
        type: "DIRECT",
        AND: [
          {
            members: {
              some: {
                userId: session.user.id,
              },
            },
          },
          {
            members: {
              some: {
                userId: targetUserId,
              },
            },
          },
        ],
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                status: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            messages: true,
          },
        },
      },
    });

    if (existingDM) {
      return { room: existingDM, isNew: false };
    }

    // Create new DM room
    const dmRoom = await prisma.room.create({
      data: {
        name: `DM: ${session.user.username} & ${targetUser.username}`,
        type: "DIRECT",
        creatorId: session.user.id,
        members: {
          create: [
            {
              userId: session.user.id,
              role: "ADMIN",
            },
            {
              userId: targetUserId,
              role: "ADMIN",
            },
          ],
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                status: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            messages: true,
          },
        },
      },
    });

    return { room: dmRoom, isNew: true };
  } catch (error) {
    console.error("Create DM error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to create direct message");
  }
}

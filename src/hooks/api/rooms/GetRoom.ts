"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getRoom(roomId: string) {
  try {
    const session = await auth();

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
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

    if (!room) {
      throw new Error("Room not found");
    }

    // Check if user is a member (for private rooms)
    if (room.type === "PRIVATE") {
      const isMember = room.members.some(
        (member) => member.userId === session.user.id,
      );
      if (!isMember) {
        throw new Error("Access denied");
      }
    } else {
      // Auto-join public rooms if not already a member
      const isMember = room.members.some(
        (member) => member.userId === session.user.id,
      );
      if (!isMember) {
        await prisma.roomMember.create({
          data: {
            userId: session.user.id,
            roomId: roomId,
            role: "MEMBER",
          },
        });
      }
    }

    return { room };
  } catch (error) {
    console.error("Get room error:", error);
    throw error;
  }
}

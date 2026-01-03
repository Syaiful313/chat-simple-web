"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getRooms() {
  try {
    const session = await auth();

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const rooms = await prisma.room.findMany({
      where: {
        OR: [
          { type: "PUBLIC" },
          {
            members: {
              some: {
                userId: session.user.id,
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
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: {
            content: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            members: true,
            messages: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return { rooms };
  } catch (error) {
    console.error("Get rooms error:", error);
    throw new Error("Failed to fetch rooms");
  }
}

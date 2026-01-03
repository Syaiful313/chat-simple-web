"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createRoomSchema } from "@/lib/validations";
import { z } from "zod";

export async function createRoom(data: z.infer<typeof createRoomSchema>) {
  try {
    const session = await auth();

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const { name, description, type } = await createRoomSchema.parseAsync(data);

    // Create room and add creator as admin member
    const room = await prisma.room.create({
      data: {
        name,
        description,
        type,
        creatorId: session.user.id,
        members: {
          create: {
            userId: session.user.id,
            role: "ADMIN",
          },
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
                createdAt: true,
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
    });

    return { room };
  } catch (error) {
    console.error("Create room error:", error);
    if (error instanceof z.ZodError) {
      throw new Error(error.issues[0].message);
    }
    throw new Error("Failed to create room");
  }
}

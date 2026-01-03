"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateRoomSchema } from "./schemas";
import { z } from "zod";

export async function updateRoom(roomId: string, data: unknown) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Check if room exists and user is the creator or admin
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        members: {
          where: { userId: session.user.id },
        },
      },
    });

    if (!room) {
      throw new Error("Room not found");
    }

    // Check if user is creator or admin
    const isCreator = room.creatorId === session.user.id;
    const isAdmin = room.members.some(
      (member) => member.userId === session.user.id && member.role === "ADMIN",
    );

    if (!isCreator && !isAdmin) {
      throw new Error("Only room creator or admin can edit room settings");
    }

    const validatedData = updateRoomSchema.parse(data);

    // Update room
    const updatedRoom = await prisma.room.update({
      where: { id: roomId },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.description !== undefined && {
          description: validatedData.description,
        }),
        ...(validatedData.type && { type: validatedData.type }),
        ...(validatedData.avatar !== undefined && {
          avatar: validatedData.avatar,
        }),
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            avatar: true,
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

    return {
      message: "Room updated successfully",
      room: updatedRoom,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.issues[0].message);
    }
    console.error("Update room error:", error);
    throw new Error("Failed to update room");
  }
}

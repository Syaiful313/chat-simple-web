"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function deleteRoom(roomId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Check if room exists and user is the creator
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new Error("Room not found");
    }

    // Only creator can delete room
    if (room.creatorId !== session.user.id) {
      throw new Error("Only room creator can delete the room");
    }

    // Delete room (cascade will delete members and messages)
    await prisma.room.delete({
      where: { id: roomId },
    });

    return {
      message: "Room deleted successfully",
    };
  } catch (error) {
    console.error("Delete room error:", error);
    throw new Error("Failed to delete room");
  }
}

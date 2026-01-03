"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function toggleReaction(messageId: string, emoji: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    if (!emoji || typeof emoji !== "string") {
      throw new Error("Invalid emoji");
    }

    // Check if reaction already exists
    const existing = await prisma.reaction.findUnique({
      where: {
        userId_messageId_emoji: {
          userId: session.user.id,
          messageId,
          emoji,
        },
      },
    });

    if (existing) {
      // Remove reaction (toggle off)
      await prisma.reaction.delete({
        where: { id: existing.id },
      });
      return { action: "removed" };
    } else {
      // Add reaction
      const reaction = await prisma.reaction.create({
        data: {
          emoji,
          userId: session.user.id,
          messageId,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      });
      return { action: "added", reaction };
    }
  } catch (error) {
    console.error("Reaction error:", error);
    throw new Error("Failed to process reaction");
  }
}

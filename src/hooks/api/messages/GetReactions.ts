"use server";

import { prisma } from "@/lib/prisma";

export async function getReactions(messageId: string) {
  try {
    const reactions = await prisma.reaction.findMany({
      where: { messageId },
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

    // Group by emoji
    const grouped = reactions.reduce(
      (acc, reaction) => {
        if (!acc[reaction.emoji]) {
          acc[reaction.emoji] = {
            emoji: reaction.emoji,
            count: 0,
            users: [],
          };
        }
        acc[reaction.emoji].count++;
        acc[reaction.emoji].users.push(reaction.user);
        return acc;
      },
      {} as Record<
        string,
        {
          emoji: string;
          count: number;
          users: Array<{ id: string; username: string; avatar: string | null }>;
        }
      >,
    );

    return { reactions: Object.values(grouped) };
  } catch (error) {
    console.error("Get reactions error:", error);
    throw new Error("Failed to get reactions");
  }
}

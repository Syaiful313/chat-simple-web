import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messageId } = await params;
    const { emoji } = await req.json();

    if (!emoji || typeof emoji !== "string") {
      return NextResponse.json({ error: "Invalid emoji" }, { status: 400 });
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
      return NextResponse.json({ action: "removed" });
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
      return NextResponse.json({ action: "added", reaction });
    }
  } catch (error) {
    console.error("Reaction error:", error);
    return NextResponse.json(
      { error: "Failed to process reaction" },
      { status: 500 },
    );
  }
}

// Get reactions for a message
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> },
) {
  try {
    const { messageId } = await params;

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

    return NextResponse.json({ reactions: Object.values(grouped) });
  } catch (error) {
    console.error("Get reactions error:", error);
    return NextResponse.json(
      { error: "Failed to get reactions" },
      { status: 500 },
    );
  }
}

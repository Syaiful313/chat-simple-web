import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId } = await params;

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
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Check if user is a member (for private rooms)
    if (room.type === "PRIVATE") {
      const isMember = room.members.some(
        (member) => member.userId === session.user.id,
      );
      if (!isMember) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
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

    return NextResponse.json({ room });
  } catch (error) {
    console.error("Get room error:", error);
    return NextResponse.json(
      { error: "Failed to fetch room" },
      { status: 500 },
    );
  }
}

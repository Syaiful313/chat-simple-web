import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId } = await params;

    // Check if room exists and is public or user is already a member
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        members: {
          where: { userId: session.user.id },
        },
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (room.members.length > 0) {
      return NextResponse.json({ error: "Already a member" }, { status: 400 });
    }

    if (room.type === "PRIVATE") {
      return NextResponse.json(
        { error: "Cannot join private room" },
        { status: 403 },
      );
    }

    // Add user to room
    const membership = await prisma.roomMember.create({
      data: {
        userId: session.user.id,
        roomId: roomId,
        role: "MEMBER",
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

    return NextResponse.json({ membership }, { status: 201 });
  } catch (error) {
    console.error("Join room error:", error);
    return NextResponse.json({ error: "Failed to join room" }, { status: 500 });
  }
}

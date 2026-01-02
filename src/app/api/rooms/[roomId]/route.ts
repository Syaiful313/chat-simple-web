import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateRoomSchema = z.object({
  name: z
    .string()
    .min(1, "Nama room tidak boleh kosong")
    .max(50, "Nama room maksimal 50 karakter")
    .optional(),
  description: z
    .string()
    .max(200, "Deskripsi maksimal 200 karakter")
    .optional(),
  type: z.enum(["PUBLIC", "PRIVATE"]).optional(),
  avatar: z.string().url("Avatar harus berupa URL valid").optional(),
});

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId } = await params;

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
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Check if user is creator or admin
    const isCreator = room.creatorId === session.user.id;
    const isAdmin = room.members.some(
      (member) => member.userId === session.user.id && member.role === "ADMIN",
    );

    if (!isCreator && !isAdmin) {
      return NextResponse.json(
        { error: "Only room creator or admin can edit room settings" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const validatedData = updateRoomSchema.parse(body);

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

    return NextResponse.json({
      message: "Room updated successfully",
      room: updatedRoom,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 },
      );
    }

    console.error("Update room error:", error);
    return NextResponse.json(
      { error: "Failed to update room" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId } = await params;

    // Check if room exists and user is the creator
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Only creator can delete room
    if (room.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: "Only room creator can delete the room" },
        { status: 403 },
      );
    }

    // Delete room (cascade will delete members and messages)
    await prisma.room.delete({
      where: { id: roomId },
    });

    return NextResponse.json({
      message: "Room deleted successfully",
    });
  } catch (error) {
    console.error("Delete room error:", error);
    return NextResponse.json(
      { error: "Failed to delete room" },
      { status: 500 },
    );
  }
}

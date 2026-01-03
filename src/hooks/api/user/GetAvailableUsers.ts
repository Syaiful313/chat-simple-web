"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Get all users except the current user for DM selection
 */
export async function getAvailableUsers() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const users = await prisma.user.findMany({
      where: {
        id: {
          not: session.user.id,
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        status: true,
        bio: true,
      },
      orderBy: {
        username: "asc",
      },
    });

    return { users };
  } catch (error) {
    console.error("Get available users error:", error);
    throw new Error("Failed to fetch users");
  }
}

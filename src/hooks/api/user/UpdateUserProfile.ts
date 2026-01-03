"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(20, "Username maksimal 20 karakter")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username hanya boleh mengandung huruf, angka, dan underscore",
    )
    .optional(),
  bio: z.string().max(160, "Bio maksimal 160 karakter").optional(),
  avatar: z.string().optional(),
});

export async function updateUserProfile(data: unknown) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const validatedData = updateProfileSchema.parse(data);

    // Check if username is being updated and if it's already taken
    if (validatedData.username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: validatedData.username,
          NOT: { id: session.user.id },
        },
      });

      if (existingUser) {
        throw new Error("Username sudah digunakan");
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(validatedData.username && { username: validatedData.username }),
        ...(validatedData.bio !== undefined && { bio: validatedData.bio }),
        ...(validatedData.avatar !== undefined && {
          avatar: validatedData.avatar,
        }),
      },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        avatar: true,
        status: true,
      },
    });

    return {
      message: "Profile updated successfully",
      user: updatedUser,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.issues[0].message);
    }

    console.error("Error updating profile:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to update profile",
    );
  }
}

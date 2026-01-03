"use server";

import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";
import { z } from "zod";

export async function registerUser(data: z.infer<typeof registerSchema>) {
  try {
    const { username, email, password } = await registerSchema.parseAsync(data);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new Error("Email sudah terdaftar");
      }
      if (existingUser.username === username) {
        throw new Error("Username sudah digunakan");
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });

    return { message: "Registrasi berhasil", user };
  } catch (error: unknown) {
    console.error("Registration error:", error);

    if (error instanceof z.ZodError) {
      throw new Error(error.issues[0].message);
    }

    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error("Terjadi kesalahan saat registrasi");
  }
}

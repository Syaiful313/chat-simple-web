import { z } from "zod";

export const updateRoomSchema = z.object({
  name: z
    .string()
    .min(1, "Nama room tidak boleh kosong")
    .max(50, "Nama room maksimal 50 karakter")
    .optional(),
  description: z
    .string()
    .max(200, "Deskripsi maksimal 200 karakter")
    .optional(),
  type: z.enum(["PUBLIC", "PRIVATE", "DIRECT"]).optional(),
  avatar: z.string().url("Avatar harus berupa URL valid").optional(),
});

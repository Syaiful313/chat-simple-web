"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, User, FileText, Image as ImageIcon } from "lucide-react";

const profileSchema = z.object({
  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(20, "Username maksimal 20 karakter")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username hanya boleh mengandung huruf, angka, dan underscore",
    ),
  bio: z.string().max(160, "Bio maksimal 160 karakter").optional(),
  avatar: z
    .string()
    .url("Avatar harus berupa URL valid")
    .optional()
    .or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileUpdated?: () => void;
}

export function ProfileDialog({
  open,
  onOpenChange,
  onProfileUpdated,
}: ProfileDialogProps) {
  const { data: session, update: updateSession } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const fetchProfile = useCallback(async () => {
    setIsFetching(true);
    try {
      const res = await fetch("/api/user/profile");
      if (!res.ok) throw new Error("Failed to fetch profile");

      const data = await res.json();
      setValue("username", data.user.username);
      setValue("bio", data.user.bio || "");
      setValue("avatar", data.user.avatar || "");
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Gagal memuat profil");
    } finally {
      setIsFetching(false);
    }
  }, [setValue]);

  // Fetch current profile data
  useEffect(() => {
    if (open && session?.user?.id) {
      fetchProfile();
    }
  }, [open, session?.user?.id, fetchProfile]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.username,
          bio: data.bio || null,
          avatar: data.avatar || null,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to update profile");
      }

      // Update session with new data
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          username: result.user.username,
        },
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onOpenChange(false);
        onProfileUpdated?.();
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal update profil");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Profil</DialogTitle>
          <DialogDescription>
            Ubah informasi profil Anda. Username harus unik.
          </DialogDescription>
        </DialogHeader>

        {isFetching ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Avatar Preview */}
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={session?.user?.avatar || undefined} />
                <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-2xl">
                  {session?.user?.username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {session?.user?.email}
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="p-3 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                ✓ Profil berhasil diperbarui!
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                {error}
              </div>
            )}

            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Username
              </Label>
              <Input
                id="username"
                placeholder="johndoe"
                {...register("username")}
                disabled={isLoading}
              />
              {errors.username && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Bio Field */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Bio (Opsional)
              </Label>
              <textarea
                id="bio"
                placeholder="Ceritakan tentang diri Anda..."
                {...register("bio")}
                disabled={isLoading}
                className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                maxLength={160}
              />
              {errors.bio && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {errors.bio.message}
                </p>
              )}
            </div>

            {/* Avatar URL Field */}
            <div className="space-y-2">
              <Label htmlFor="avatar" className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Avatar URL (Opsional)
              </Label>
              <Input
                id="avatar"
                type="url"
                placeholder="https://example.com/avatar.jpg"
                {...register("avatar")}
                disabled={isLoading}
              />
              {errors.avatar && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {errors.avatar.message}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Masukkan URL gambar untuk avatar Anda
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="flex-1"
              >
                Batal
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

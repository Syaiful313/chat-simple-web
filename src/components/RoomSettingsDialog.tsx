"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
import {
  Loader2,
  Settings,
  Hash,
  FileText,
  Image as ImageIcon,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";

const roomSettingsSchema = z.object({
  name: z
    .string()
    .min(1, "Nama room tidak boleh kosong")
    .max(50, "Nama room maksimal 50 karakter"),
  description: z
    .string()
    .max(200, "Deskripsi maksimal 200 karakter")
    .optional()
    .or(z.literal("")),
  type: z.enum(["PUBLIC", "PRIVATE"]),
  avatar: z
    .string()
    .url("Avatar harus berupa URL valid")
    .optional()
    .or(z.literal("")),
});

type RoomSettingsFormData = z.infer<typeof roomSettingsSchema>;

interface RoomSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: string;
  isCreator: boolean;
  onRoomUpdated?: () => void;
  onRoomDeleted?: () => void;
}

export function RoomSettingsDialog({
  open,
  onOpenChange,
  roomId,
  isCreator,
  onRoomUpdated,
  onRoomDeleted,
}: RoomSettingsDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RoomSettingsFormData>({
    resolver: zodResolver(roomSettingsSchema),
  });

  // Fetch current room data
  const fetchRoomData = useCallback(async () => {
    setIsFetching(true);
    try {
      const res = await fetch(`/api/rooms/${roomId}`);
      if (!res.ok) throw new Error("Failed to fetch room");

      const data = await res.json();
      setValue("name", data.room.name);
      setValue("description", data.room.description || "");
      setValue("type", data.room.type);
      setValue("avatar", data.room.avatar || "");
    } catch (err) {
      console.error("Error fetching room:", err);
      setError("Gagal memuat data room");
    } finally {
      setIsFetching(false);
    }
  }, [roomId, setValue]);

  useEffect(() => {
    if (open && roomId) {
      fetchRoomData();
    }
  }, [open, roomId, fetchRoomData]);

  const onSubmit = async (data: RoomSettingsFormData) => {
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch(`/api/rooms/${roomId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          description: data.description || null,
          type: data.type,
          avatar: data.avatar || null,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to update room");
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onOpenChange(false);
        onRoomUpdated?.();
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal update room");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRoom = async () => {
    setIsDeleting(true);
    setError("");

    try {
      const res = await fetch(`/api/rooms/${roomId}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to delete room");
      }

      // Close dialog and redirect
      onOpenChange(false);
      onRoomDeleted?.();
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal hapus room");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Room Settings
          </DialogTitle>
          <DialogDescription>
            {isCreator
              ? "Ubah pengaturan room. Hanya creator yang bisa menghapus room."
              : "Ubah pengaturan room sebagai admin."}
          </DialogDescription>
        </DialogHeader>

        {isFetching ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Success Message */}
              {success && (
                <div className="p-3 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                  ✓ Room berhasil diperbarui!
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                  {error}
                </div>
              )}

              {/* Room Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Nama Room
                </Label>
                <Input
                  id="name"
                  placeholder="Nama room..."
                  {...register("name")}
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Description Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Deskripsi (Opsional)
                </Label>
                <textarea
                  id="description"
                  placeholder="Deskripsi room..."
                  {...register("description")}
                  disabled={isLoading}
                  className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  maxLength={200}
                />
                {errors.description && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Room Type Field */}
              <div className="space-y-2">
                <Label>Tipe Room</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="PUBLIC"
                      {...register("type")}
                      disabled={isLoading}
                    />
                    <span className="text-sm">Public</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="PRIVATE"
                      {...register("type")}
                      disabled={isLoading}
                    />
                    <span className="text-sm">Private</span>
                  </label>
                </div>
              </div>

              {/* Avatar Selection */}
              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Room Avatar
                </Label>
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                  <ImageUpload
                    onImageSelect={(url) => setValue("avatar", url)}
                    onCancel={() => setValue("avatar", "")}
                    buttonLabel="Update Avatar"
                  />
                </div>
                {errors.avatar && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {errors.avatar.message}
                  </p>
                )}
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

            {/* Delete Room Section (Only for Creator) */}
            {isCreator && (
              <div className="pt-4 border-t dark:border-gray-800">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm text-red-600 dark:text-red-400">
                        Danger Zone
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Menghapus room akan menghapus semua pesan dan member.
                        Tindakan ini tidak dapat dibatalkan.
                      </p>
                    </div>
                  </div>

                  {!showDeleteConfirm ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Hapus Room
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                        Yakin ingin menghapus room ini?
                      </p>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowDeleteConfirm(false)}
                          disabled={isDeleting}
                          className="flex-1"
                        >
                          Batal
                        </Button>
                        <Button
                          type="button"
                          onClick={handleDeleteRoom}
                          disabled={isDeleting}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Menghapus...
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Ya, Hapus
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { createRoomSchema, type CreateRoomInput } from "@/lib/validations";
import { createRoom } from "@/hooks/api/rooms/CreateRoom";

interface CreateRoomDialogProps {
  onRoomCreated: () => void;
}

export const CreateRoomDialog = ({ onRoomCreated }: CreateRoomDialogProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateRoomInput>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      type: "PUBLIC",
    },
  });

  const onCreateRoom = async (data: CreateRoomInput) => {
    setIsCreating(true);
    try {
      await createRoom(data);
      await onRoomCreated();
      setIsDialogOpen(false);
      reset();
    } catch (error) {
      console.error("Failed to create room:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Buat Room Baru
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buat Room Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onCreateRoom)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Room</Label>
            <Input
              id="name"
              placeholder="Nama room..."
              {...register("name")}
              disabled={isCreating}
            />
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi (Opsional)</Label>
            <Input
              id="description"
              placeholder="Deskripsi room..."
              {...register("description")}
              disabled={isCreating}
            />
            {errors.description && (
              <p className="text-xs text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Tipe Room</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="PUBLIC"
                  {...register("type")}
                  defaultChecked
                  disabled={isCreating}
                />
                <span className="text-sm">Public</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="PRIVATE"
                  {...register("type")}
                  disabled={isCreating}
                />
                <span className="text-sm">Private</span>
              </label>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Membuat...
              </>
            ) : (
              "Buat Room"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  LogOut,
  Plus,
  Users,
  MessageSquare,
  Loader2,
  Hash,
  Lock,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createRoomSchema, type CreateRoomInput } from "@/lib/validations";
import { getRooms } from "@/hooks/api/rooms/GetRooms";
import { createRoom } from "@/hooks/api/rooms/CreateRoom";
import { NotificationBadge } from "@/components/NotificationBadge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileDialog } from "@/components/ProfileDialog";

interface Room {
  id: string;
  name: string;
  description: string | null;
  type: "PUBLIC" | "PRIVATE" | "DIRECT";
  creator: {
    username: string;
  };
  _count: {
    members: number;
    messages: number;
  };
  messages: Array<{
    content: string;
    createdAt: string | Date;
  }>;
  members: Array<{
    unreadCount: number;
    userId: string;
  }>;
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchRooms();
    }
  }, [status, router]);

  const fetchRooms = async () => {
    try {
      const data = await getRooms();
      setRooms(data.rooms || []);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onCreateRoom = async (data: CreateRoomInput) => {
    setIsCreating(true);
    try {
      await createRoom(data);

      // Refetch all rooms to ensure we have all the required fields
      await fetchRooms();
      setIsDialogOpen(false);
      reset();
    } catch (error) {
      console.error("Failed to create room:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    router.push(`/chat/${roomId}`);
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Chat Rooms
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Selamat datang, {session.user.username}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsProfileOpen(true)}
                className="hover:opacity-80 transition-opacity"
                title="Edit Profile"
              >
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                    {session.user.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Semua Room
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {rooms.length} room tersedia
            </p>
          </div>

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
                    <p className="text-xs text-red-600">
                      {errors.name.message}
                    </p>
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
        </div>

        {/* Rooms Grid */}
        {rooms.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageSquare className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Belum ada room
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Buat room pertama Anda untuk mulai chatting
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <Card
                key={room.id}
                className="hover:shadow-lg transition-shadow cursor-pointer dark:bg-gray-900 dark:border-gray-800"
                onClick={() => handleJoinRoom(room.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 relative">
                      {room.type === "PUBLIC" ? (
                        <Hash className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Lock className="w-5 h-5 text-gray-600" />
                      )}
                      <CardTitle className="text-lg">{room.name}</CardTitle>
                      <NotificationBadge
                        count={
                          room.members.find((m) => m.userId === session.user.id)
                            ?.unreadCount || 0
                        }
                      />
                    </div>
                  </div>
                  {room.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {room.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{room._count.members} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{room._count.messages} pesan</span>
                    </div>
                  </div>
                  {room.messages[0] && (
                    <div className="mt-3 pt-3 border-t dark:border-gray-800">
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                        Pesan terakhir: {room.messages[0].content}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Profile Dialog */}
      <ProfileDialog
        open={isProfileOpen}
        onOpenChange={setIsProfileOpen}
        onProfileUpdated={fetchRooms}
      />
    </div>
  );
}

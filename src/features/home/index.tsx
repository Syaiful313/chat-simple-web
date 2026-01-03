"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getRooms } from "@/hooks/api/rooms/GetRooms";
import { ProfileDialog } from "@/components/ProfileDialog";
import { NewDMDialog } from "@/components/NewDMDialog";
import { LoadingState } from "./components/LoadingState";
import { HomeHeader } from "./components/HomeHeader";
import { MainContentHeader } from "./components/MainContent";
import { RoomList } from "./components/RoomList";
import type { Room } from "@/types/room";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDMDialogOpen, setIsDMDialogOpen] = useState(false);

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

  const handleJoinRoom = async (roomId: string) => {
    router.push(`/chat/${roomId}`);
  };

  if (status === "loading" || isLoading) {
    return <LoadingState />;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <HomeHeader
        username={session.user.username}
        onProfileClick={() => setIsProfileOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MainContentHeader
          roomCount={rooms.length}
          onNewDMClick={() => setIsDMDialogOpen(true)}
          onRoomCreated={fetchRooms}
        />

        <RoomList
          rooms={rooms}
          currentUserId={session.user.id}
          currentUsername={session.user.username}
          onJoinRoom={handleJoinRoom}
        />
      </main>

      <ProfileDialog
        open={isProfileOpen}
        onOpenChange={setIsProfileOpen}
        onProfileUpdated={fetchRooms}
      />

      <NewDMDialog open={isDMDialogOpen} onOpenChange={setIsDMDialogOpen} />
    </div>
  );
}

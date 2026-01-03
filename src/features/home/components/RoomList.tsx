import { RoomCard } from "./RoomCard";
import { EmptyRoomState } from "./EmptyRoomState";
import type { Room } from "@/types/room";

interface RoomListProps {
  rooms: Room[];
  currentUserId: string;
  currentUsername: string;
  onJoinRoom: (roomId: string) => void;
}

export const RoomList = ({
  rooms,
  currentUserId,
  currentUsername,
  onJoinRoom,
}: RoomListProps) => {
  if (rooms.length === 0) {
    return <EmptyRoomState />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {rooms.map((room) => (
        <RoomCard
          key={room.id}
          room={room}
          currentUserId={currentUserId}
          currentUsername={currentUsername}
          onJoinRoom={onJoinRoom}
        />
      ))}
    </div>
  );
};

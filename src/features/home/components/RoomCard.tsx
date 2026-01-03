import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationBadge } from "@/components/NotificationBadge";
import { Users, MessageSquare, Hash, Lock } from "lucide-react";
import type { Room } from "@/types/room";

interface RoomCardProps {
  room: Room;
  currentUserId: string;
  currentUsername: string;
  onJoinRoom: (roomId: string) => void;
}

export const RoomCard = ({
  room,
  currentUserId,
  currentUsername,
  onJoinRoom,
}: RoomCardProps) => {
  const unreadCount =
    room.members?.find((m) => m.userId === currentUserId)?.unreadCount || 0;

  const displayName =
    room.type === "DIRECT"
      ? room.name
          .replace("DM: ", "")
          .replace(` & ${currentUsername}`, "")
          .replace(`${currentUsername} & `, "")
      : room.name;

  const getRoomIcon = () => {
    if (room.type === "DIRECT") {
      return <MessageSquare className="w-5 h-5 text-green-600" />;
    }
    if (room.type === "PUBLIC") {
      return <Hash className="w-5 h-5 text-blue-600" />;
    }
    return <Lock className="w-5 h-5 text-gray-600" />;
  };

  const getRoomBadgeStyle = () => {
    if (room.type === "DIRECT") {
      return "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300";
    }
    if (room.type === "PUBLIC") {
      return "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300";
    }
    return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300";
  };

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer dark:bg-gray-900 dark:border-gray-800"
      onClick={() => onJoinRoom(room.id)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 relative">
            {getRoomIcon()}
            <CardTitle className="text-lg">{displayName}</CardTitle>
            <NotificationBadge count={unreadCount} />
          </div>
          <span
            className={`text-xs px-2 py-1 rounded-full ${getRoomBadgeStyle()}`}
          >
            {room.type === "DIRECT" ? "DM" : room.type}
          </span>
        </div>
        {room.description && room.type !== "DIRECT" && (
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
        {room.messages?.[0] && (
          <div className="mt-3 pt-3 border-t dark:border-gray-800">
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
              Pesan terakhir: {room.messages[0].content}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

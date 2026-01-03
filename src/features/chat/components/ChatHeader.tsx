import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Hash, Lock, Settings } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface ChatHeaderProps {
  roomName: string;
  roomDescription: string | null;
  roomType: "PUBLIC" | "PRIVATE" | "DIRECT";
  memberCount: number;
  canManageRoom: boolean;
  onBack: () => void;
  onSettingsClick: () => void;
}

export const ChatHeader = ({
  roomName,
  roomDescription,
  roomType,
  memberCount,
  canManageRoom,
  onBack,
  onSettingsClick,
}: ChatHeaderProps) => {
  return (
    <div className="p-4 border-b dark:border-gray-800 bg-white dark:bg-gray-900 z-10 sticky top-0">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
          <ArrowLeft className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-2 flex-1">
          {roomType === "PUBLIC" ? (
            <Hash className="w-5 h-5 text-blue-600" />
          ) : (
            <Lock className="w-5 h-5 text-gray-600" />
          )}
          <div>
            <h1 className="text-lg font-bold dark:text-gray-100">{roomName}</h1>
            {roomDescription && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {roomDescription}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Users className="w-4 h-4" />
          <span>{memberCount}</span>
          <ThemeToggle />
          {canManageRoom && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSettingsClick}
              className="h-8 w-8 p-0"
              title="Room Settings"
            >
              <Settings className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

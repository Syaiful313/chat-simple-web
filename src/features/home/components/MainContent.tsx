import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { CreateRoomDialog } from "./CreateRoomDialog";

interface MainContentHeaderProps {
  roomCount: number;
  onNewDMClick: () => void;
  onRoomCreated: () => void;
}

export const MainContentHeader = ({
  roomCount,
  onNewDMClick,
  onRoomCreated,
}: MainContentHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Rooms & Messages
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {roomCount} room tersedia
        </p>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onNewDMClick}>
          <MessageSquare className="w-4 h-4 mr-2" />
          New DM
        </Button>

        <CreateRoomDialog onRoomCreated={onRoomCreated} />
      </div>
    </div>
  );
};

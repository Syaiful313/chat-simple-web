import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface MessageActionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

export const MessageActions = ({ onEdit, onDelete }: MessageActionsProps) => {
  return (
    <div className="absolute top-0 -left-20 opacity-0 group-hover/msg:opacity-100 transition-opacity flex gap-1 items-center h-full">
      <Button
        size="sm"
        variant="ghost"
        onClick={onEdit}
        className="h-8 w-8 p-0 bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full shadow-sm"
      >
        <Pencil className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={onDelete}
        className="h-8 w-8 p-0 bg-gray-100 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900 rounded-full shadow-sm"
      >
        <Trash2 className="w-3.5 h-3.5 text-red-500" />
      </Button>
    </div>
  );
};

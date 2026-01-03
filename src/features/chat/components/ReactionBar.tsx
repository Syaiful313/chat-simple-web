import { Smile } from "lucide-react";
import { ReactionPicker } from "@/components/ReactionPicker";
import type { MessageReaction } from "@/types/message";

interface ReactionBarProps {
  reactions: MessageReaction[];
  showPicker: boolean;
  onReactionClick: (emoji: string) => void;
  onPickerToggle: () => void;
  onPickerClose: () => void;
}

export const ReactionBar = ({
  reactions,
  showPicker,
  onReactionClick,
  onPickerToggle,
  onPickerClose,
}: ReactionBarProps) => {
  return (
    <div className="flex gap-1 mt-1 flex-wrap items-center">
      {reactions.map((reaction) => (
        <button
          key={reaction.emoji}
          onClick={() => onReactionClick(reaction.emoji)}
          className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs flex items-center gap-1 transition-colors"
          title={`${reaction.users.length} reaction${reaction.users.length > 1 ? "s" : ""}`}
        >
          <span>{reaction.emoji}</span>
          <span className="text-gray-600">{reaction.count}</span>
        </button>
      ))}
      <div className="relative">
        <button
          onClick={onPickerToggle}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Smile className="w-4 h-4 text-gray-400" />
        </button>
        {showPicker && (
          <ReactionPicker onReact={onReactionClick} onClose={onPickerClose} />
        )}
      </div>
    </div>
  );
};

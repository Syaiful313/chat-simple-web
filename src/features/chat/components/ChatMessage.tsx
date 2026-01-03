import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { OnlineStatus } from "@/components/OnlineStatus";
import { ImageMessage } from "@/components/ImageMessage";
import { Trash2 } from "lucide-react";
import { MessageActions } from "./MessageActions";
import { MessageEditForm } from "./MessageEditForm";
import { ReactionBar } from "./ReactionBar";
import type { Message, MessageReaction, UserStatus } from "@/types/message";

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
  userStatus: UserStatus;
  reactions: MessageReaction[];
  isEditing: boolean;
  editContent: string;
  showReactionPicker: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onEditContentChange: (value: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onReaction: (emoji: string) => void;
  onReactionPickerToggle: () => void;
  onReactionPickerClose: () => void;
}

export const ChatMessage = ({
  message,
  isCurrentUser,
  userStatus,
  reactions,
  isEditing,
  editContent,
  showReactionPicker,
  onEdit,
  onDelete,
  onEditContentChange,
  onSaveEdit,
  onCancelEdit,
  onReaction,
  onReactionPickerToggle,
  onReactionPickerClose,
}: ChatMessageProps) => {
  return (
    <div
      className={`flex gap-2 ${isCurrentUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar with status */}
      <div className="relative">
        <Avatar className="w-8 h-8">
          <AvatarFallback
            className={
              isCurrentUser
                ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                : "bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
            }
          >
            {message.user.username[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="absolute bottom-0 right-0">
          <OnlineStatus status={userStatus} size="sm" />
        </div>
      </div>

      {/* Message content */}
      <div
        className={`flex flex-col max-w-[75%] ${isCurrentUser ? "items-end" : "items-start"}`}
      >
        {/* Time and username */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-gray-400">
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {!isCurrentUser && (
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
              {message.user.username}
            </span>
          )}
        </div>

        {/* Edit form or message content */}
        {isEditing ? (
          <MessageEditForm
            content={editContent}
            onChange={onEditContentChange}
            onSave={onSaveEdit}
            onCancel={onCancelEdit}
          />
        ) : (
          <div className="group/msg relative">
            {/* Image or text message */}
            {message.type === "IMAGE" ? (
              <div className="relative">
                <ImageMessage src={message.content} alt="Shared image" />
                {isCurrentUser && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover/msg:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={onDelete}
                      className="h-8 w-8 p-0 rounded-full shadow-md"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div
                className={`px-4 py-2 rounded-2xl text-sm relative ${
                  isCurrentUser
                    ? "bg-blue-600 dark:bg-blue-700 text-white rounded-tr-none"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none"
                }`}
              >
                {message.content}
                {message.edited && (
                  <span className="text-[10px] ml-1 opacity-70 italic">
                    (edited)
                  </span>
                )}
              </div>
            )}

            {/* Edit/Delete actions for text messages */}
            {isCurrentUser && message.type === "TEXT" && (
              <MessageActions onEdit={onEdit} onDelete={onDelete} />
            )}
          </div>
        )}

        {/* Reactions */}
        <ReactionBar
          reactions={reactions}
          showPicker={showReactionPicker}
          onReactionClick={onReaction}
          onPickerToggle={onReactionPickerToggle}
          onPickerClose={onReactionPickerClose}
        />
      </div>
    </div>
  );
};

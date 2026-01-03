"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TypingIndicator } from "@/components/TypingIndicator";
import { ImageUpload } from "@/components/ImageUpload";
import { RoomSettingsDialog } from "@/components/RoomSettingsDialog";
import { useTyping } from "@/hooks/UseTyping";
import { useNotifications } from "@/hooks/UseNotifications";
import { useSocket } from "@/hooks/useSocket";
import { getRoom } from "@/hooks/api/rooms/GetRoom";
import { toggleReaction } from "@/hooks/api/messages/ToggleReaction";
import { ChatHeader } from "./components/ChatHeader";
import { ChatMessage } from "./components/ChatMessage";
import { MessageInput } from "./components/MessageInput";
import { EmptyMessages } from "./components/EmptyMessages";
import type { Room } from "@/types/room";

export default function ChatRoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const resolvedParams = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(
    null,
  );
  const [isRoomSettingsOpen, setIsRoomSettingsOpen] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { showNotification } = useNotifications();

  // Socket hook
  const {
    socket,
    messages,
    typingUsers,
    userStatuses,
    messageReactions,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    removeReaction,
  } = useSocket({
    roomId: resolvedParams.roomId,
    userId: session?.user?.id || "",
    username: session?.user?.username || "",
    onNewMessage: (msg) => {
      if (msg.user.username !== session?.user.username) {
        showNotification(
          `New message from ${msg.user.username}`,
          msg.content.length > 50
            ? msg.content.substring(0, 50) + "..."
            : msg.content,
        );
      }
      scrollToBottom();
    },
  });

  // Typing hook
  const { emitTyping, stopTyping } = useTyping({
    socket,
    roomId: resolvedParams.roomId,
    userId: session?.user?.id || "",
    username: session?.user?.username || "",
  });

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        const scrollElement = scrollRef.current.querySelector(
          "[data-radix-scroll-area-viewport]",
        );
        if (scrollElement) {
          scrollElement.scrollTop = scrollElement.scrollHeight;
        }
      }
    }, 100);
  };

  const fetchRoomData = useCallback(async () => {
    try {
      const data = await getRoom(resolvedParams.roomId);
      setRoom(data.room as Room);
    } catch (error) {
      console.error("Failed to fetch room:", error);
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  }, [resolvedParams.roomId, router]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchRoomData();
    }
  }, [status, fetchRoomData, router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (value.trim()) {
      emitTyping();
    } else {
      stopTyping();
    }
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputValue.trim()) {
      stopTyping();
      sendMessage(inputValue, "TEXT");
      setInputValue("");
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    sendMessage(imageUrl, "IMAGE");
    setShowImageUpload(false);
  };

  const handleEditMessage = (messageId: string, content: string) => {
    setEditingMessageId(messageId);
    setEditContent(content);
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editingMessageId) {
      editMessage(editingMessageId, editContent);
      setEditingMessageId(null);
      setEditContent("");
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditContent("");
  };

  const handleDeleteMessage = (messageId: string) => {
    if (confirm("Are you sure you want to delete this message?")) {
      deleteMessage(messageId);
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!session?.user) return;

    try {
      const data = await toggleReaction(messageId, emoji);

      if (data.action === "added") {
        addReaction(messageId, emoji);
      } else {
        removeReaction(messageId, emoji);
      }
    } catch (error) {
      console.error("Failed to react:", error);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!session || !room) {
    return null;
  }

  const canManageRoom =
    room.creatorId === session.user.id ||
    (room.members?.some(
      (m) => m.userId === session.user.id && m.role === "ADMIN",
    ) ??
      false);

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white dark:bg-gray-950 border-x border-gray-200 dark:border-gray-800">
      <ChatHeader
        roomName={room.name}
        roomDescription={room.description}
        roomType={room.type}
        memberCount={room._count.members}
        canManageRoom={canManageRoom}
        onBack={() => router.push("/")}
        onSettingsClick={() => setIsRoomSettingsOpen(true)}
      />

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4 pb-4">
          {messages.length === 0 ? (
            <EmptyMessages />
          ) : (
            messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                isCurrentUser={msg.user.username === session.user.username}
                userStatus={userStatuses.get(msg.user.id) || "OFFLINE"}
                reactions={messageReactions.get(msg.id) || []}
                isEditing={editingMessageId === msg.id}
                editContent={editContent}
                showReactionPicker={showReactionPicker === msg.id}
                onEdit={() => handleEditMessage(msg.id, msg.content)}
                onDelete={() => handleDeleteMessage(msg.id)}
                onEditContentChange={setEditContent}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                onReaction={(emoji) => handleReaction(msg.id, emoji)}
                onReactionPickerToggle={() =>
                  setShowReactionPicker(
                    showReactionPicker === msg.id ? null : msg.id,
                  )
                }
                onReactionPickerClose={() => setShowReactionPicker(null)}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Typing Indicator */}
      <TypingIndicator typingUsers={typingUsers} />

      {/* Input */}
      {showImageUpload ? (
        <div className="p-4 bg-white dark:bg-gray-900 border-t dark:border-gray-800">
          <ImageUpload
            onImageSelect={handleImageSelect}
            onCancel={() => setShowImageUpload(false)}
          />
        </div>
      ) : (
        <MessageInput
          value={inputValue}
          onChange={handleInputChange}
          onSubmit={handleSendMessage}
          onImageClick={() => setShowImageUpload(true)}
        />
      )}

      {/* Room Settings Dialog */}
      {room && (
        <RoomSettingsDialog
          open={isRoomSettingsOpen}
          onOpenChange={setIsRoomSettingsOpen}
          roomId={room.id}
          isCreator={room.creatorId === session.user.id}
          onRoomUpdated={fetchRoomData}
          onRoomDeleted={() => router.push("/")}
        />
      )}
    </div>
  );
}

"use client";

import { useEffect, useState, useRef, use, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Send,
  Users,
  Loader2,
  Hash,
  Lock,
  Smile,
  Settings,
  Image as ImageIcon,
  Pencil,
  Trash2,
  X,
  Check,
} from "lucide-react";
import { TypingIndicator } from "@/components/TypingIndicator";
import { useTyping } from "@/hooks/UseTyping";
import { OnlineStatus } from "@/components/OnlineStatus";
import { ReactionPicker } from "@/components/ReactionPicker";
import { useNotifications } from "@/hooks/UseNotifications";
import { ThemeToggle } from "@/components/ThemeToggle";
import { RoomSettingsDialog } from "@/components/RoomSettingsDialog";
import { ImageUpload } from "@/components/ImageUpload";
import { ImageMessage } from "@/components/ImageMessage";
import { getRoom } from "@/hooks/api/rooms/GetRoom";
import { toggleReaction } from "@/hooks/api/messages/ToggleReaction";

interface Message {
  id: string;
  content: string;
  type?: string;
  edited?: boolean;
  createdAt: string | Date;
  user: {
    id: string;
    username: string;
    avatar: string | null;
  };
}

interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
}

interface Room {
  id: string;
  name: string;
  description: string | null;
  type: "PUBLIC" | "PRIVATE" | "DIRECT";
  creatorId: string;
  members?: Array<{
    userId: string;
    role: string;
  }>;
  _count: {
    members: number;
  };
}

let socket: Socket;

export default function ChatRoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const resolvedParams = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [userStatuses, setUserStatuses] = useState<
    Map<string, "ONLINE" | "OFFLINE" | "AWAY">
  >(new Map());
  const [messageReactions, setMessageReactions] = useState<
    Map<string, MessageReaction[]>
  >(new Map());
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(
    null,
  );
  const [isRoomSettingsOpen, setIsRoomSettingsOpen] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const { showNotification } = useNotifications();

  const handleEditMessage = (msg: Message) => {
    setEditingMessageId(msg.id);
    setEditContent(msg.content);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditContent("");
  };

  const handleSaveEdit = () => {
    if (!editContent.trim() || !editingMessageId) return;
    socket.emit("edit_message", {
      messageId: editingMessageId,
      newContent: editContent,
      userId: session?.user.id,
      roomId: resolvedParams.roomId,
    });
    setEditingMessageId(null);
    setEditContent("");
  };

  const handleDeleteMessage = (messageId: string) => {
    if (confirm("Are you sure you want to delete this message?")) {
      socket.emit("delete_message", {
        messageId,
        userId: session?.user.id,
        roomId: resolvedParams.roomId,
      });
    }
  };

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

  const initializeSocket = useCallback(() => {
    socket = io("http://localhost:3001");

    socket.on("connect", () => {
      console.log("Connected to socket server");
      socket.emit("join_room", {
        roomId: resolvedParams.roomId,
        userId: session?.user.id,
      });
      socket.emit("get_room_messages", resolvedParams.roomId);
    });

    socket.on("room_messages", (msgs: Message[]) => {
      setMessages(msgs);
      scrollToBottom();
    });

    socket.on("new_message", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);

      // Show notification if not from current user
      if (msg.user.username !== session?.user.username) {
        showNotification(
          `New message from ${msg.user.username}`,
          msg.content.length > 50
            ? msg.content.substring(0, 50) + "..."
            : msg.content,
        );
      }

      scrollToBottom();
    });

    socket.on("user_joined", (data: { username: string }) => {
      console.log(`${data.username} joined the room`);
    });

    socket.on("user_left", (data: { username: string }) => {
      console.log(`${data.username} left the room`);
    });

    // User status events
    socket.on(
      "user_status_changed",
      (data: { userId: string; status: "ONLINE" | "OFFLINE" | "AWAY" }) => {
        setUserStatuses((prev) => {
          const newMap = new Map(prev);
          newMap.set(data.userId, data.status);
          return newMap;
        });
      },
    );

    // Reaction events
    socket.on(
      "reaction_added",
      (data: { messageId: string; emoji: string; userId: string }) => {
        setMessageReactions((prev) => {
          const newMap = new Map(prev);
          const reactions = newMap.get(data.messageId) || [];

          const existingReaction = reactions.find(
            (r) => r.emoji === data.emoji,
          );
          if (existingReaction) {
            existingReaction.count++;
            if (!existingReaction.users.includes(data.userId)) {
              existingReaction.users.push(data.userId);
            }
          } else {
            reactions.push({
              emoji: data.emoji,
              count: 1,
              users: [data.userId],
            });
          }

          newMap.set(data.messageId, reactions);
          return newMap;
        });
      },
    );

    socket.on("message_updated", (updatedMsg: Message) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === updatedMsg.id ? updatedMsg : msg)),
      );
    });

    socket.on("message_deleted", (deletedMsgId: string) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== deletedMsgId));
    });

    socket.on(
      "reaction_removed",
      (data: { messageId: string; emoji: string; userId: string }) => {
        setMessageReactions((prev) => {
          const newMap = new Map(prev);
          const reactions = newMap.get(data.messageId) || [];

          const reactionIndex = reactions.findIndex(
            (r) => r.emoji === data.emoji,
          );
          if (reactionIndex !== -1) {
            reactions[reactionIndex].count--;
            reactions[reactionIndex].users = reactions[
              reactionIndex
            ].users.filter((u) => u !== data.userId);

            if (reactions[reactionIndex].count === 0) {
              reactions.splice(reactionIndex, 1);
            }
          }

          newMap.set(data.messageId, reactions.length > 0 ? reactions : []);
          return newMap;
        });
      },
    );

    // Typing indicator events
    socket.on("user_typing", (data: { userId: string; username: string }) => {
      setTypingUsers((prev) => {
        if (!prev.includes(data.username)) {
          return [...prev, data.username];
        }
        return prev;
      });

      // Auto-remove after 3 seconds
      const existingTimeout = typingTimeoutsRef.current.get(data.userId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      const timeout = setTimeout(() => {
        setTypingUsers((prev) => prev.filter((u) => u !== data.username));
        typingTimeoutsRef.current.delete(data.userId);
      }, 3000);

      typingTimeoutsRef.current.set(data.userId, timeout);
    });

    socket.on("user_stopped_typing", (data: { userId: string }) => {
      const timeout = typingTimeoutsRef.current.get(data.userId);
      if (timeout) {
        clearTimeout(timeout);
        typingTimeoutsRef.current.delete(data.userId);
      }
      setTypingUsers((prev) =>
        prev.filter((u) => u !== prev.find((username) => username)),
      );
    });
  }, [
    resolvedParams.roomId,
    session?.user.id,
    session?.user.username,
    showNotification,
  ]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchRoomData();
      initializeSocket();
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [status, resolvedParams.roomId, fetchRoomData, initializeSocket, router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Typing hook
  const { emitTyping, stopTyping } = useTyping({
    socket,
    roomId: resolvedParams.roomId,
    userId: session?.user?.id || "",
    username: session?.user?.username || "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (e.target.value.trim()) {
      emitTyping();
    } else {
      stopTyping();
    }
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputValue.trim() && session?.user) {
      stopTyping();
      socket.emit("send_room_message", {
        roomId: resolvedParams.roomId,
        userId: session.user.id,
        username: session.user.username,
        content: inputValue,
        type: "TEXT",
      });
      setInputValue("");
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    if (session?.user) {
      socket.emit("send_room_message", {
        roomId: resolvedParams.roomId,
        userId: session.user.id,
        username: session.user.username,
        content: imageUrl,
        type: "IMAGE",
      });
      setShowImageUpload(false);
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!session?.user) return;

    try {
      // Call Server Action
      const data = await toggleReaction(messageId, emoji);

      // Emit socket event
      if (data.action === "added") {
        socket.emit("add_reaction", {
          messageId,
          emoji,
          userId: session.user.id,
          roomId: resolvedParams.roomId,
        });
      } else {
        socket.emit("remove_reaction", {
          messageId,
          emoji,
          userId: session.user.id,
          roomId: resolvedParams.roomId,
        });
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

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white dark:bg-gray-950 border-x border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="p-4 border-b dark:border-gray-800 bg-white dark:bg-gray-900 z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="mr-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-2 flex-1">
            {room.type === "PUBLIC" ? (
              <Hash className="w-5 h-5 text-blue-600" />
            ) : (
              <Lock className="w-5 h-5 text-gray-600" />
            )}
            <div>
              <h1 className="text-lg font-bold dark:text-gray-100">
                {room.name}
              </h1>
              {room.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {room.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Users className="w-4 h-4" />
            <span>{room._count.members}</span>
            <ThemeToggle />
            {/* Settings button - only show for creator or admin */}
            {(room.creatorId === session.user.id ||
              room.members?.some(
                (m: { userId: string; role: string }) =>
                  m.userId === session.user.id && m.role === "ADMIN",
              )) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsRoomSettingsOpen(true)}
                className="h-8 w-8 p-0"
                title="Room Settings"
              >
                <Settings className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4 pb-4">
          {messages.map((msg) => {
            const isMe = msg.user.username === session.user.username;
            const reactions = messageReactions.get(msg.id) || [];
            return (
              <div
                key={msg.id}
                className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
              >
                <div className="relative">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback
                      className={
                        isMe
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                          : "bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
                      }
                    >
                      {msg.user.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0">
                    <OnlineStatus
                      status={userStatuses.get(msg.user.id) || "OFFLINE"}
                      size="sm"
                    />
                  </div>
                </div>

                <div
                  className={`flex flex-col max-w-[75%] ${isMe ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-400">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {!isMe && (
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                        {msg.user.username}
                      </span>
                    )}
                  </div>
                  {/* Message Content or Edit Form */}
                  {editingMessageId === msg.id ? (
                    <div className="flex flex-col gap-2 items-end min-w-[200px]">
                      <Input
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="bg-gray-100 dark:bg-gray-800"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            handleSaveEdit();
                          } else if (e.key === "Escape") {
                            handleCancelEdit();
                          }
                        }}
                      />
                      <div className="flex gap-1 bg-white dark:bg-gray-900 rounded-md shadow-sm border border-gray-100 dark:border-gray-800">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCancelEdit}
                          className="h-8 w-8 p-0 hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleSaveEdit}
                          className="h-8 w-8 p-0 hover:text-green-600"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="group/msg relative">
                      {msg.type === "IMAGE" ? (
                        <div className="relative">
                          <ImageMessage src={msg.content} alt="Shared image" />
                          {isMe && (
                            <div className="absolute top-2 right-2 opacity-0 group-hover/msg:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteMessage(msg.id)}
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
                            isMe
                              ? "bg-blue-600 dark:bg-blue-700 text-white rounded-tr-none"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none"
                          }`}
                        >
                          {msg.content}
                          {msg.edited && (
                            <span className="text-[10px] ml-1 opacity-70 italic">
                              (edited)
                            </span>
                          )}
                        </div>
                      )}

                      {/* Edit/Delete Actions for text messages */}
                      {isMe && msg.type === "TEXT" && (
                        <div className="absolute top-0 -left-20 opacity-0 group-hover/msg:opacity-100 transition-opacity flex gap-1 items-center h-full">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditMessage(msg)}
                            className="h-8 w-8 p-0 bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full shadow-sm"
                          >
                            <Pencil className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="h-8 w-8 p-0 bg-gray-100 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900 rounded-full shadow-sm"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reactions */}
                  <div className="flex gap-1 mt-1 flex-wrap items-center">
                    {reactions.map((reaction) => (
                      <button
                        key={reaction.emoji}
                        onClick={() => handleReaction(msg.id, reaction.emoji)}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs flex items-center gap-1 transition-colors"
                        title={`${reaction.users.length} reaction${reaction.users.length > 1 ? "s" : ""}`}
                      >
                        <span>{reaction.emoji}</span>
                        <span className="text-gray-600">{reaction.count}</span>
                      </button>
                    ))}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowReactionPicker(
                            showReactionPicker === msg.id ? null : msg.id,
                          )
                        }
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <Smile className="w-4 h-4 text-gray-400" />
                      </button>
                      {showReactionPicker === msg.id && (
                        <ReactionPicker
                          onReact={(emoji) => handleReaction(msg.id, emoji)}
                          onClose={() => setShowReactionPicker(null)}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {messages.length === 0 && (
            <div className="text-center text-gray-400 dark:text-gray-600 mt-10">
              Belum ada pesan. Mulai percakapan!
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Typing Indicator */}
      <TypingIndicator typingUsers={typingUsers} />

      {/* Input */}
      <div className="p-4 bg-white dark:bg-gray-900 border-t dark:border-gray-800">
        {showImageUpload ? (
          <ImageUpload
            onImageSelect={handleImageSelect}
            onCancel={() => setShowImageUpload(false)}
          />
        ) : (
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowImageUpload(true)}
              className="h-10 w-10 p-0"
              title="Upload Image"
            >
              <ImageIcon className="w-5 h-5" />
            </Button>
            <Input
              placeholder="Ketik pesan..."
              value={inputValue}
              onChange={handleInputChange}
              className="flex-1"
              autoFocus
            />
            <Button type="submit" disabled={!inputValue.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        )}
      </div>

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

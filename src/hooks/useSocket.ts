import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { Message, MessageReaction, UserStatus } from "@/types/message";

interface UseSocketProps {
  roomId: string;
  userId: string;
  username: string;
  onNewMessage?: (message: Message) => void;
}

let socket: Socket;

export function useSocket({
  roomId,
  userId,
  username,
  onNewMessage,
}: UseSocketProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [userStatuses, setUserStatuses] = useState<Map<string, UserStatus>>(
    new Map(),
  );
  const [messageReactions, setMessageReactions] = useState<
    Map<string, MessageReaction[]>
  >(new Map());

  const typingTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const initializeSocket = useCallback(() => {
    socket = io("http://localhost:3001");

    socket.on("connect", () => {
      console.log("Connected to socket server");
      socket.emit("join_room", { roomId, userId });
      socket.emit("get_room_messages", roomId);
    });

    socket.on("room_messages", (msgs: Message[]) => {
      setMessages(msgs);
    });

    socket.on("new_message", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
      onNewMessage?.(msg);
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
      (data: { userId: string; status: UserStatus }) => {
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

    socket.on("message_updated", (updatedMsg: Message) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === updatedMsg.id ? updatedMsg : msg)),
      );
    });

    socket.on("message_deleted", (deletedMsgId: string) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== deletedMsgId));
    });

    // Typing indicator events
    socket.on("user_typing", (data: { userId: string; username: string }) => {
      setTypingUsers((prev) => {
        if (!prev.includes(data.username)) {
          return [...prev, data.username];
        }
        return prev;
      });

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
    });
  }, [roomId, userId, onNewMessage]);

  useEffect(() => {
    initializeSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [initializeSocket]);

  const sendMessage = useCallback(
    (content: string, type: "TEXT" | "IMAGE" = "TEXT") => {
      if (socket) {
        socket.emit("send_room_message", {
          roomId,
          userId,
          username,
          content,
          type,
        });
      }
    },
    [roomId, userId, username],
  );

  const editMessage = useCallback(
    (messageId: string, newContent: string) => {
      if (socket) {
        socket.emit("edit_message", {
          messageId,
          newContent,
          userId,
          roomId,
        });
      }
    },
    [userId, roomId],
  );

  const deleteMessage = useCallback(
    (messageId: string) => {
      if (socket) {
        socket.emit("delete_message", {
          messageId,
          userId,
          roomId,
        });
      }
    },
    [userId, roomId],
  );

  const addReaction = useCallback(
    (messageId: string, emoji: string) => {
      if (socket) {
        socket.emit("add_reaction", {
          messageId,
          emoji,
          userId,
          roomId,
        });
      }
    },
    [userId, roomId],
  );

  const removeReaction = useCallback(
    (messageId: string, emoji: string) => {
      if (socket) {
        socket.emit("remove_reaction", {
          messageId,
          emoji,
          userId,
          roomId,
        });
      }
    },
    [userId, roomId],
  );

  return {
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
  };
}

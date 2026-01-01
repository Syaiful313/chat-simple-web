import { useEffect, useRef, useCallback } from "react";
import { Socket } from "socket.io-client";

interface UseTypingProps {
  socket: Socket | null;
  roomId: string;
  userId: string;
  username: string;
}

export function useTyping({
  socket,
  roomId,
  userId,
  username,
}: UseTypingProps) {
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  const emitTyping = useCallback(() => {
    if (!socket || !roomId) return;

    if (!isTypingRef.current) {
      socket.emit("typing", { roomId, userId, username });
      isTypingRef.current = true;
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (socket && isTypingRef.current) {
        socket.emit("stop_typing", { roomId, userId });
        isTypingRef.current = false;
      }
    }, 2000);
  }, [socket, roomId, userId, username]);

  const stopTyping = useCallback(() => {
    if (!socket || !isTypingRef.current) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    socket.emit("stop_typing", { roomId, userId });
    isTypingRef.current = false;
  }, [socket, roomId, userId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (socket && isTypingRef.current) {
        socket.emit("stop_typing", { roomId, userId });
      }
    };
  }, [socket, roomId, userId]);

  return { emitTyping, stopTyping };
}

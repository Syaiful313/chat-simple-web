"use client";

import { useEffect, useState, useRef, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Send, Users, Loader2, Hash, Lock } from "lucide-react";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  user: {
    username: string;
    avatar: string | null;
  };
}

interface Room {
  id: string;
  name: string;
  description: string | null;
  type: "PUBLIC" | "PRIVATE";
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
  const scrollRef = useRef<HTMLDivElement>(null);

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
  }, [status, resolvedParams.roomId]);

  const fetchRoomData = async () => {
    try {
      const res = await fetch(`/api/rooms/${resolvedParams.roomId}`);
      if (!res.ok) throw new Error("Room not found");
      const data = await res.json();
      setRoom(data.room);
    } catch (error) {
      console.error("Failed to fetch room:", error);
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  };

  const initializeSocket = () => {
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
      scrollToBottom();
    });

    socket.on("user_joined", (data: { username: string }) => {
      console.log(`${data.username} joined the room`);
    });

    socket.on("user_left", (data: { username: string }) => {
      console.log(`${data.username} left the room`);
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputValue.trim() && session?.user) {
      socket.emit("send_room_message", {
        roomId: resolvedParams.roomId,
        userId: session.user.id,
        username: session.user.username,
        content: inputValue,
      });
      setInputValue("");
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
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white border-x border-gray-200">
      {/* Header */}
      <div className="p-4 border-b bg-white z-10 sticky top-0">
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
              <h1 className="text-lg font-bold">{room.name}</h1>
              {room.description && (
                <p className="text-xs text-gray-500">{room.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            <span>{room._count.members}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4 pb-4">
          {messages.map((msg) => {
            const isMe = msg.user.username === session.user.username;
            return (
              <div
                key={msg.id}
                className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback
                    className={
                      isMe ? "bg-blue-100 text-blue-600" : "bg-gray-100"
                    }
                  >
                    {msg.user.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>

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
                      <span className="text-xs font-semibold text-gray-600">
                        {msg.user.username}
                      </span>
                    )}
                  </div>
                  <div
                    className={`px-4 py-2 rounded-2xl text-sm ${
                      isMe
                        ? "bg-blue-600 text-white rounded-tr-none"
                        : "bg-gray-100 text-gray-800 rounded-tl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })}
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-10">
              Belum ada pesan. Mulai percakapan!
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 bg-white border-t">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            placeholder="Ketik pesan..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1"
            autoFocus
          />
          <Button type="submit" disabled={!inputValue.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

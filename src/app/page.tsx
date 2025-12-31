"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Tipe data pesan sesuai Prisma Schema
interface Message {
  id: string;
  content: string;
  createdAt: string;
  user: {
    username: string;
  };
}

let socket: Socket;

export default function ChatPage() {
  const [username, setUsername] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll ke bawah saat ada pesan baru
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
    // Inisialisasi Socket connection
    socket = io("http://localhost:3001");

    socket.on("connect", () => {
      console.log("Connected to socket server");
      // Minta pesan lama saat connect
      socket.emit("get_messages");
    });

    socket.on("initial_messages", (msgs: Message[]) => {
      setMessages(msgs);
      scrollToBottom();
    });

    socket.on("receive_message", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Panggil scroll saat messages berubah
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleJoin = () => {
    if (username.trim()) {
      setIsJoined(true);
      scrollToBottom();
    }
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputValue.trim() && username) {
      socket.emit("send_message", {
        username: username,
        content: inputValue,
      });
      setInputValue("");
    }
  };

  // Tampilan Login (Input Username)
  if (!isJoined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-87.5">
          <CardHeader>
            <CardTitle className="text-center">Masuk Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <Input
                placeholder="Masukkan Username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              />
              <Button onClick={handleJoin} className="w-full">
                Gabung
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Tampilan Chat Utama
  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-white border-x border-gray-200 shadow-sm">
      <div className="p-4 border-b bg-white z-10 sticky top-0">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
          Live Chat
        </h1>
        <p className="text-sm text-gray-500">
          Login sebagai: <span className="font-semibold">{username}</span>
        </p>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4 pb-4">
          {messages.map((msg) => {
            const isMe = msg.user.username === username;
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
              Belum ada pesan. Mulailah percakapan!
            </div>
          )}
        </div>
      </ScrollArea>

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
            Kirim
          </Button>
        </form>
      </div>
    </div>
  );
}

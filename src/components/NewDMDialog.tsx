"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, MessageSquare, Search } from "lucide-react";
import { getAvailableUsers } from "@/hooks/api/user/GetAvailableUsers";
import { createDirectMessage } from "@/hooks/api/rooms/CreateDirectMessage";
import { OnlineStatus } from "@/components/OnlineStatus";

interface User {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  status: "ONLINE" | "OFFLINE" | "AWAY";
  bio: string | null;
}

interface NewDMDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewDMDialog({ open, onOpenChange }: NewDMDialogProps) {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(
          (user) =>
            user.username.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query),
        ),
      );
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await getAvailableUsers();
      setUsers(data.users);
      setFilteredUsers(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDM = async (userId: string) => {
    setIsCreating(true);
    setError("");
    try {
      const { room } = await createDirectMessage(userId);
      onOpenChange(false);
      router.push(`/chat/${room.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create DM");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            New Direct Message
          </DialogTitle>
          <DialogDescription>
            Pilih user untuk memulai percakapan langsung
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Cari username atau email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              {error}
            </div>
          )}

          {/* Users List */}
          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {searchQuery
                  ? "Tidak ada user yang ditemukan"
                  : "Tidak ada user tersedia"}
              </div>
            ) : (
              filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleCreateDM(user.id)}
                  disabled={isCreating}
                  className="w-full p-3 flex items-center gap-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      {user.avatar ? (
                        <AvatarImage src={user.avatar} alt={user.username} />
                      ) : null}
                      <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                        {user.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0">
                      <OnlineStatus status={user.status} size="sm" />
                    </div>
                  </div>

                  <div className="flex-1 text-left">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      {user.username}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {user.bio || user.email}
                    </div>
                  </div>

                  {isCreating && (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

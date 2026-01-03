import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, MessageSquare } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface HomeHeaderProps {
  username: string;
  onProfileClick: () => void;
}

export const HomeHeader = ({ username, onProfileClick }: HomeHeaderProps) => {
  return (
    <header className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Chat Rooms
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Selamat datang, {username}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onProfileClick}
              className="hover:opacity-80 transition-opacity"
              title="Edit Profile"
            >
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                  {username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </button>
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

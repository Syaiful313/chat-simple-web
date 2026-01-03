import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export const EmptyRoomState = () => {
  return (
    <Card className="p-12 text-center">
      <MessageSquare className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Belum ada room
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Buat room pertama Anda untuk mulai chatting
      </p>
    </Card>
  );
};

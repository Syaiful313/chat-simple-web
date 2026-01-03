import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Check } from "lucide-react";

interface MessageEditFormProps {
  content: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const MessageEditForm = ({
  content,
  onChange,
  onSave,
  onCancel,
}: MessageEditFormProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSave();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div className="flex flex-col gap-2 items-end min-w-[200px]">
      <Input
        value={content}
        onChange={(e) => onChange(e.target.value)}
        className="bg-gray-100 dark:bg-gray-800"
        autoFocus
        onKeyDown={handleKeyDown}
      />
      <div className="flex gap-1 bg-white dark:bg-gray-900 rounded-md shadow-sm border border-gray-100 dark:border-gray-800">
        <Button
          size="sm"
          variant="ghost"
          onClick={onCancel}
          className="h-8 w-8 p-0 hover:text-red-600"
        >
          <X className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onSave}
          className="h-8 w-8 p-0 hover:text-green-600"
        >
          <Check className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Image as ImageIcon } from "lucide-react";
import { FormEvent } from "react";

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onImageClick: () => void;
  disabled?: boolean;
}

export const MessageInput = ({
  value,
  onChange,
  onSubmit,
  onImageClick,
  disabled = false,
}: MessageInputProps) => {
  return (
    <div className="p-4 bg-white dark:bg-gray-900 border-t dark:border-gray-800">
      <form onSubmit={onSubmit} className="flex gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onImageClick}
          className="h-10 w-10 p-0"
          title="Upload Image"
        >
          <ImageIcon className="w-5 h-5" />
        </Button>
        <Input
          placeholder="Ketik pesan..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
          autoFocus
          disabled={disabled}
        />
        <Button type="submit" disabled={!value.trim() || disabled}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

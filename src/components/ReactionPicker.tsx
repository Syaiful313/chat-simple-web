"use client";

interface ReactionPickerProps {
  onReact: (emoji: string) => void;
  onClose: () => void;
}

const QUICK_REACTIONS = ["❤️", "👍", "😂", "🎉", "😮", "😢"];

export function ReactionPicker({ onReact, onClose }: ReactionPickerProps) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute bottom-full left-0 mb-2 z-50 flex gap-1 p-2 bg-white border rounded-lg shadow-lg">
        {QUICK_REACTIONS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => {
              onReact(emoji);
              onClose();
            }}
            className="text-2xl hover:scale-125 transition-transform p-1 hover:bg-gray-100 rounded"
          >
            {emoji}
          </button>
        ))}
      </div>
    </>
  );
}

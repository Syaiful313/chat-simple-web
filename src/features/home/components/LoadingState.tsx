import { Loader2 } from "lucide-react";

export const LoadingState = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );
};

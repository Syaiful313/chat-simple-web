import { CheckCircle } from "lucide-react";

interface SuccessAlertProps {
  message: string;
}

export function SuccessAlert({ message }: SuccessAlertProps) {
  return (
    <div className="p-3 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
      <CheckCircle className="w-4 h-4" />
      {message}
    </div>
  );
}

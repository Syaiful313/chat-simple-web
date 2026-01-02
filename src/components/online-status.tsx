interface OnlineStatusProps {
  status: "ONLINE" | "OFFLINE" | "AWAY";
  size?: "sm" | "md" | "lg";
}

export function OnlineStatus({ status, size = "sm" }: OnlineStatusProps) {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  const colorClasses = {
    ONLINE: "bg-green-500",
    OFFLINE: "bg-gray-400",
    AWAY: "bg-yellow-500",
  };

  return (
    <span
      className={`${sizeClasses[size]} ${colorClasses[status]} rounded-full ${
        status === "ONLINE" ? "animate-pulse" : ""
      }`}
      title={status}
    />
  );
}

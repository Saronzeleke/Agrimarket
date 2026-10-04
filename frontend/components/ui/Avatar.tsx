import React from "react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";

interface AvatarProps {
  src?: string;
  alt?: string;
  firstName?: string;
  lastName?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  firstName = "",
  lastName = "",
  size = "md",
  className,
}) => {
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-16 w-16 text-lg",
  };

  return (
    <div
      className={cn(
        "rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-semibold overflow-hidden",
        sizes[size],
        className
      )}
    >
      {src ? (
        <img src={src} alt={alt || "Avatar"} className="w-full h-full object-cover" />
      ) : (
        <span>{getInitials(firstName, lastName)}</span>
      )}
    </div>
  );
};

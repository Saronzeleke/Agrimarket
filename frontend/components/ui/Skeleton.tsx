import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "rect" | "circle";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = "rect",
}) => {
  const baseStyles = "animate-pulse bg-gray-200 dark:bg-gray-700";

  const variants = {
    text: "h-4 w-full rounded",
    rect: "h-32 w-full rounded-lg",
    circle: "h-12 w-12 rounded-full",
  };

  return <div className={cn(baseStyles, variants[variant], className)} />;
};

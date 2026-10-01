import React from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  onClick,
}) => {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-[#E5E7EB] p-6",
        hover && "transition-shadow duration-200 hover:shadow-lg cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

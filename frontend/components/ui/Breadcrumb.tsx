import React from "react";
import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex items-center space-x-2 text-sm">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <ChevronRightIcon className="w-4 h-4 text-[#6B7280]" />
            )}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-[#6B7280] hover:text-[#166534] transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={isLast ? "text-[#1F2937] font-medium" : "text-[#6B7280]"}
              >
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

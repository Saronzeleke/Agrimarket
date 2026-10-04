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
              <ChevronRightIcon className="w-4 h-4 text-[var(--text-secondary)]" />
            )}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={isLast ? "text-[var(--text-primary)] font-medium" : "text-[var(--text-secondary)]"}
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

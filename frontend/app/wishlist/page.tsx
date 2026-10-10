"use client";

import React from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { HeartIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export default function WishlistPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[var(--background)] py-8">
      <div className="container-custom">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">My Wishlist</h1>
        
        <EmptyState
          icon={<HeartIcon className="w-16 h-16" />}
          title="Your wishlist is empty"
          description="Save your favorite products here"
          action={{
            label: "Browse Products",
            onClick: () => router.push("/marketplace"),
          }}
        />
      </div>
    </div>
  );
}

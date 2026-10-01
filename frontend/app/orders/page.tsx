"use client";

import React from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export default function OrdersPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F8FAF5] py-8">
      <div className="container-custom">
        <h1 className="text-3xl font-bold text-[#1F2937] mb-8">My Orders</h1>
        
        <EmptyState
          icon={<ShoppingBagIcon className="w-16 h-16" />}
          title="No orders yet"
          description="Start shopping to see your orders here"
          action={{
            label: "Start Shopping",
            onClick: () => router.push("/marketplace"),
          }}
        />
      </div>
    </div>
  );
}

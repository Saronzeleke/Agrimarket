"use client";

import React from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { BellIcon } from "@heroicons/react/24/outline";

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAF5] py-8">
      <div className="container-custom">
        <h1 className="text-3xl font-bold text-[#1F2937] mb-8">Notifications</h1>
        
        <EmptyState
          icon={<BellIcon className="w-16 h-16" />}
          title="No notifications"
          description="You're all caught up!"
        />
      </div>
    </div>
  );
}

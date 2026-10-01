"use client";

import React from "react";
import { useAuthStore } from "@/lib/store/auth.store";

export default function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#F8FAF5] py-8">
      <div className="container-custom max-w-4xl">
        <h1 className="text-3xl font-bold text-[#1F2937] mb-8">Settings</h1>
        
        <div className="bg-white rounded-xl p-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-[#6B7280]">Name</label>
                  <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                </div>
                <div>
                  <label className="text-sm text-[#6B7280]">Email</label>
                  <p className="font-medium">{user?.email}</p>
                </div>
                <div>
                  <label className="text-sm text-[#6B7280]">Phone</label>
                  <p className="font-medium">{user?.phone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

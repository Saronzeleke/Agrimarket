"use client";

import React from "react";
import { useAuthStore } from "@/lib/store/auth.store";

export default function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-[var(--background)] py-8">
      <div className="container-custom max-w-4xl">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">Settings</h1>
        
        <div className="bg-[var(--surface)] rounded-xl p-8 border border-[var(--border)]">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">Profile Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-[var(--text-secondary)]">Name</label>
                  <p className="font-medium text-[var(--text-primary)]">{user?.firstName} {user?.lastName}</p>
                </div>
                <div>
                  <label className="text-sm text-[var(--text-secondary)]">Email</label>
                  <p className="font-medium text-[var(--text-primary)]">{user?.email}</p>
                </div>
                <div>
                  <label className="text-sm text-[var(--text-secondary)]">Phone</label>
                  <p className="font-medium text-[var(--text-primary)]">{user?.phone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

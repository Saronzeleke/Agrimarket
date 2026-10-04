"use client";

import React from "react";
import { useAuthStore } from "@/lib/store/auth.store";

export default function BuyerDashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-[var(--background)] py-8">
      <div className="container-custom">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-[var(--text-secondary)] mb-8">Manage your orders and account</p>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--border)]">
            <h3 className="font-semibold text-lg mb-2 text-[var(--text-primary)]">Total Orders</h3>
            <p className="text-3xl font-bold text-[var(--primary)]">0</p>
          </div>
          <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--border)]">
            <h3 className="font-semibold text-lg mb-2 text-[var(--text-primary)]">Pending Orders</h3>
            <p className="text-3xl font-bold text-[var(--accent)]">0</p>
          </div>
          <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--border)]">
            <h3 className="font-semibold text-lg mb-2 text-[var(--text-primary)]">Wishlist Items</h3>
            <p className="text-3xl font-bold text-[var(--primary)]">0</p>
          </div>
        </div>
      </div>
    </div>
  );
}

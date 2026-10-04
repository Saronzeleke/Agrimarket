"use client";

import React from "react";
import { useAuthStore } from "@/lib/store/auth.store";

export default function SellerDashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-[var(--background)] py-8">
      <div className="container-custom">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
          Seller Dashboard
        </h1>
        <p className="text-[var(--text-secondary)] mb-8">Manage your products and orders</p>

        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--border)]">
            <h3 className="font-semibold text-lg mb-2 text-[var(--text-primary)]">Total Revenue</h3>
            <p className="text-3xl font-bold text-[var(--primary)]">ETB 0</p>
          </div>
          <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--border)]">
            <h3 className="font-semibold text-lg mb-2 text-[var(--text-primary)]">Active Products</h3>
            <p className="text-3xl font-bold text-[var(--primary)]">0</p>
          </div>
          <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--border)]">
            <h3 className="font-semibold text-lg mb-2 text-[var(--text-primary)]">Pending Orders</h3>
            <p className="text-3xl font-bold text-[var(--accent)]">0</p>
          </div>
          <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--border)]">
            <h3 className="font-semibold text-lg mb-2 text-[var(--text-primary)]">Low Stock</h3>
            <p className="text-3xl font-bold text-[var(--error)]">0</p>
          </div>
        </div>
      </div>
    </div>
  );
}

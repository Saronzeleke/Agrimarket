"use client";

import React from "react";
import { useAuthStore } from "@/lib/store/auth.store";

export default function BuyerDashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#F8FAF5] py-8">
      <div className="container-custom">
        <h1 className="text-3xl font-bold text-[#1F2937] mb-4">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-[#6B7280] mb-8">Manage your orders and account</p>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-2">Total Orders</h3>
            <p className="text-3xl font-bold text-[#166534]">0</p>
          </div>
          <div className="bg-white rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-2">Pending Orders</h3>
            <p className="text-3xl font-bold text-[#F59E0B]">0</p>
          </div>
          <div className="bg-white rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-2">Wishlist Items</h3>
            <p className="text-3xl font-bold text-[#65A30D]">0</p>
          </div>
        </div>
      </div>
    </div>
  );
}

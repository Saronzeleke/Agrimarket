"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function CheckoutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[var(--background)] py-8">
      <div className="container-custom max-w-4xl">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">Checkout</h1>
        
        <div className="bg-[var(--surface)] rounded-xl p-8 border border-[var(--border)]">
          <p className="text-center text-[var(--text-secondary)] mb-6">
            Checkout functionality coming soon
          </p>
          <Button
            variant="primary"
            className="w-full"
            onClick={() => router.push("/cart")}
          >
            Return to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}

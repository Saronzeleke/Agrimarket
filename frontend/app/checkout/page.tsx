"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function CheckoutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F8FAF5] py-8">
      <div className="container-custom max-w-4xl">
        <h1 className="text-3xl font-bold text-[#1F2937] mb-8">Checkout</h1>
        
        <div className="bg-white rounded-xl p-8">
          <p className="text-center text-[#6B7280] mb-6">
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

"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function CheckoutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[var(--background)] py-8">
      <div className="container-custom max-w-4xl">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">Checkout</h1>
        
        <section role="status" className="border border-[var(--border)] bg-[var(--surface)] px-6 py-10 text-center">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Payments are not configured</h2>
          <p className="mx-auto mt-3 mb-6 max-w-xl text-[var(--text-secondary)]">
            Orders cannot be placed until a real payment provider is connected. Your cart has not been changed.
          </p>
          <Button
            variant="primary"
            onClick={() => router.push("/cart")}
          >
            Return to Cart
          </Button>
        </section>
      </div>
    </div>
  );
}

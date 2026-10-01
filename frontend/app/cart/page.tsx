"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { TrashIcon, MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Cart as CartType } from "@/types";
import { cartApi } from "@/lib/api/endpoints";
import { useCartStore } from "@/lib/store/cart.store";
import { useUIStore } from "@/lib/store/ui.store";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

export default function CartPage() {
  const router = useRouter();
  const { setItems } = useCartStore();
  const { addToast } = useUIStore();
  const [cart, setCart] = useState<CartType | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await cartApi.getCart();
      if (response.data.success && response.data.data) {
        setCart(response.data.data);
        setItems(response.data.data.items);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    setUpdating(itemId);
    try {
      const response = await cartApi.updateItem(itemId, quantity);
      if (response.data.success && response.data.data) {
        setCart(response.data.data);
        setItems(response.data.data.items);
        addToast("Cart updated", "success");
      }
    } catch (error) {
      addToast("Failed to update cart", "error");
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setUpdating(itemId);
    try {
      const response = await cartApi.removeItem(itemId);
      if (response.data.success) {
        await fetchCart();
        addToast("Item removed from cart", "success");
      }
    } catch (error) {
      addToast("Failed to remove item", "error");
    } finally {
      setUpdating(null);
    }
  };

  const getSubtotal = () => {
    if (!cart) return 0;
    return cart.items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const deliveryFee = 50; // Fixed delivery fee

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAF5] py-8">
        <div className="container-custom">
          <Skeleton className="h-64 mb-4" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAF5] py-16">
        <div className="container-custom">
          <EmptyState
            title="Your cart is empty"
            description="Browse our marketplace and add some fresh products"
            action={{
              label: "Go to Marketplace",
              onClick: () => router.push(ROUTES.MARKETPLACE),
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAF5] py-8">
      <div className="container-custom">
        <h1 className="text-3xl font-bold text-[#1F2937] mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => {
              const primaryImage = item.product.images?.find((img) => img.isPrimary) || item.product.images?.[0];

              return (
                <div key={item.id} className="bg-white rounded-xl p-6">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="relative w-24 h-24 flex-shrink-0">
                      {primaryImage ? (
                        <Image
                          src={primaryImage.url}
                          alt={item.product.name}
                          fill
                          className="object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 rounded-lg" />
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="font-semibold text-[#1F2937] hover:text-[#166534]"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-[#6B7280] mt-1">
                        {formatCurrency(item.product.price)} per {item.product.unit}
                      </p>
                      <p className="text-sm text-[#6B7280]">{item.product.productionLocation}</p>

                      <div className="flex items-center gap-4 mt-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-[#E5E7EB] rounded-lg">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={updating === item.id || item.quantity <= 1}
                            className="p-2 hover:bg-gray-50 disabled:opacity-50"
                          >
                            <MinusIcon className="w-4 h-4" />
                          </button>
                          <span className="px-4 font-medium">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={updating === item.id}
                            className="p-2 hover:bg-gray-50 disabled:opacity-50"
                          >
                            <PlusIcon className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={updating === item.id}
                          className="text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>

                        {/* Item Total */}
                        <div className="ml-auto text-right">
                          <p className="font-bold text-[#1F2937]">
                            {formatCurrency(item.product.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 sticky top-24">
              <h2 className="text-xl font-bold text-[#1F2937] mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Subtotal</span>
                  <span className="font-medium">{formatCurrency(getSubtotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Delivery Fee</span>
                  <span className="font-medium">{formatCurrency(deliveryFee)}</span>
                </div>
                <div className="border-t border-[#E5E7EB] pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-lg">Total</span>
                    <span className="font-bold text-xl text-[#166534]">
                      {formatCurrency(getSubtotal() + deliveryFee)}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                className="w-full mb-4"
                onClick={() => router.push(ROUTES.CHECKOUT)}
              >
                Proceed to Checkout
              </Button>

              <Button
                variant="text"
                className="w-full"
                onClick={() => router.push(ROUTES.MARKETPLACE)}
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

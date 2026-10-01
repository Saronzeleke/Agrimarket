"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { StarIcon, ShoppingCartIcon, HeartIcon } from "@heroicons/react/24/outline";
import { Product } from "@/types";
import { productApi, cartApi } from "@/lib/api/endpoints";
import { useUIStore } from "@/lib/store/ui.store";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useUIStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (params.slug) {
      fetchProduct();
    }
  }, [params.slug]);

  const fetchProduct = async () => {
    try {
      const response = await productApi.getProductBySlug(params.slug as string);
      if (response.data.success && response.data.data) {
        setProduct(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch product:", error);
      router.push("/404");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    setAddingToCart(true);
    try {
      const response = await cartApi.addItem(product.id, quantity);
      if (response.data.success) {
        addToast("Product added to cart", "success");
      }
    } catch (error) {
      addToast("Failed to add to cart", "error");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAF5] py-8">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];

  return (
    <div className="min-h-screen bg-[#F8FAF5] py-8">
      <div className="container-custom">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div>
            <div className="relative aspect-square rounded-xl overflow-hidden bg-white">
              {primaryImage ? (
                <Image
                  src={primaryImage.url}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="bg-white rounded-xl p-8">
            <div className="mb-4">
              <Badge variant="primary">{product.category.name}</Badge>
            </div>

            <h1 className="text-3xl font-bold text-[#1F2937] mb-4">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center">
                <StarIcon className="w-5 h-5 text-[#F59E0B] fill-current" />
                <span className="ml-1 font-medium">{product.rating.toFixed(1)}</span>
              </div>
              <span className="text-[#6B7280]">({product.reviewCount} reviews)</span>
            </div>

            <div className="mb-6">
              <p className="text-4xl font-bold text-[#166534] mb-2">
                {formatCurrency(product.price)}
              </p>
              <p className="text-[#6B7280]">per {product.unit}</p>
            </div>

            <div className="mb-6">
              <p className="text-[#6B7280] leading-relaxed">{product.description}</p>
            </div>

            <div className="mb-6">
              <p className="text-sm text-[#6B7280]">
                <span className="font-medium">Origin:</span> {product.productionLocation}
              </p>
              <p className="text-sm text-[#6B7280]">
                <span className="font-medium">Seller:</span> {product.seller.businessName}
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#1F2937] mb-2">
                Quantity
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-[#E5E7EB] rounded-lg hover:bg-gray-50"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 h-10 text-center border border-[#E5E7EB] rounded-lg"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border border-[#E5E7EB] rounded-lg hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleAddToCart}
                isLoading={addingToCart}
              >
                <ShoppingCartIcon className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button variant="text" className="px-4">
                <HeartIcon className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

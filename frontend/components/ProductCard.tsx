"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { HeartIcon, ShoppingCartIcon, StarIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { useCartStore } from "@/lib/store/cart.store";
import { useUIStore } from "@/lib/store/ui.store";
import { cartApi } from "@/lib/api/endpoints";

interface ProductCardProps {
  product: Product;
  isInWishlist?: boolean;
  onToggleWishlist?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isInWishlist = false,
  onToggleWishlist,
}) => {
  const { addItem } = useCartStore();
  const { addToast } = useUIStore();
  const [isLoading, setIsLoading] = React.useState(false);

  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);

    try {
      const response = await cartApi.addItem(product.id, 1);
      if (response.data.success) {
        addToast("Product added to cart", "success");
        // Refresh cart count
        const cartResponse = await cartApi.getCart();
        if (cartResponse.data.success && cartResponse.data.data) {
          addItem(cartResponse.data.data.items[cartResponse.data.data.items.length - 1]);
        }
      }
    } catch (error) {
      addToast("Failed to add product to cart", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Link href={`/products/${product.slug}`}>
      <Card hover className="group">
        {/* Image */}
        <div className="relative aspect-[4/3] mb-4 overflow-hidden rounded-lg bg-gray-100">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.altText || product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
          
          {/* Wishlist Button */}
          {onToggleWishlist && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleWishlist();
              }}
              className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
            >
              {isInWishlist ? (
                <HeartSolidIcon className="w-5 h-5 text-red-600" />
              ) : (
                <HeartIcon className="w-5 h-5 text-gray-600" />
              )}
            </button>
          )}

          {/* Stock Status */}
          {product.inventory && product.inventory.quantity <= 0 && (
            <Badge variant="danger" className="absolute top-2 left-2">
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="font-semibold text-[#1F2937] group-hover:text-[#166534] transition-colors line-clamp-2">
            {product.name}
          </h3>

          <div className="flex items-center space-x-1">
            <div className="flex items-center">
              <StarIcon className="w-4 h-4 text-[#F59E0B] fill-current" />
              <span className="ml-1 text-sm font-medium">{product.rating.toFixed(1)}</span>
            </div>
            <span className="text-sm text-[#6B7280]">({product.reviewCount})</span>
          </div>

          <p className="text-sm text-[#6B7280]">{product.productionLocation}</p>

          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-xl font-bold text-[#166534]">
                {formatCurrency(product.price)}
              </p>
              <p className="text-sm text-[#6B7280]">per {product.unit}</p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={handleAddToCart}
              isLoading={isLoading}
              disabled={product.inventory && product.inventory.quantity <= 0}
            >
              <ShoppingCartIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
};

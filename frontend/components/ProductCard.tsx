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

/**
 * Safely formats a rating value to a fixed decimal string
 * Handles: numbers, string numbers, null, undefined
 * @returns Formatted rating string (e.g., "4.5") or "0.0" as fallback
 */
const formatRating = (rating: unknown): string => {
  if (typeof rating === 'number' && !isNaN(rating)) {
    return rating.toFixed(1);
  }
  if (typeof rating === 'string') {
    const parsed = parseFloat(rating);
    return !isNaN(parsed) ? parsed.toFixed(1) : '0.0';
  }
  return '0.0';
};

/**
 * Safely formats a review count
 * Handles: numbers, string numbers, null, undefined
 * @returns Valid number or 0 as fallback
 */
const formatReviewCount = (count: unknown): number => {
  if (typeof count === 'number' && !isNaN(count)) {
    return Math.max(0, Math.floor(count));
  }
  if (typeof count === 'string') {
    const parsed = parseInt(count, 10);
    return !isNaN(parsed) ? Math.max(0, parsed) : 0;
  }
  return 0;
};

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
              className="absolute top-2 right-2 p-2 bg-[var(--surface)] rounded-full shadow-md hover:shadow-lg transition-shadow border border-[var(--border)]"
            >
              {isInWishlist ? (
                <HeartSolidIcon className="w-5 h-5 text-[var(--error)]" />
              ) : (
                <HeartIcon className="w-5 h-5 text-[var(--text-secondary)]" />
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
          <h3 className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors line-clamp-2">
            {product.name}
          </h3>

          <div className="flex items-center space-x-1">
            <div className="flex items-center">
              <StarIcon className="w-4 h-4 text-[var(--accent)] fill-current" />
              <span className="ml-1 text-sm font-medium text-[var(--text-primary)]">
                {formatRating(product.rating)}
              </span>
            </div>
            <span className="text-sm text-[var(--text-secondary)]">
              ({formatReviewCount(product.reviewCount)})
            </span>
          </div>

          <p className="text-sm text-[var(--text-secondary)]">{product.productionLocation}</p>

          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-xl font-bold text-[var(--primary)]">
                {formatCurrency(product.price)}
              </p>
              <p className="text-sm text-[var(--text-secondary)]">per {product.unit}</p>
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

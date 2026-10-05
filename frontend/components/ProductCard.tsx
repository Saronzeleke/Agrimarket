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
    <Link href={`/products/${product.slug}`} className="block h-full">
      <Card hover className="group h-full flex flex-col overflow-hidden border-2 border-transparent hover:border-[var(--primary)] transition-all duration-300 hover:shadow-2xl">
        {/* Image with gradient overlay */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {primaryImage ? (
            <>
              <Image
                src={primaryImage.url}
                alt={primaryImage.altText || product.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              {/* Gradient overlay for better text visibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400">
              <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          
          {/* Wishlist Button - Elevated design */}
          {onToggleWishlist && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleWishlist();
              }}
              className="absolute top-3 right-3 p-2.5 bg-white/95 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 border border-gray-200"
              aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              {isInWishlist ? (
                <HeartSolidIcon className="w-5 h-5 text-red-500" />
              ) : (
                <HeartIcon className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors" />
              )}
            </button>
          )}

          {/* Stock Status Badge - Top left */}
          {product.inventory && product.inventory.quantity <= 0 && (
            <div className="absolute top-3 left-3">
              <Badge variant="danger" className="shadow-lg">
                Out of Stock
              </Badge>
            </div>
          )}
          
          {/* New/Featured Badge */}
          {product.rating >= 4.5 && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-[var(--accent)] text-white shadow-lg">
                ⭐ Featured
              </Badge>
            </div>
          )}
        </div>

        {/* Content - Improved spacing and typography */}
        <div className="flex-1 flex flex-col p-4 space-y-3">
          {/* Product name with better line clamping */}
          <h3 className="font-bold text-lg text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors line-clamp-2 min-h-[3.5rem]">
            {product.name}
          </h3>

          {/* Rating with improved design */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1 bg-[var(--accent)]/10 rounded-full">
              <StarIcon className="w-4 h-4 text-[var(--accent)] fill-current" />
              <span className="text-sm font-bold text-[var(--text-primary)]">
                {formatRating(product.rating)}
              </span>
            </div>
            <span className="text-sm text-[var(--text-secondary)]">
              ({formatReviewCount(product.reviewCount)} reviews)
            </span>
          </div>

          {/* Location with icon */}
          <div className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{product.productionLocation}</span>
          </div>

          {/* Price and cart button - Improved layout */}
          <div className="flex items-end justify-between pt-2 mt-auto border-t border-[var(--border)]">
            <div className="flex-1">
              <p className="text-2xl font-bold text-[var(--primary)]">
                {formatCurrency(product.price)}
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                per {product.unit}
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={handleAddToCart}
              isLoading={isLoading}
              disabled={product.inventory && product.inventory.quantity <= 0}
              className="px-4 py-2.5 font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShoppingCartIcon className="w-5 h-5 mr-1.5" />
                  <span className="hidden sm:inline">Add</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
};

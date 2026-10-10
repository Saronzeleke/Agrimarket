"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Product, Category } from "@/types";
import { productApi, categoryApi } from "@/lib/api/endpoints";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";
import {
  ArrowPathIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

function MarketplaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const category = searchParams.get("category") || "";
  const search = searchParams.get("q") || "";
  const sort = searchParams.get("sort") || "-createdAt";
  const hasActiveFilters = Boolean(category || search || sort !== "-createdAt");
  const activeFilterCount = [category, search, sort !== "-createdAt"].filter(Boolean).length;

  useEffect(() => {
    let isCurrent = true;

    const loadProducts = async () => {
      setLoading(true);
      setLoadError(false);

      try {
        const response = await productApi.getProducts({
          page: currentPage,
          limit: 12,
          category,
          q: search,
          sort,
        });

        if (!response.data.success || !response.data.data) {
          throw new Error("Product response was unsuccessful");
        }

        if (isCurrent) {
          setProducts(response.data.data.data);
          setTotalProducts(response.data.data.pagination.total);
          setTotalPages(Math.max(1, response.data.data.pagination.totalPages));
        }
      } catch {
        if (isCurrent) {
          setProducts([]);
          setTotalProducts(0);
          setTotalPages(1);
          setLoadError(true);
        }
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    void loadProducts();
    return () => {
      isCurrent = false;
    };
  }, [category, search, sort, currentPage, retryCount]);

  useEffect(() => {
    let isCurrent = true;

    categoryApi.getCategories()
      .then((response) => {
        if (isCurrent && response.data.success && response.data.data) {
          setCategories(response.data.data);
        }
      })
      .catch(() => {
        if (isCurrent) setCategories([]);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setCurrentPage(1);
    const query = params.toString();
    router.push(query ? `/marketplace?${query}` : "/marketplace", { scroll: false });
  };

  const clearFilters = () => {
    setCurrentPage(1);
    router.push("/marketplace", { scroll: false });
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="container-custom marketplace-container py-[24px] sm:py-[32px] lg:py-[40px]">
        <nav aria-label="Breadcrumb" className="mb-[20px] flex items-center gap-[8px] text-sm text-[var(--text-secondary)]">
          <Link href="/" className="hover:text-[var(--primary)]">Home</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="text-[var(--text-primary)]">Marketplace</span>
        </nav>

        <header className="mb-[24px] flex flex-col justify-between gap-[16px] border-b border-[var(--border)] pb-[24px] sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-bold leading-tight text-[var(--text-primary)]">Marketplace</h1>
            <p className="mt-[8px] text-[var(--text-secondary)]">Seasonal produce and goods from local farmers.</p>
          </div>
          <p className="text-sm font-medium text-[var(--text-secondary)]" aria-live="polite">
            {loading
              ? "Loading products..."
              : loadError
                ? "Results unavailable"
                : `${totalProducts} ${totalProducts === 1 ? "product" : "products"}`}
          </p>
        </header>

        <div className="mb-[20px] flex flex-col gap-[12px] border-b border-[var(--border)] pb-[16px] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between gap-[12px]">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex h-10 items-center gap-[8px] rounded-lg border border-[var(--border)] bg-[var(--surface)] px-[12px] text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--hover-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] lg:hidden"
              aria-expanded={showFilters}
              aria-controls="marketplace-filters"
            >
              {showFilters ? <XMarkIcon className="h-5 w-5" /> : <FunnelIcon className="h-5 w-5" />}
              Filters
              {activeFilterCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--primary)] px-[5px] text-xs text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <p className="text-sm text-[var(--text-secondary)] sm:hidden">
              {loading ? "Updating results" : loadError ? "Results unavailable" : `${totalProducts} results`}
            </p>
          </div>

          <div className="flex items-center justify-between gap-[12px] sm:justify-end">
            <label htmlFor="marketplace-sort" className="text-sm font-medium text-[var(--text-secondary)]">Sort by</label>
            <select
              id="marketplace-sort"
              value={sort}
              onChange={(event) => handleFilterChange("sort", event.target.value)}
              className="h-10 min-w-0 max-w-[220px] rounded-lg border border-[var(--border)] bg-[var(--surface)] px-[12px] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="-createdAt">Newest first</option>
              <option value="price">Price: low to high</option>
              <option value="-price">Price: high to low</option>
              <option value="-rating">Top rated</option>
              <option value="-reviewCount">Most reviewed</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-[24px] lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-[32px]">
          <aside
            id="marketplace-filters"
            aria-label="Product filters"
            className={`${showFilters ? "block" : "hidden"} border-b border-[var(--border)] pb-[20px] lg:block lg:border-0 lg:pb-0`}
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-[12px]">
              <h2 className="text-base font-semibold text-[var(--text-primary)]">Filter products</h2>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm font-medium text-[var(--primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="pt-[16px]">
              <label htmlFor="marketplace-category" className="mb-[8px] block text-sm font-medium text-[var(--text-primary)]">
                Category
              </label>
              <select
                id="marketplace-category"
                value={category}
                onChange={(event) => handleFilterChange("category", event.target.value)}
                className="h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-[12px] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="">All categories</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.slug}>{item.name}</option>
                ))}
              </select>
            </div>
          </aside>

          <section aria-label="Marketplace products" className="min-w-0">
            {search && (
              <div className="mb-[16px] flex items-center gap-[8px] text-sm text-[var(--text-secondary)]">
                <MagnifyingGlassIcon className="h-4 w-4 shrink-0" />
                <span>Results for <strong className="font-semibold text-[var(--text-primary)]">&quot;{search}&quot;</strong></span>
                <button
                  type="button"
                  onClick={() => handleFilterChange("q", "")}
                  className="ml-auto inline-flex items-center gap-[4px] text-[var(--primary)] hover:underline"
                  aria-label="Clear search"
                >
                  <XMarkIcon className="h-4 w-4" />
                  Clear
                </button>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 gap-[20px] sm:grid-cols-2 xl:grid-cols-3" aria-label="Loading products">
                {Array.from({ length: 6 }, (_, index) => (
                  <div key={index} className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
                    <Skeleton className="h-[190px] rounded-none" />
                    <div className="space-y-[12px] p-[16px]">
                      <Skeleton className="h-5 w-4/5" />
                      <Skeleton className="h-4 w-2/5" />
                      <Skeleton className="h-4 w-3/5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : loadError ? (
              <div role="alert" className="flex min-h-[280px] flex-col items-center justify-center border border-[var(--border)] bg-[var(--surface)] px-[24px] py-[32px] text-center">
                <p className="text-lg font-semibold text-[var(--text-primary)]">Products are temporarily unavailable</p>
                <p className="mt-[8px] max-w-md text-sm text-[var(--text-secondary)]">
                  We couldn&apos;t connect to the marketplace. Check your connection and try again.
                </p>
                <button
                  type="button"
                  onClick={() => setRetryCount((count) => count + 1)}
                  className="mt-[16px] inline-flex h-10 items-center gap-[8px] rounded-lg bg-[var(--primary)] px-[16px] text-sm font-semibold text-white hover:bg-[var(--primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  Try again
                </button>
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-[20px] sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="mt-[32px]">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="flex min-h-[280px] flex-col items-center justify-center border border-dashed border-[var(--border)] px-[24px] py-[32px] text-center">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  {hasActiveFilters ? "No matching products" : "No products available yet"}
                </h2>
                <p className="mt-[8px] max-w-md text-sm text-[var(--text-secondary)]">
                  {hasActiveFilters
                    ? "Try another category or clear your filters to see more products."
                    : "New listings from local farmers will appear here."}
                </p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-[16px] text-sm font-semibold text-[var(--primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--background)] flex items-center justify-center">Loading...</div>}>
      <MarketplaceContent />
    </Suspense>
  );
}

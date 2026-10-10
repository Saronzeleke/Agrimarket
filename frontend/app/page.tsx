"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRightIcon, CheckCircleIcon, TruckIcon, ShieldCheckIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { Product, Category } from "@/types";
import { productApi, categoryApi } from "@/lib/api/endpoints";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ROUTES } from "@/lib/constants";

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, productsRes] = await Promise.all([
          categoryApi.getCategories(),
          productApi.getProducts({ limit: 8, sort: "-rating" }),
        ]);

        // Handle categories with defensive checks
        if (categoriesRes?.data?.success && categoriesRes.data.data) {
          const categoriesData = categoriesRes.data.data;
          if (Array.isArray(categoriesData)) {
            setCategories(categoriesData.slice(0, 6));
          } else {
            if (process.env.NODE_ENV === 'development') {
              console.warn('[Categories] Unexpected response format:', categoriesData);
            }
            setCategories([]);
          }
        } else {
          setCategories([]);
        }

        // Handle products with defensive checks and nested data extraction
        if (productsRes?.data?.success && productsRes.data.data) {
          setFeaturedProducts(productsRes.data.data.data.slice(0, 8));
        } else {
          setFeaturedProducts([]);
        }
      } catch (error) {
        // Log full error in development, minimal in production
        if (process.env.NODE_ENV === 'development') {
          console.error('[HomePage] Failed to fetch data:', error);
        } else {
          console.error('[HomePage] Failed to fetch data');
        }
        setCategories([]);
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Section - Redesigned */}
      <section className="bg-[var(--background)] py-12 md:py-20 transition-colors duration-200">
        <div className="container-custom">
          <div className="grid md:grid-cols-[60%_40%] gap-8 md:gap-12 items-center">
            {/* Left Column - Content */}
            <div className="space-y-6 md:space-y-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--text-primary)] leading-tight">
                Fresh Produce from Ethiopian Farmers to Your Doorstep
              </h1>
              <p className="text-lg md:text-xl text-[var(--text-secondary)] leading-relaxed max-w-2xl">
                Experience the convenience of farm-fresh produce delivered directly to you. Connect with Ethiopian farmers and enjoy premium quality agricultural products at fair prices.
              </p>
              
              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={ROUTES.MARKETPLACE}>
                  <button className="w-full sm:w-auto bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold px-8 py-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 shadow-sm hover:shadow-md flex items-center justify-center">
                    Explore Marketplace
                    <ArrowRightIcon className="w-5 h-5 ml-2" />
                  </button>
                </Link>
                <Link href="/sell">
                  <button className="w-full sm:w-auto bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold px-8 py-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 shadow-sm hover:shadow-md flex items-center justify-center">
                    Become a Seller
                    <ArrowRightIcon className="w-5 h-5 ml-2" />
                  </button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-[var(--primary)]" />
                  <span className="text-sm text-[var(--text-secondary)]">10K+ Active Users</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-[var(--primary)]" />
                  <span className="text-sm text-[var(--text-secondary)]">500+ Verified Farmers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-[var(--primary)]" />
                  <span className="text-sm text-[var(--text-secondary)]">Quality Guaranteed</span>
                </div>
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="hidden md:block">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-[#0F6B3C]/10 to-[#E85D04]/10 dark:from-[#0F6B3C]/20 dark:to-[#E85D04]/20">
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                  <div className="text-8xl mb-4" role="img" aria-label="Ethiopian agriculture">
                    🌾
                  </div>
                  <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                    Ethiopian Agriculture
                  </h3>
                  <p className="text-[var(--text-secondary)]">
                    Fresh from Farm to Table
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-[var(--surface)] transition-colors duration-200">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
              Shop by Category
            </h2>
            <p className="text-lg text-[var(--text-secondary)]">
              Browse our wide selection of fresh produce and agricultural products
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`${ROUTES.MARKETPLACE}?category=${category.slug}`}
                  className="group"
                >
                  <div className="bg-[var(--background)] rounded-xl border border-[var(--border)] p-6 text-center hover:shadow-lg transition-all duration-200 hover:border-[var(--primary)]">
                    <div className="text-4xl mb-3">{category.icon || "🌾"}</div>
                    <h3 className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-[var(--background)] transition-colors duration-200">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
                Featured Products
              </h2>
              <p className="text-lg text-[var(--text-secondary)]">
                Top-rated products from our trusted sellers
              </p>
            </div>
            <Link href={ROUTES.MARKETPLACE}>
              <Button variant="text">
                View All
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-96" />
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">No products yet</h3>
              <p className="text-[var(--text-secondary)] mb-6">
                Check back soon as our sellers add more products
              </p>
              <Link href={ROUTES.MARKETPLACE}>
                <Button variant="primary">
                  Browse Marketplace
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-[var(--surface)] transition-colors duration-200">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
              How It Works
            </h2>
            <p className="text-lg text-[var(--text-secondary)]">
              Simple steps to get fresh produce delivered
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[var(--text-primary)]">Browse Products</h3>
              <p className="text-[var(--text-secondary)]">
                Explore our marketplace and find fresh produce from local farmers
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[var(--text-primary)]">Place Order</h3>
              <p className="text-[var(--text-secondary)]">
                Add items to cart and complete your purchase securely
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[var(--text-primary)]">Get Delivered</h3>
              <p className="text-[var(--text-secondary)]">
                Receive fresh products at your doorstep within days
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-[var(--primary)] text-white transition-colors duration-200">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-white/80">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-white/80">Verified Sellers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-white/80">Products Sold</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">4.8/5</div>
              <div className="text-white/80">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-[var(--background)] transition-colors duration-200">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center mb-4">
                <TruckIcon className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-[var(--text-primary)]">Fast Delivery</h3>
              <p className="text-[var(--text-secondary)] text-sm">
                Quick and reliable delivery to your location
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center mb-4">
                <ShieldCheckIcon className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-[var(--text-primary)]">Quality Assured</h3>
              <p className="text-[var(--text-secondary)] text-sm">
                Only verified sellers with quality products
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center mb-4">
                <CheckCircleIcon className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-[var(--text-primary)]">Secure Payment</h3>
              <p className="text-[var(--text-secondary)] text-sm">
                Safe and secure payment processing
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center mb-4">
                <UserGroupIcon className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-[var(--text-primary)]">Support Farmers</h3>
              <p className="text-[var(--text-secondary)] text-sm">
                Direct connection with local farmers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[var(--surface)] transition-colors duration-200">
        <div className="container-custom">
          <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] rounded-2xl p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Selling?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Join thousands of farmers already selling on AgriMarket
            </p>
            <Link href="/sell">
              <Button variant="secondary" size="lg" className="bg-[var(--surface)] text-[var(--primary)] hover:bg-[var(--background)] border border-[var(--border)]">
                Get Started Today
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

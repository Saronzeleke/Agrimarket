"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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

        if (categoriesRes.data.success && categoriesRes.data.data) {
          setCategories(categoriesRes.data.data.slice(0, 6));
        }

        if (productsRes.data.success && productsRes.data.data) {
          setFeaturedProducts(productsRes.data.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#166534] to-[#65A30D] text-white">
        <div className="container-custom py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Fresh Produce from Ethiopian Farmers to Your Doorstep
              </h1>
              <p className="text-xl mb-8 text-white/90">
                Connect directly with local farmers. Get the freshest agricultural products at fair prices while supporting sustainable farming.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={ROUTES.MARKETPLACE}>
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto bg-white text-[#166534] hover:bg-gray-100">
                    Explore Marketplace
                    <ArrowRightIcon className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/sell">
                  <Button variant="text" size="lg" className="w-full sm:w-auto border-2 border-white text-white hover:bg-white/10">
                    Become a Seller
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-[#F59E0B]/20 to-transparent" />
                <Image
                  src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&h=600&fit=crop"
                  alt="Ethiopian Agriculture"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1F2937] mb-4">
              Shop by Category
            </h2>
            <p className="text-lg text-[#6B7280]">
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
                  <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 text-center hover:shadow-lg transition-all duration-200 hover:border-[#166534]">
                    <div className="text-4xl mb-3">{category.icon || "🌾"}</div>
                    <h3 className="font-semibold text-[#1F2937] group-hover:text-[#166534]">
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
      <section className="py-16 bg-[#F8FAF5]">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1F2937] mb-4">
                Featured Products
              </h2>
              <p className="text-lg text-[#6B7280]">
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
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1F2937] mb-4">
              How It Works
            </h2>
            <p className="text-lg text-[#6B7280]">
              Simple steps to get fresh produce delivered
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#166534] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Browse Products</h3>
              <p className="text-[#6B7280]">
                Explore our marketplace and find fresh produce from local farmers
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#166534] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Place Order</h3>
              <p className="text-[#6B7280]">
                Add items to cart and complete your purchase securely
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#166534] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Delivered</h3>
              <p className="text-[#6B7280]">
                Receive fresh products at your doorstep within days
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-[#166534] text-white">
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
      <section className="py-16">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[#166534]/10 rounded-lg flex items-center justify-center mb-4">
                <TruckIcon className="w-6 h-6 text-[#166534]" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Fast Delivery</h3>
              <p className="text-[#6B7280] text-sm">
                Quick and reliable delivery to your location
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[#166534]/10 rounded-lg flex items-center justify-center mb-4">
                <ShieldCheckIcon className="w-6 h-6 text-[#166534]" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Quality Assured</h3>
              <p className="text-[#6B7280] text-sm">
                Only verified sellers with quality products
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[#166534]/10 rounded-lg flex items-center justify-center mb-4">
                <CheckCircleIcon className="w-6 h-6 text-[#166534]" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Secure Payment</h3>
              <p className="text-[#6B7280] text-sm">
                Safe and secure payment processing
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[#166534]/10 rounded-lg flex items-center justify-center mb-4">
                <UserGroupIcon className="w-6 h-6 text-[#166534]" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Support Farmers</h3>
              <p className="text-[#6B7280] text-sm">
                Direct connection with local farmers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#F8FAF5]">
        <div className="container-custom">
          <div className="bg-gradient-to-r from-[#166534] to-[#65A30D] rounded-2xl p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Selling?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Join thousands of farmers already selling on AgriMarket
            </p>
            <Link href="/sell">
              <Button variant="secondary" size="lg" className="bg-white text-[#166534] hover:bg-gray-100">
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

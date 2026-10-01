"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  HeartIcon,
  BellIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAuthStore } from "@/lib/store/auth.store";
import { useCartStore } from "@/lib/store/cart.store";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { ROUTES } from "@/lib/constants";

export const Header: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, logout, hydrate } = useAuthStore();
  const { count } = useCartStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`${ROUTES.SEARCH}?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    router.push(ROUTES.LOGIN);
  };

  return (
    <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-40">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={ROUTES.HOME} className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-[#166534] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <span className="text-xl font-bold text-[#166534]">AgriMarket</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href={ROUTES.HOME}
              className="text-[#1F2937] hover:text-[#166534] font-medium"
            >
              Home
            </Link>
            <Link
              href={ROUTES.MARKETPLACE}
              className="text-[#1F2937] hover:text-[#166534] font-medium"
            >
              Marketplace
            </Link>
            {isAuthenticated && user?.role === "SELLER" && (
              <Link
                href={ROUTES.DASHBOARD_SELLER}
                className="text-[#1F2937] hover:text-[#166534] font-medium"
              >
                Seller Dashboard
              </Link>
            )}
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534]"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-[#6B7280]" />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link href={ROUTES.WISHLIST} className="relative p-2">
                  <HeartIcon className="w-6 h-6 text-[#1F2937]" />
                </Link>
                <Link href={ROUTES.CART} className="relative p-2">
                  <ShoppingCartIcon className="w-6 h-6 text-[#1F2937]" />
                  {count > 0 && (
                    <span className="absolute top-0 right-0 bg-[#F59E0B] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {count}
                    </span>
                  )}
                </Link>
                <Link href={ROUTES.NOTIFICATIONS} className="relative p-2">
                  <BellIcon className="w-6 h-6 text-[#1F2937]" />
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2"
                  >
                    <Avatar
                      firstName={user?.firstName}
                      lastName={user?.lastName}
                      size="sm"
                    />
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#E5E7EB] py-2">
                      <Link
                        href={user?.role === "SELLER" ? ROUTES.DASHBOARD_SELLER : ROUTES.DASHBOARD_BUYER}
                        className="block px-4 py-2 text-sm hover:bg-gray-50"
                      >
                        Dashboard
                      </Link>
                      <Link
                        href={ROUTES.ORDERS}
                        className="block px-4 py-2 text-sm hover:bg-gray-50"
                      >
                        My Orders
                      </Link>
                      <Link
                        href={ROUTES.SETTINGS}
                        className="block px-4 py-2 text-sm hover:bg-gray-50"
                      >
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href={ROUTES.LOGIN}
                  className="text-[#166534] font-medium hover:underline"
                >
                  Login
                </Link>
                <Link
                  href={ROUTES.REGISTER}
                  className="bg-[#166534] text-white px-4 py-2 rounded-lg hover:bg-[#134e28]"
                >
                  Sign Up
                </Link>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2"
            >
              {showMobileMenu ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden py-4 border-t border-[#E5E7EB]">
            <nav className="flex flex-col space-y-2">
              <Link href={ROUTES.HOME} className="py-2 text-[#1F2937] hover:text-[#166534]">
                Home
              </Link>
              <Link href={ROUTES.MARKETPLACE} className="py-2 text-[#1F2937] hover:text-[#166534]">
                Marketplace
              </Link>
              {isAuthenticated && user?.role === "SELLER" && (
                <Link href={ROUTES.DASHBOARD_SELLER} className="py-2 text-[#1F2937] hover:text-[#166534]">
                  Seller Dashboard
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

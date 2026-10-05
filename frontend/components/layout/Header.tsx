"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  HeartIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useAuthStore } from "@/lib/store/auth.store";
import { useCartStore } from "@/lib/store/cart.store";
import { Avatar } from "../ui/Avatar";
import { ThemeToggle } from "../ThemeToggle";
import { ROUTES } from "@/lib/constants";

export const Header: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { count } = useCartStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`${ROUTES.SEARCH}?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      setShowUserMenu(false);
      router.push(ROUTES.LOGIN);
    }
  };

  return (
    <header className="bg-[var(--navbar-bg)] border-b border-[var(--border)] sticky top-0 z-50 shadow-sm transition-colors">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 gap-3 lg:gap-4">
          {/* Logo & Brand - Left */}
          <Link href={ROUTES.HOME} className="flex items-center gap-2 flex-shrink-0 group">
            <div className="w-9 h-9 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)] rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="text-lg lg:text-xl font-bold text-[var(--primary)] tracking-tight">AgriMarket</span>
          </Link>

          {/* Desktop Navigation - Center Left (hidden on mobile/tablet) */}
          <nav className="hidden lg:flex items-center gap-1 flex-shrink-0">
            <Link
              href={ROUTES.HOME}
              className="px-3 py-2 text-sm font-medium text-[var(--text-primary)] hover:text-[var(--primary)] hover:bg-[var(--hover-bg)] rounded-lg transition-all"
            >
              Home
            </Link>
            <Link
              href={ROUTES.MARKETPLACE}
              className="px-3 py-2 text-sm font-medium text-[var(--text-primary)] hover:text-[var(--primary)] hover:bg-[var(--hover-bg)] rounded-lg transition-all"
            >
              Marketplace
            </Link>
            {isAuthenticated && user?.role === "SELLER" && (
              <Link
                href={ROUTES.DASHBOARD_SELLER}
                className="px-3 py-2 text-sm font-medium text-[var(--text-primary)] hover:text-[var(--primary)] hover:bg-[var(--hover-bg)] rounded-lg transition-all"
              >
                Dashboard
              </Link>
            )}
          </nav>

          {/* Search Bar - Flexible (hidden on mobile, visible from md up) */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md lg:max-w-xl">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search fresh produce..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 lg:h-10 pl-10 pr-4 text-sm border border-[var(--border)] bg-[var(--search-bg)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2 lg:top-2.5 w-5 h-5 text-[var(--text-secondary)]" />
            </div>
          </form>

          {/* Actions - Right */}
          <div className="flex items-center gap-1 lg:gap-2 flex-shrink-0">
            {/* Theme Toggle - Desktop only */}
            <div className="hidden lg:block">
              <ThemeToggle />
            </div>

            {isAuthenticated ? (
              <>
                {/* Wishlist - Desktop only */}
                <Link
                  href={ROUTES.WISHLIST}
                  className="hidden lg:flex p-2 text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--hover-bg)] rounded-lg transition-all"
                  title="Wishlist"
                >
                  <HeartIcon className="w-5 h-5" />
                </Link>

                {/* Cart - Visible from md up */}
                <Link
                  href={ROUTES.CART}
                  className="hidden md:flex relative p-2 text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--hover-bg)] rounded-lg transition-all"
                  title="Cart"
                >
                  <ShoppingCartIcon className="w-5 h-5" />
                  {count > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-[var(--accent)] text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm">
                      {count > 9 ? "9+" : count}
                    </span>
                  )}
                </Link>

                {/* Notifications - Desktop only */}
                <Link
                  href={ROUTES.NOTIFICATIONS}
                  className="hidden lg:flex p-2 text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--hover-bg)] rounded-lg transition-all"
                  title="Notifications"
                >
                  <BellIcon className="w-5 h-5" />
                </Link>

                {/* User Menu - Visible from md up */}
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-[var(--hover-bg)] rounded-lg transition-all"
                  >
                    <Avatar
                      firstName={user?.firstName}
                      lastName={user?.lastName}
                      size="sm"
                    />
                    <ChevronDownIcon className="w-4 h-4 text-[var(--text-secondary)]" />
                  </button>
                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-[var(--surface)] rounded-xl shadow-xl border border-[var(--border)] py-2 z-20">
                        <div className="px-4 py-3 border-b border-[var(--border)]">
                          <p className="text-sm font-semibold text-[var(--text-primary)]">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{user?.email}</p>
                        </div>
                        <Link
                          href={user?.role === "SELLER" ? ROUTES.DASHBOARD_SELLER : ROUTES.DASHBOARD_BUYER}
                          className="block px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[var(--hover-bg)] hover:text-[var(--primary)] transition-all"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Dashboard
                        </Link>
                        <Link
                          href={ROUTES.ORDERS}
                          className="block px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[var(--hover-bg)] hover:text-[var(--primary)] transition-all"
                          onClick={() => setShowUserMenu(false)}
                        >
                          My Orders
                        </Link>
                        <Link
                          href={ROUTES.SETTINGS}
                          className="block px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[var(--hover-bg)] hover:text-[var(--primary)] transition-all"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Settings
                        </Link>
                        <div className="border-t border-[var(--border)] mt-2 pt-2">
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2.5 text-sm text-[var(--error)] hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                          >
                            Logout
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href={ROUTES.LOGIN}
                  className="hidden md:inline-flex px-3 lg:px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:text-[var(--primary)] hover:bg-[var(--hover-bg)] rounded-lg transition-all"
                >
                  Login
                </Link>
                <Link
                  href={ROUTES.REGISTER}
                  className="hidden md:inline-flex px-3 lg:px-5 py-2 text-sm font-semibold bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] shadow-sm hover:shadow-md transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}

            {/* Mobile Menu Toggle - Visible below md (768px) */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-[var(--text-primary)] hover:bg-[var(--hover-bg)] rounded-lg transition-all"
              aria-label="Toggle menu"
            >
              {showMobileMenu ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Below md (768px) */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-[var(--border)] py-4 space-y-1 animate-slide-in">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="px-2 pb-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search fresh produce..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 text-sm border border-[var(--border)] bg-[var(--search-bg)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-[var(--text-secondary)]" />
              </div>
            </form>

            {/* Mobile Navigation */}
            <nav className="flex flex-col">
              <Link
                href={ROUTES.HOME}
                className="px-4 py-3 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--hover-bg)] hover:text-[var(--primary)] rounded-lg transition-all"
                onClick={() => setShowMobileMenu(false)}
              >
                Home
              </Link>
              <Link
                href={ROUTES.MARKETPLACE}
                className="px-4 py-3 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--hover-bg)] hover:text-[var(--primary)] rounded-lg transition-all"
                onClick={() => setShowMobileMenu(false)}
              >
                Marketplace
              </Link>
              {isAuthenticated && user?.role === "SELLER" && (
                <Link
                  href={ROUTES.DASHBOARD_SELLER}
                  className="px-4 py-3 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--hover-bg)] hover:text-[var(--primary)] rounded-lg transition-all"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Dashboard
                </Link>
              )}

              {/* Mobile Authenticated Actions */}
              {isAuthenticated ? (
                <>
                  <Link
                    href={ROUTES.WISHLIST}
                    className="px-4 py-3 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--hover-bg)] hover:text-[var(--primary)] rounded-lg transition-all"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Wishlist
                  </Link>
                  <Link
                    href={ROUTES.CART}
                    className="px-4 py-3 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--hover-bg)] hover:text-[var(--primary)] rounded-lg transition-all flex items-center justify-between"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Cart
                    {count > 0 && (
                      <span className="bg-[var(--accent)] text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-2 shadow-sm">
                        {count > 9 ? "9+" : count}
                      </span>
                    )}
                  </Link>
                  <Link
                    href={ROUTES.NOTIFICATIONS}
                    className="px-4 py-3 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--hover-bg)] hover:text-[var(--primary)] rounded-lg transition-all"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Notifications
                  </Link>
                  <Link
                    href={user?.role === "SELLER" ? ROUTES.DASHBOARD_SELLER : ROUTES.DASHBOARD_BUYER}
                    className="px-4 py-3 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--hover-bg)] hover:text-[var(--primary)] rounded-lg transition-all"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    My Dashboard
                  </Link>
                  <Link
                    href={ROUTES.ORDERS}
                    className="px-4 py-3 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--hover-bg)] hover:text-[var(--primary)] rounded-lg transition-all"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    My Orders
                  </Link>
                  <Link
                    href={ROUTES.SETTINGS}
                    className="px-4 py-3 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--hover-bg)] hover:text-[var(--primary)] rounded-lg transition-all"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowMobileMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-[var(--error)] hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href={ROUTES.LOGIN}
                    className="mx-2 mt-2 px-4 py-2.5 text-sm font-medium text-center text-[var(--text-primary)] border border-[var(--border)] rounded-lg hover:bg-[var(--hover-bg)] hover:border-[var(--primary)] transition-all"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href={ROUTES.REGISTER}
                    className="mx-2 mt-2 px-4 py-2.5 text-sm font-semibold text-center bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] shadow-sm transition-all"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}

              {/* Theme Toggle in Mobile */}
              <div className="px-4 py-3 flex items-center justify-between border-t border-[var(--border)] mt-2 pt-4">
                <span className="text-sm font-medium text-[var(--text-primary)]">Theme</span>
                <ThemeToggle />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

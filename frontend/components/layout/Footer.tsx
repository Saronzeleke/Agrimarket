import React from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[var(--surface)] border-t border-[var(--border)] text-[var(--text-primary)] mt-auto transition-colors duration-200">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-[var(--primary)] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <span className="text-xl font-bold">AgriMarket</span>
            </div>
            <p className="text-[var(--text-secondary)] text-sm">
              Connecting Ethiopian farmers directly with buyers. Fresh produce, fair prices, sustainable agriculture.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={ROUTES.MARKETPLACE} className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* For Sellers */}
          <div>
            <h3 className="font-semibold mb-4">Your Account</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={ROUTES.REGISTER} className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">
                  Create an account
                </Link>
              </li>
              <li>
                <Link href={ROUTES.LOGIN} className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">
                  Sign in
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Follow AgriMarket</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://www.facebook.com/saronzelekecassiopia" target="_blank" rel="noopener noreferrer" aria-label="AgriMarket on Facebook" className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">
                  Facebook
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/saronzelekecassiopia/" target="_blank" rel="noopener noreferrer" aria-label="AgriMarket on Instagram" className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">
                  Instagram
                </a>
              </li>
              <li>
                <a href="https://x.com/sharonkuye" target="_blank" rel="noopener noreferrer" aria-label="AgriMarket on X" className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">
                  X
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[var(--border)] mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-[var(--text-secondary)] text-sm">
            © {currentYear} AgriMarket. All rights reserved.
          </p>
          <p className="mt-4 text-sm text-[var(--text-secondary)] md:mt-0">Ethiopia</p>
        </div>
      </div>
    </footer>
  );
};

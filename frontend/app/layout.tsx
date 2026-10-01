import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ToastContainer } from "@/components/ui/Toast";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgriMarket - Ethiopian Agricultural Marketplace",
  description: "Connect Ethiopian farmers directly with buyers. Fresh produce, fair prices, sustainable agriculture.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="min-h-screen flex flex-col">
        <ErrorBoundary>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <ToastContainer />
        </ErrorBoundary>
      </body>
    </html>
  );
}

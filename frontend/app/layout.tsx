import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ToastContainer } from "@/components/ui/Toast";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { ThemeProvider } from "@/components/ThemeProvider";

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
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--text-primary)] transition-colors duration-200" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <ToastContainer />
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}

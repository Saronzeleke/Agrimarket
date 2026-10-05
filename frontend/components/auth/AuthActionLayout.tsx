import Link from "next/link";
import type { ReactNode } from "react";

interface AuthActionLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthActionLayout({ title, description, children, footer }: AuthActionLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-[16px] py-[40px]">
      <section aria-labelledby="auth-action-title" className="w-full max-w-md border border-[var(--border)] bg-[var(--surface)] p-[24px] sm:p-[32px]">
        <Link href="/" className="text-sm font-semibold text-[var(--primary)] hover:underline">AgriMarket</Link>
        <h1 id="auth-action-title" className="mt-[24px] text-2xl font-bold text-[var(--text-primary)]">{title}</h1>
        <p className="mt-[8px] text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
        <div className="mt-[24px]">{children}</div>
        <div className="mt-[24px] border-t border-[var(--border)] pt-[16px] text-sm text-[var(--text-secondary)]">{footer}</div>
      </section>
    </div>
  );
}
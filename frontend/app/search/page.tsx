"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");

  return (
    <div className="min-h-screen bg-[var(--background)] py-8">
      <div className="container-custom">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
          Search Results
        </h1>
        <p className="text-[var(--text-secondary)] mb-8">
          Showing results for: <span className="font-medium text-[var(--text-primary)]">{query}</span>
        </p>
        
        <div className="bg-[var(--surface)] rounded-xl p-8 text-center border border-[var(--border)]">
          <p className="text-[var(--text-secondary)]">Search functionality coming soon</p>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}

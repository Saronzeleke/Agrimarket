"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");

  return (
    <div className="min-h-screen bg-[#F8FAF5] py-8">
      <div className="container-custom">
        <h1 className="text-3xl font-bold text-[#1F2937] mb-4">
          Search Results
        </h1>
        <p className="text-[#6B7280] mb-8">
          Showing results for: <span className="font-medium">{query}</span>
        </p>
        
        <div className="bg-white rounded-xl p-8 text-center">
          <p className="text-[#6B7280]">Search functionality coming soon</p>
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

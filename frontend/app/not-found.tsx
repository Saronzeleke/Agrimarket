import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/lib/constants";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAF5] p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-9xl font-bold text-[#166534] mb-4">404</h1>
        <h2 className="text-3xl font-bold text-[#1F2937] mb-4">
          Page Not Found
        </h2>
        <p className="text-[#6B7280] mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href={ROUTES.HOME}>
          <Button variant="primary" size="lg">
            Go Back Home
          </Button>
        </Link>
      </div>
    </div>
  );
}

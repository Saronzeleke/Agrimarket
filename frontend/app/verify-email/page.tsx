"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { AuthActionLayout } from "@/components/auth/AuthActionLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authApi } from "@/lib/api/endpoints";

type VerificationState = "verifying" | "verified" | "failed";

function VerificationContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [state, setState] = useState<VerificationState>("verifying");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) return;

    let isCurrent = true;
    authApi.verifyEmail(token)
      .then(() => {
        if (isCurrent) setState("verified");
      })
      .catch((error: unknown) => {
        if (!isCurrent) return;
        setState("failed");
        setMessage(axios.isAxiosError<{ error?: string }>(error)
          ? error.response?.data?.error || "This verification link is invalid or expired."
          : "This verification link could not be confirmed.");
      });

    return () => {
      isCurrent = false;
    };
  }, [token]);

  const handleResend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResending(true);
    setResendMessage("");

    try {
      await authApi.resendVerification(email);
      setResendMessage("If the account can receive email, a new verification link has been requested.");
    } catch (error: unknown) {
      setResendMessage(axios.isAxiosError<{ error?: string }>(error)
        ? error.response?.data?.error || "Email delivery is unavailable. Try again later."
        : "Email delivery is unavailable. Try again later.");
    } finally {
      setResending(false);
    }
  };

  const verified = state === "verified";
  const missingToken = !token;

  return (
    <AuthActionLayout
      title={verified ? "Email verified" : "Verify your email"}
      description={verified
        ? "Your email address is verified. You can now sign in."
        : missingToken
          ? "This link does not contain a verification token. Request a new link below."
          : state === "failed"
            ? message
            : "We are checking your verification link."}
      footer={<Link href="/auth/login" className="font-medium text-[var(--primary)] hover:underline">Back to sign in</Link>}
    >
      {verified ? (
        <Link href="/auth/login" className="inline-flex h-11 items-center justify-center rounded-lg bg-[var(--primary)] px-[20px] font-medium text-white hover:bg-[var(--primary-hover)]">
          Continue to sign in
        </Link>
      ) : state === "verifying" && !missingToken ? (
        <p role="status" className="text-sm text-[var(--text-secondary)]">Verifying link...</p>
      ) : (
        <form onSubmit={handleResend} className="space-y-[16px]">
          <Input
            label="Email address"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          {resendMessage && <p role="status" className="text-sm text-[var(--text-secondary)]">{resendMessage}</p>}
          <Button type="submit" className="w-full" isLoading={resending}>Request a new link</Button>
        </form>
      )}
    </AuthActionLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--background)]" />}>
      <VerificationContent />
    </Suspense>
  );
}
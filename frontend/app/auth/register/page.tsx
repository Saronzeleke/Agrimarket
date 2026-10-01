"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { authApi } from "@/lib/api/endpoints";
import { useAuthStore } from "@/lib/store/auth.store";
import { useUIStore } from "@/lib/store/ui.store";
import { ROUTES } from "@/lib/constants";

const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\+251[79]\d{8}$/, "Phone must be in format: +251XXXXXXXXX"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  role: z.enum(["CUSTOMER", "SELLER"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const { addToast } = useUIStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "CUSTOMER",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const { confirmPassword, ...registerData } = data;
      const response = await authApi.register(registerData);
      
      if (response.data.success && response.data.data) {
        const { user, accessToken } = response.data.data;
        login(user, accessToken);
        addToast("Registration successful", "success");
        router.push(user.role === "SELLER" ? ROUTES.DASHBOARD_SELLER : ROUTES.DASHBOARD_BUYER);
      }
    } catch (error: any) {
      addToast(error.response?.data?.error || "Registration failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAF5] py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#166534] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">A</span>
            </div>
            <h1 className="text-3xl font-bold text-[#1F2937]">Create Account</h1>
            <p className="text-[#6B7280] mt-2">Join AgriMarket today</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="John"
                error={errors.firstName?.message}
                {...register("firstName")}
              />
              <Input
                label="Last Name"
                placeholder="Doe"
                error={errors.lastName?.message}
                {...register("lastName")}
              />
            </div>

            <Input
              label="Email"
              type="email"
              placeholder="john@example.com"
              error={errors.email?.message}
              {...register("email")}
            />

            <Input
              label="Phone"
              type="tel"
              placeholder="+251912345678"
              helperText="Format: +251XXXXXXXXX"
              error={errors.phone?.message}
              {...register("phone")}
            />

            <Select
              label="Account Type"
              options={[
                { value: "CUSTOMER", label: "Buyer - I want to purchase products" },
                { value: "SELLER", label: "Seller - I want to sell products" },
              ]}
              error={errors.role?.message}
              {...register("role")}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Minimum 6 characters"
              error={errors.password?.message}
              {...register("password")}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

            <div className="flex items-start">
              <input
                type="checkbox"
                required
                className="w-4 h-4 text-[#166534] border-gray-300 rounded focus:ring-[#166534] mt-1"
              />
              <label className="ml-2 text-sm text-[#6B7280]">
                I agree to the{" "}
                <Link href="/terms" className="text-[#166534] hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-[#166534] hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[#6B7280]">
              Already have an account?{" "}
              <Link href={ROUTES.LOGIN} className="text-[#166534] font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

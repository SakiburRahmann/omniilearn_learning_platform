"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Mail, Lock, User, Loader2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";
import { api } from "@/utils/trpc";

export default function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();
  
  const syncProfile = api.user.syncProfile.useMutation({
    onSuccess: () => {
      router.push("/dashboard");
      router.refresh();
    },
    onError: (err) => {
      setError(err.message || "Failed to finalize profile. Please contact support.");
    }
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;

    try {
      // 1. Sign up with Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });

      if (signUpError) {
        if (signUpError.message.includes("already registered") || signUpError.status === 400) {
          setError("This email is already registered. Please log in instead.");
        } else {
          setError(signUpError.message);
        }
        setLoading(false);
        return;
      }
      
      if (!data.user) throw new Error("Authentication failed.");

      // 2. Sync to Prisma via tRPC (Identity handled server-side)
      await syncProfile.mutateAsync();
      
      router.push("/dashboard");

    } catch (err) {
      const error = err as Error;
      setError(error.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 md:px-0 py-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="duo-card p-6 md:p-8"
      >
        <div className="mb-6 flex justify-center">
          <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#E5E5E5] rounded-xl hover:bg-[#F7F7F7] transition-all group shadow-sm">
            <ArrowRight className="w-4 h-4 text-[#AFAFAF] rotate-180 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase text-[#AFAFAF] tracking-wide">Back to Home</span>
          </Link>
        </div>
        <h2 className="text-3xl md:text-4xl font-black mb-2 tracking-tight text-[#4B4B4B] text-center">Create Profile</h2>
        <p className="text-[#AFAFAF] mb-8 md:mb-10 text-center font-bold text-sm md:text-base">Join the world's most effective learners!</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] md:text-sm font-black text-[#4B4B4B] uppercase tracking-wide ml-1">First Name</label>
              <div className="relative group">
                <input
                  required
                  name="firstName"
                  type="text"
                  placeholder="Sakibur"
                  className="w-full bg-[#F7F7F7] border-2 border-[#E5E5E5] rounded-2xl py-3 md:py-4 px-5 text-sm font-bold focus:border-primary outline-none transition-all placeholder:text-[#AFAFAF]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] md:text-sm font-black text-[#4B4B4B] uppercase tracking-wide ml-1">Last Name</label>
              <div className="relative group">
                <input
                  required
                  name="lastName"
                  type="text"
                  placeholder="Rahman"
                  className="w-full bg-[#F7F7F7] border-2 border-[#E5E5E5] rounded-2xl py-3 md:py-4 px-5 text-sm font-bold focus:border-primary outline-none transition-all placeholder:text-[#AFAFAF]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] md:text-sm font-black text-[#4B4B4B] uppercase tracking-wide ml-1">Email Address</label>
            <input
              required
              name="email"
              type="email"
              placeholder="sakibur@example.com"
              className="w-full bg-[#F7F7F7] border-2 border-[#E5E5E5] rounded-2xl py-3 md:py-4 px-5 text-sm font-bold focus:border-primary outline-none transition-all placeholder:text-[#AFAFAF]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] md:text-sm font-black text-[#4B4B4B] uppercase tracking-wide ml-1">Password</label>
            <input
              required
              name="password"
              type="password"
              placeholder="••••••••"
              className="w-full bg-[#F7F7F7] border-2 border-[#E5E5E5] rounded-2xl py-3 md:py-4 px-5 text-sm font-bold focus:border-primary outline-none transition-all placeholder:text-[#AFAFAF]"
            />
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#FFF5F5] border-2 border-[#FF4B4B]/20 rounded-2xl p-4 flex items-center gap-3"
            >
              <div className="w-2 h-2 rounded-full bg-[#FF4B4B]" />
              <p className="text-sm font-black text-[#FF4B4B]">{error}</p>
            </motion.div>
          )}

          <button
            disabled={loading}
            className="duo-button-secondary w-full uppercase h-14"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                Create Account
                <ArrowRight className="w-6 h-6" />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t-2 border-[#E5E5E5] text-center">
          <p className="text-[#AFAFAF] font-bold">
            Already a learner?{" "}
            <Link href="/login" className="text-primary hover:brightness-90 transition-all font-black uppercase">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

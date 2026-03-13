"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Mail, Lock, User, ShieldCheck, Loader2 } from "lucide-react";
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

      if (signUpError) throw signUpError;
      if (!data.user) throw new Error("Authentication failed.");

      // 2. Sync to Prisma via tRPC
      await syncProfile.mutateAsync({
        email,
        firstName,
        lastName,
        supabaseId: data.user.id,
      });

    } catch (err) {
      const error = err as Error;
      setError(error.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-10 rounded-[2.5rem] relative overflow-hidden"
      >
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-2 tracking-tight">Create Account</h2>
          <p className="text-white/40 mb-8 text-sm">Join the global elite learners today.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/50 px-1 uppercase tracking-wider">First Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                  <input
                    required
                    name="firstName"
                    type="text"
                    placeholder="Sakibur"
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:bg-white/10 focus:border-primary/50 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/50 px-1 uppercase tracking-wider">Last Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                  <input
                    required
                    name="lastName"
                    type="text"
                    placeholder="Rahman"
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:bg-white/10 focus:border-primary/50 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/50 px-1 uppercase tracking-wider">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                <input
                  required
                  name="email"
                  type="email"
                  placeholder="sakibur@example.com"
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:bg-white/10 focus:border-primary/50 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/50 px-1 uppercase tracking-wider">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                <input
                  required
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:bg-white/10 focus:border-primary/50 outline-none transition-all"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs font-medium text-red-400 px-1">{error}</p>
            )}

            <button
              disabled={loading}
              className="w-full bg-primary py-4 rounded-2xl font-bold text-lg mt-4 h-14 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-xl shadow-primary/20"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-white/30 text-xs mt-8">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-bold hover:underline underline-offset-4">
              Log In
            </Link>
          </p>
        </div>
        
        {/* Background Highlight */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] pointer-events-none" />
      </motion.div>

      <div className="mt-8 flex items-center justify-center gap-2 text-white/20">
        <ShieldCheck className="w-4 h-4" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Enterprise Grade Security</span>
      </div>
    </div>
  );
}

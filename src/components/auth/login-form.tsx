"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Mail, Lock, Loader2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto py-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="duo-card"
      >
        <h2 className="text-4xl font-black mb-2 tracking-tight text-[#4B4B4B] text-center">Welcome Back</h2>
        <p className="text-[#AFAFAF] mb-10 text-center font-bold">Log in to keep leveling up!</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-black text-[#4B4B4B] uppercase tracking-wide ml-1">Email Address</label>
            <input
              required
              name="email"
              type="email"
              placeholder="sakibur@example.com"
              className="w-full bg-[#F7F7F7] border-2 border-[#E5E5E5] rounded-2xl py-4 px-5 text-sm font-bold focus:border-secondary outline-none transition-all placeholder:text-[#AFAFAF]"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-sm font-black text-[#4B4B4B] uppercase tracking-wide">Password</label>
              <Link href="#" className="text-xs font-black text-secondary hover:brightness-90 uppercase transition-all">
                Forgot?
              </Link>
            </div>
            <input
              required
              name="password"
              type="password"
              placeholder="••••••••"
              className="w-full bg-[#F7F7F7] border-2 border-[#E5E5E5] rounded-2xl py-4 px-5 text-sm font-bold focus:border-secondary outline-none transition-all placeholder:text-[#AFAFAF]"
            />
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#FFF5F5] border-2 border-[#FF4B4B] rounded-2xl p-4 flex items-center gap-3"
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
                Sign In
                <ArrowRight className="w-6 h-6" />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t-2 border-[#E5E5E5] text-center">
          <p className="text-[#AFAFAF] font-bold">
            New to OmniiLearn?{" "}
            <Link href="/register" className="text-primary hover:brightness-90 transition-all font-black uppercase">
              Join Now
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

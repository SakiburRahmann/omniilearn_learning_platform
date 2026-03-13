"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Mail, Lock, Loader2, Key } from "lucide-react";
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
    } catch (err: any) {
      setError(err.message || "Invalid credentials.");
    } finally {
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
          <h2 className="text-3xl font-black mb-2 tracking-tight">Welcome Back</h2>
          <p className="text-white/40 mb-8 text-sm">Pick up where you left off.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Password</label>
                <Link href="#" className="text-[10px] font-bold text-primary/60 hover:text-primary transition-colors uppercase tracking-widest">
                  Forgot?
                </Link>
              </div>
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

            <button
              disabled={loading}
              className="w-full bg-primary py-4 rounded-2xl font-bold text-lg mt-4 h-14 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-xl shadow-primary/20"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-white/30 text-xs mt-8">
            New to OmniiLearn?{" "}
            <Link href="/register" className="text-primary font-bold hover:underline underline-offset-4">
              Join Now
            </Link>
          </p>
        </div>
        
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent/20 blur-[60px] pointer-events-none" />
      </motion.div>
      
      <div className="mt-8 flex items-center justify-center gap-2 text-white/20">
        <Key className="w-4 h-4" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Secure session management</span>
      </div>
    </div>
  );
}

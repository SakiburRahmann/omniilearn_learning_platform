"use client";

import { motion } from "framer-motion";
import { Trophy, Book, Star, Zap, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Trophy className="text-white w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Main Dashboard</h1>
              <p className="text-white/40 text-sm font-medium">Welcome back, Scholar.</p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="glass px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-red-500/10 hover:border-red-500/20 transition-all font-bold text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-8 rounded-[2rem] col-span-1 md:col-span-2 relative overflow-hidden group"
          >
            <div className="relative z-10">
              <Book className="text-primary w-8 h-8 mb-6" />
              <h2 className="text-3xl font-black mb-2">Continue Learning</h2>
              <p className="text-white/40 mb-8">You were halfway through "Intro to Systems".</p>
              <button className="bg-primary px-8 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all">
                Resume Lesson
              </button>
            </div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 blur-[80px] group-hover:bg-primary/20 transition-colors" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass p-8 rounded-[2rem] flex flex-col justify-between"
          >
            <Star className="text-accent w-8 h-8 mb-4 outline-none" />
            <div>
              <span className="text-4xl font-black block">1,250</span>
              <span className="text-white/40 font-bold uppercase tracking-widest text-xs">Total XP Earned</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass p-8 rounded-[2rem] flex flex-col justify-between"
          >
            <Zap className="text-secondary w-8 h-8 mb-4" />
            <div>
              <span className="text-4xl font-black block">5 Days</span>
              <span className="text-white/40 font-bold uppercase tracking-widest text-xs">Current Streak</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

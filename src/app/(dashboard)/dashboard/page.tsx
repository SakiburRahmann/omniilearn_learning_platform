"use client";

import { motion } from "framer-motion";
import { Flame, Heart, Star, Target, Zap } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-8 pb-12">
      {/* Header Info Bar */}
      <section className="flex items-center justify-between gap-6 px-4 py-4 bg-white border-b-2 border-[#E5E5E5] sticky top-0 z-40">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 group cursor-pointer">
            <Flame className="w-6 h-6 text-primary" />
            <span className="font-black text-primary">0</span>
          </div>
          <div className="flex items-center gap-2 group cursor-pointer">
            <Star className="w-6 h-6 text-[#FFC800]" />
            <span className="font-black text-[#FFC800]">50</span>
          </div>
          <div className="flex items-center gap-2 group cursor-pointer">
            <Heart className="w-6 h-6 text-[#FF4B4B]" />
            <span className="font-black text-[#FF4B4B]">5</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-12">
          <header>
            <h1 className="text-3xl font-black text-[#4B4B4B] mb-2">Welcome back!</h1>
            <p className="text-lg font-bold text-[#AFAFAF]">Time to smash your daily goals.</p>
          </header>

          <div className="space-y-10">
            {/* Active Learning Chapter */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="duo-card relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                 <Zap className="w-24 h-24 text-primary" />
              </div>
              <div className="flex flex-col gap-6">
                 <div className="space-y-1">
                    <span className="text-sm font-black text-secondary uppercase tracking-widest">Current Unit</span>
                    <h2 className="text-2xl font-black text-[#4B4B4B]">Social Intelligence 101</h2>
                 </div>
                 <div className="h-4 bg-[#E5E5E5] rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-1/3" />
                 </div>
                 <button className="duo-button-primary uppercase py-4">
                    Continue Learning
                 </button>
              </div>
            </motion.div>

            {/* Daily Quests */}
            <div className="space-y-4">
               <h3 className="text-xl font-black text-[#4B4B4B] uppercase tracking-wide">Daily Quests</h3>
               {[
                 { label: "Earn 20 XP", progress: 0, total: 20, icon: Target },
                 { label: "Read 1 Article", progress: 0, total: 1, icon: Target },
               ].map((quest, i) => (
                 <div key={i} className="flex items-center gap-6 p-6 border-2 border-[#E5E5E5] rounded-2xl bg-white shadow-[0_4px_0_0_#F0F0F0]">
                    <div className="w-12 h-12 bg-[#F7F7F7] rounded-xl flex items-center justify-center">
                       <quest.icon className="text-[#AFAFAF] w-6 h-6" />
                    </div>
                    <div className="flex-1 space-y-2">
                       <div className="flex justify-between items-end">
                          <span className="font-black text-[#4B4B4B]">{quest.label}</span>
                          <span className="text-sm font-bold text-[#AFAFAF]">{quest.progress}/{quest.total}</span>
                       </div>
                       <div className="h-3 bg-[#E5E5E5] rounded-full overflow-hidden">
                          <div className="h-full bg-secondary w-0" />
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
           {/* Level Widget */}
           <div className="duo-card flex flex-col items-center text-center p-10">
              <div className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center shadow-[0_8px_0_0_#E6722D] mb-6 mb-8 transform -rotate-3 group cursor-pointer hover:rotate-0 transition-transform">
                 <span className="text-4xl font-black text-white">1</span>
              </div>
              <h3 className="text-xl font-black text-[#4B4B4B] mb-2">Novice Learner</h3>
              <p className="text-sm font-bold text-[#AFAFAF] mb-6">Earn 50 more XP to reach Level 2!</p>
              <div className="w-full h-3 bg-[#E5E5E5] rounded-full overflow-hidden mb-8">
                 <div className="h-full bg-primary w-1/4" />
              </div>
              <button className="duo-button-ghost w-full uppercase py-3 text-sm">
                 View Badges
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}

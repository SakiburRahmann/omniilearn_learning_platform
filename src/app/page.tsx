"use client";

import { motion } from "framer-motion";
import { ArrowRight, Trophy, BookOpen, Users, Star, GraduationCap } from "lucide-react";
import Link from "next/link";
import { ModularAvatar, DEFAULT_AVATAR } from "@/components/avatar/modular-avatar";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white font-nunito overflow-x-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b-2 border-[#E5E5E5] px-4 md:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-[0_4px_0_0_#E6722D]">
              <Trophy className="text-white w-6 h-6" />
            </div>
            <span className="text-xl md:text-2xl font-black tracking-tight text-primary">OmniiLearn</span>
          </div>
          
          <div className="flex items-center gap-6">
            <Link href="/login" className="font-black text-[#AFAFAF] uppercase tracking-wide text-xs hover:text-primary transition-colors">Login</Link>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 py-12 md:py-24 flex flex-col md:flex-row items-center gap-8 md:gap-12 text-center md:text-left">
          <div className="flex-1 flex justify-center md:justify-end order-1 md:order-2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="relative w-64 h-64 md:w-[400px] md:h-[400px]"
            >
              <div className="w-full h-full bg-[#E8E8E8] rounded-[3rem] border-4 border-[#E5E5E5] flex items-center justify-center shadow-inner overflow-hidden">
                <ModularAvatar 
                  config={DEFAULT_AVATAR}
                  size={300}
                  showBackground={false}
                />
              </div>
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border-2 border-[#E5E5E5] font-black text-primary text-sm transform rotate-12 hidden md:block"
              >
                Let's Learn! 🚀
              </motion.div>
            </motion.div>
          </div>

          <div className="flex-1 order-2 md:order-1 flex flex-col items-center md:items-start max-w-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#4B4B4B] mb-6 md:mb-8 leading-tight">
              The energizing way to master any skill.
            </h1>
            
            <div className="flex flex-col gap-4 w-full max-w-sm">
              <Link
                href="/register"
                className="duo-button-primary w-full uppercase py-3 md:py-4 text-base md:text-lg"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="duo-button-ghost w-full uppercase py-3 md:py-4 text-sm md:text-base border-2"
              >
                I already have an account
              </Link>
            </div>
          </div>
        </section>

        {/* Info Strip */}
        <section className="border-y-2 border-[#E5E5E5] py-8 bg-[#F7F7F7]/30">
           <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-20">
              <div className="flex items-center gap-4 justify-center md:justify-start">
                 <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center shadow-[0_4px_0_0_#6263E1] shrink-0">
                    <Star className="text-white w-6 h-6" />
                 </div>
                 <span className="font-black text-[#4B4B4B] uppercase tracking-wide text-xs sm:text-sm">Premium Content</span>
              </div>
              <div className="flex items-center gap-4 justify-center md:justify-start">
                 <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-[0_4px_0_0_#E6722D] shrink-0">
                    <Users className="text-white w-6 h-6" />
                 </div>
                 <span className="font-black text-[#4B4B4B] uppercase tracking-wide text-xs sm:text-sm">Global Social</span>
              </div>
              <div className="flex items-center gap-4 justify-center md:justify-start">
                 <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center shadow-[0_4px_0_0_#4BCE8F] shrink-0">
                    <GraduationCap className="text-white w-6 h-6" />
                 </div>
                 <span className="font-black text-[#4B4B4B] uppercase tracking-wide text-xs sm:text-sm">AI Tutors</span>
              </div>
           </div>
        </section>

        {/* Feature Highlights */}
        <section className="max-w-7xl mx-auto px-6 py-16 md:py-32 space-y-24 md:space-y-40">
           <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
              <div className="flex-1 text-center md:text-left">
                 <h2 className="text-3xl md:text-5xl font-black text-primary mb-6">fun. fast. effective.</h2>
                 <p className="text-lg md:text-xl font-bold text-[#777777] leading-relaxed">
                    OmniiLearn is built to keep your brain engaged and oxygenated. With scientifically-backed game mechanics, you'll reach your goals faster than ever.
                 </p>
              </div>
              <div className="flex-1 duo-card w-full max-w-md">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="w-4 h-4 rounded-full bg-primary" />
                    <div className="h-4 flex-grow bg-[#E5E5E5] rounded-full overflow-hidden">
                       <div className="h-full bg-primary animate-pulse w-3/4" />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                       <div key={i} className="h-20 md:h-24 bg-[#F7F7F7] rounded-2xl border-2 border-[#E5E5E5] flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-[#E5E5E5]" />
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-primary py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-8 md:mb-12">Start your adventure today.</h2>
          <div className="flex justify-center flex-col sm:flex-row gap-4 sm:gap-6 px-4">
             <Link href="/register" className="duo-button-ghost bg-white text-primary shadow-[0_4px_0_0_#D7D7D7] border-none px-8 py-4 uppercase text-lg sm:text-xl shrink-0">
                Get Started
             </Link>
          </div>
          <div className="mt-12 md:mt-20 pt-8 md:pt-12 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-8 text-white/60 font-black uppercase text-xs md:text-sm">
             <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 font-black" />
                <span className="tracking-widest">OmniiLearn</span>
             </div>
             <div className="flex gap-6 md:gap-8 flex-wrap justify-center">
                <Link href="#" className="hover:text-white transition-colors">About</Link>
                <Link href="#" className="hover:text-white transition-colors">Courses</Link>
                <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

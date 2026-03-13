"use client";

import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Trophy, Users, Zap } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-[100px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
            <Trophy className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight">OmniiLearn</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="px-4 py-2 text-sm font-medium hover:text-primary transition-colors"
          >
            Login
          </Link>
          <Link 
            href="/register" 
            className="glass px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-white/10 transition-all active:scale-95"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-6 text-center max-w-5xl mx-auto py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/60 mb-8"
        >
          <Zap className="w-3 h-3 text-primary" />
          <span>The Future of Gamified Education</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[1.05]"
        >
          Learn Anything. <br />
          <span className="text-gradient">Level Up Every Day.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-white/50 max-w-2xl mb-12 leading-relaxed"
        >
          Master new skills through bite-sized, gamified lessons. 
          Compete in leagues, earn legendary badges, and build your own avatar.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link
            href="/register"
            className="group relative px-8 py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-2xl shadow-primary/30 hover:scale-105 transition-all active:scale-95 flex items-center gap-2"
          >
            Start Your Journey
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/courses"
            className="glass px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all active:scale-95"
          >
            Explore Courses
          </Link>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 w-full text-left"
        >
          <div className="glass p-8 rounded-3xl group hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
              <BookOpen className="text-primary w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Modular Lessons</h3>
            <p className="text-white/40 leading-relaxed">Structured learning paths designed for maximum retention and minimum friction.</p>
          </div>
          
          <div className="glass p-8 rounded-3xl group hover:border-accent/50 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
              <Trophy className="text-accent w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Global Leagues</h3>
            <p className="text-white/40 leading-relaxed">Compete with learners worldwide. Climb the ranks from Bronze to Legendary.</p>
          </div>

          <div className="glass p-8 rounded-3xl group hover:border-secondary/50 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 group-hover:bg-secondary/20 transition-colors">
              <Users className="text-secondary w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Social Learning</h3>
            <p className="text-white/40 leading-relaxed">Share, discuss, and learn together with a worldwide community of peers.</p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Trophy className="text-primary w-5 h-5" />
            <span className="font-bold">OmniiLearn</span>
          </div>
          <p className="text-white/20 text-sm">© 2026 OmniiLearn. Built for global excellence.</p>
          <div className="flex gap-6 text-sm text-white/40">
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { Flame, Heart, Zap, Trophy } from "lucide-react";
import { api } from "@/utils/trpc";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface GamifiedProfile {
  heartsCurrent: number;
  heartsLastRefill: Date;
  currentStreak: number;
  longestStreak: number;
  totalXp: number;
  isStreakActiveToday: boolean;
  nextRegenMs?: number;
}

export function TopStats() {
  const { data: user } = api.user.getProfile.useQuery(undefined, {
    refetchInterval: 30000, 
  });

  const profile = user?.studentProfile as GamifiedProfile | undefined;
  const streakActive = profile?.isStreakActiveToday ?? false;

  return (
    <div className="flex items-center justify-between lg:justify-end gap-3 w-full px-4 py-3 bg-white lg:bg-transparent backdrop-blur-md sticky top-0 z-40 border-b-2 lg:border-none border-[#E5E5E5] transition-all duration-300">
      {/* Mobile Branding - Duolingo Style */}
      <Link href="/dashboard" className="flex items-center gap-2 lg:hidden group">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-[0_3px_0_0_#E6722D] group-active:translate-y-[1px] group-active:shadow-none transition-all">
          <Trophy className="text-white w-5 h-5" />
        </div>
        <span className="text-xl font-black text-primary tracking-tight">Omnii</span>
      </Link>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Streak Stat - Capsule Container */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#E5E5E5] rounded-2xl shadow-[0_3px_0_0_#E5E5E5] transition-all cursor-default select-none group">
          <Flame className={cn(
            "w-6 h-6 transition-all duration-300",
            streakActive 
              ? "text-[#FF9600] fill-[#FF9600] drop-shadow-[0_0_8px_rgba(255,150,0,0.3)]" 
              : "text-[#AFAFAF] grayscale opacity-40"
          )} />
          <span className={cn(
            "font-black text-lg min-w-[1ch] text-center",
            streakActive ? "text-[#FF9600]" : "text-[#AFAFAF]"
          )}>
            {profile?.currentStreak ?? 0}
          </span>
        </div>

        {/* XP Stat - Capsule Container */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#E5E5E5] rounded-2xl shadow-[0_3px_0_0_#E5E5E5] transition-all cursor-default select-none">
          <Zap className="w-6 h-6 text-[#1CB0F6] fill-[#1CB0F6] drop-shadow-[0_0_8px_rgba(28,176,246,0.2)]" />
          <span className="font-black text-lg text-[#1CB0F6]">
            {profile?.totalXp ?? 0}
          </span>
        </div>

        {/* Hearts Stat - Capsule Container */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#E5E5E5] rounded-2xl shadow-[0_3px_0_0_#E5E5E5] transition-all cursor-default select-none relative">
          <Heart className={cn(
            "w-6 h-6 transition-all duration-300",
            (profile?.heartsCurrent ?? 0) > 0 
              ? "text-[#FF4B4B] fill-[#FF4B4B] drop-shadow-[0_0_8px_rgba(255,75,75,0.2)]" 
              : "text-[#AFAFAF] grayscale opacity-40"
          )} />
          <div className="flex flex-col">
            <span className={cn(
              "font-black text-lg leading-none",
              (profile?.heartsCurrent ?? 0) > 0 ? "text-[#FF4B4B]" : "text-[#AFAFAF]"
            )}>
              {profile?.heartsCurrent ?? 0}
            </span>
            {profile?.heartsCurrent !== undefined && profile.heartsCurrent < 5 && profile.nextRegenMs && (
              <span className="text-[8px] text-[#AFAFAF] font-black absolute -bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white px-1">
                {Math.ceil(profile.nextRegenMs / (60 * 1000))}m
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

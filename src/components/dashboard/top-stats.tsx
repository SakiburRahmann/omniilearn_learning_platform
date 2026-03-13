"use client";

import { Flame, Heart, Zap } from "lucide-react";
import { api } from "@/utils/trpc";
import { cn } from "@/lib/utils";

interface GamifiedProfile {
  heartsCurrent: number;
  heartsLastRefill: Date;
  currentStreak: number;
  longestStreak: number;
  totalXp: number;
  nextRegenMs?: number;
}

export function TopStats() {
  const { data: user } = api.user.getProfile.useQuery(undefined, {
    refetchInterval: 30000, // Refetch every 30s to update hearts/streaks visually
  });

  const profile = user?.studentProfile as GamifiedProfile | undefined;

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b lg:border-none lg:bg-transparent lg:static">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[#F7F7F7] transition-colors cursor-default group">
        <Flame className={cn(
          "w-6 h-6 transition-transform group-hover:scale-110 duration-300",
          (profile?.currentStreak ?? 0) > 0 ? "text-[#FF9600] fill-[#FF9600]/10" : "text-[#AFAFAF]"
        )} />
        <span className={cn(
          "font-black text-lg",
          (profile?.currentStreak ?? 0) > 0 ? "text-[#FF9600]" : "text-[#AFAFAF]"
        )}>
          {profile?.currentStreak ?? 0}
        </span>
      </div>

      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[#F7F7F7] transition-colors cursor-default group">
        <Zap className="w-6 h-6 text-[#1CB0F6] fill-[#1CB0F6]/10 transition-transform group-hover:scale-110 duration-300" />
        <span className="font-black text-lg text-[#1CB0F6]">
          {profile?.totalXp ?? 0}
        </span>
      </div>

      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[#F7F7F7] transition-colors cursor-default group relative">
        <Heart className={cn(
          "w-6 h-6 transition-transform group-hover:scale-110 duration-300",
          (profile?.heartsCurrent ?? 0) > 0 ? "text-[#FF4B4B] fill-[#FF4B4B]/10" : "text-[#AFAFAF]"
        )} />
        <div className="flex flex-col">
          <span className={cn(
            "font-black text-lg leading-none",
            (profile?.heartsCurrent ?? 0) > 0 ? "text-[#FF4B4B]" : "text-[#AFAFAF]"
          )}>
            {profile?.heartsCurrent ?? 0}
          </span>
          {profile?.heartsCurrent !== undefined && profile.heartsCurrent < 5 && profile.nextRegenMs && (
            <span className="text-[10px] text-[#AFAFAF] font-bold absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap">
              {Math.ceil(profile.nextRegenMs / (60 * 1000))}m
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

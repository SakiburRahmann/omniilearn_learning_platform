"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import { ModularAvatar } from "@/components/avatar/modular-avatar";
import { cn } from "@/lib/utils";
import { api } from "@/utils/trpc";

export default function ProfilePage() {
  // Cast the hook result to any to bypass Next.js deep type instantiation limits on Prisma.JsonValue
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profileData } = api.user.getProfile.useQuery(undefined) as any;

  // Force-cast to simple Record to kill excessive typescript recursion on Prisma.JsonValue
  const avatarConfig = profileData?.studentProfile?.avatarConfig as Record<string, unknown> | undefined;

  return (
    <div className="space-y-12 pb-12 animate-in fade-in duration-700">
      {/* Premium Profile Hero - Executive Layout */}
      <div className="duo-card overflow-hidden p-0 bg-white">
        {/* Banner Upgrade: Omnii Gradient */}
        <div className="relative h-64 bg-gradient-to-br from-primary via-primary/95 to-secondary overflow-hidden">
          {/* Subtle mesh pattern overlay */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.2)_1px,transparent_0)] bg-[length:24px_24px]" />
          
          {/* Action Button: Edit Avatar */}
          <Link
            href="/profile/avatar"
            className="absolute top-6 right-6 w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg hover:bg-white/30 hover:scale-105 active:scale-95 transition-all border border-white/30 group"
            aria-label="Edit Avatar"
          >
            <Pencil className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
          </Link>
        </div>

        {/* Avatar Layering: 240px Squircle Overlay */}
        <div className="flex flex-col items-center px-8 -mt-32 relative z-10">
          <div className="relative group">
            <div className="w-[240px] h-[240px] rounded-[3rem] bg-white border-[6px] border-white shadow-2xl flex items-center justify-center overflow-hidden transition-transform duration-500 hover:scale-[1.02]">
              <div className="w-full h-full bg-[#F7F7F7] flex items-center justify-center">
                <ModularAvatar
                  config={avatarConfig}
                  size={240}
                  showBackground={false}
                />
              </div>
            </div>
            {/* Rank Badge Overlay */}
            <div className="absolute -bottom-2 -right-2 bg-secondary text-white px-5 py-2 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl border-4 border-white">
              Silver Scholar
            </div>
          </div>

          <div className="mt-8 text-center pb-10">
            <h1 className="text-4xl font-black text-[#4B4B4B] tracking-tight mb-2">
              {profileData?.firstName} {profileData?.lastName}
            </h1>
            <div className="flex items-center justify-center gap-2 text-[#AFAFAF]">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <p className="text-sm font-bold uppercase tracking-widest">
                Member since {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: "Current Streak", 
            value: `${profileData?.studentProfile?.currentStreak || "0"} Days`, 
            icon: "🔥",
            color: "from-orange-400 to-primary",
            sub: "Keep the momentum!"
          },
          { 
            label: "Total Experience", 
            value: `${profileData?.studentProfile?.totalXp || "0"} XP`, 
            icon: "⚡",
            color: "from-blue-400 to-secondary",
            sub: "Ascending the ranks"
          },
          { 
            label: "League Standings", 
            value: "Bronze", 
            icon: "🛡️",
            color: "from-emerald-400 to-accent",
            sub: "Promoted in 2 days"
          },
          { 
            label: "Top Finishes", 
            value: "0 wins", 
            icon: "🏆",
            color: "from-amber-400 to-yellow-600",
            sub: "Collector of glory"
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="duo-card hover:translate-y-[-4px] transition-all duration-300 group"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={cn(
                "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-3xl shadow-lg transform group-hover:rotate-6 transition-transform",
                stat.color
              )}>
                {stat.icon}
              </div>
              <div>
                <p className="text-[10px] font-black text-[#AFAFAF] uppercase tracking-[0.2em] mb-1">
                  {stat.label}
                </p>
                <p className="font-black text-2xl text-[#4B4B4B]">{stat.value}</p>
                <p className="text-[10px] font-bold text-[#AFAFAF] mt-2 italic opacity-0 group-hover:opacity-100 transition-opacity">
                  {stat.sub}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

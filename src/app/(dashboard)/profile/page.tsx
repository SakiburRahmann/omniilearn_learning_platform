"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import { ModularAvatar, DEFAULT_AVATAR } from "@/components/avatar/modular-avatar";

import { api } from "@/utils/trpc";

export default function ProfilePage() {
  // Cast the hook result to any to bypass Next.js deep type instantiation limits on Prisma.JsonValue
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profileData } = api.user.getProfile.useQuery(undefined) as any;

  // Force-cast to simple Record to kill excessive typescript recursion on Prisma.JsonValue
  const avatarConfig = profileData?.studentProfile?.avatarConfig as Record<string, unknown> | undefined;

  return (
    <div className="space-y-8 pb-12">
      {/* Profile Header Card - Duolingo Style */}
      <div className="duo-card overflow-hidden p-0">
        {/* Avatar Banner */}
        <div className="relative bg-[#E8E8E8] h-48 flex items-end justify-center">
          <div className="w-40 h-40 -mb-8 relative shadow-lg rounded-full bg-white border-4 border-[#E5E5E5] flex items-center justify-center overflow-hidden">
            <ModularAvatar
              config={avatarConfig}
              size={160}
              showBackground={true}
            />
          </div>

          {/* Edit Avatar Button - Pencil icon like Duolingo */}
          <Link
            href="/profile/avatar"
            className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-transform border-2 border-[#E5E5E5]"
            aria-label="Edit Avatar"
          >
            <Pencil className="w-4 h-4 text-[#4B4B4B]" />
          </Link>
        </div>

        {/* User Info */}
        <div className="px-8 pt-12 pb-8 text-center">
          <h1 className="text-2xl font-black text-[#4B4B4B]">{profileData?.firstName} {profileData?.lastName}</h1>
          <p className="text-sm font-bold text-[#AFAFAF] mt-1">Joined March 2026</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Day Streak", value: profileData?.studentProfile?.currentStreak || "0", icon: "🔥" },
          { label: "Total XP", value: profileData?.studentProfile?.totalXp || "0", icon: "⚡" },
          { label: "Current League", value: "Bronze", icon: "🛡️" },
          { label: "Top Finishes", value: "0", icon: "🏆" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border-2 border-[#E5E5E5] rounded-2xl p-5 flex items-center gap-4"
          >
            <span className="text-2xl">{stat.icon}</span>
            <div>
              <p className="font-black text-[#4B4B4B] text-lg">{stat.value}</p>
              <p className="text-[10px] font-bold text-[#AFAFAF] uppercase tracking-wider">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

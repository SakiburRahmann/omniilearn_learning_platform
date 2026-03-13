"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, Trophy, User, Sparkles, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/utils/trpc";
import { ModularAvatar, DEFAULT_AVATAR } from "@/components/avatar/modular-avatar";
import type { AvatarConfig } from "@/components/avatar/modular-avatar";

const mobileItems = [
  { icon: Home, label: "Learn", href: "/dashboard" },
  { icon: Map, label: "Courses", href: "/courses" },
  { icon: Trophy, label: "Leagues", href: "/leagues" },
  { icon: Sparkles, label: "Quests", href: "/quests" },
  { icon: User, label: "Profile", href: "/profile" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function MobileNav({ className }: { className?: string }) {
  const pathname = usePathname();
  
  // Cast the hook result to any to bypass Next.js deep type instantiation limits on Prisma.JsonValue
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profileData } = api.user.getProfile.useQuery(undefined) as any;
  
  // Force-cast to simple Record to kill excessive typescript recursion on Prisma.JsonValue
  const avatarConfig = profileData?.studentProfile?.avatarConfig as Record<string, unknown> | undefined;

  return (
    <div className={cn("fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#E5E5E5] px-1 py-2 z-50 flex justify-between items-center", className)}>
      {mobileItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 p-1 rounded-xl transition-all flex-1 min-w-[50px]",
              isActive ? "text-primary scale-105" : "text-[#AFAFAF]"
            )}
          >
            {item.href === "/profile" ? (
              <div className={cn("w-5 h-5 rounded-full overflow-hidden border-2 mb-1", isActive ? "border-primary" : "border-transparent", !isActive && "opacity-70 grayscale")}>
                <ModularAvatar config={avatarConfig} size={20} showBackground={true} />
              </div>
            ) : (
              <item.icon className={cn("w-5 h-5", isActive && "fill-primary/20")} />
            )}
            <span className="text-[9px] font-black uppercase tracking-tighter whitespace-nowrap">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

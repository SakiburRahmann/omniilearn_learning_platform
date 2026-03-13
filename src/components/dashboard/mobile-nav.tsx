"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, Trophy, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/utils/trpc";
import { createClient } from "@/lib/supabase-client";
import { useState, useEffect } from "react";
import { ModularAvatar, DEFAULT_AVATAR } from "@/components/avatar/modular-avatar";
import type { AvatarConfig } from "@/components/avatar/modular-avatar";

const mobileItems = [
  { icon: Home, label: "Learn", href: "/dashboard" },
  { icon: Map, label: "Courses", href: "/courses" },
  { icon: Trophy, label: "Leagues", href: "/leagues" },
  { icon: Sparkles, label: "Quests", href: "/quests" },
  { icon: User, label: "Profile", href: "/profile" },
];

export function MobileNav({ className }: { className?: string }) {
  const pathname = usePathname();
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserId(data.user.id);
    });
  }, [supabase.auth]);
  
  const { data: profileData } = api.user.getProfile.useQuery({ userId: userId || "" }, {
    enabled: !!userId,
  });
  
  // @ts-expect-error - TS gets confused by the depth of AvatarConfig's type
  const avatarConfig: AvatarConfig = profileData?.studentProfile?.avatarConfig || DEFAULT_AVATAR;

  return (
    <div className={cn("fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#E5E5E5] px-2 py-2 z-50 flex justify-around items-center", className)}>
      {mobileItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all min-w-[64px]",
              isActive ? "text-primary scale-110" : "text-[#AFAFAF]"
            )}
          >
            {item.href === "/profile" ? (
              <div className={cn("w-6 h-6 rounded-full overflow-hidden border-2 mb-1", isActive ? "border-primary" : "border-transparent", !isActive && "opacity-70 grayscale")}>
                <ModularAvatar config={avatarConfig} size={24} showBackground={true} />
              </div>
            ) : (
              <item.icon className={cn("w-6 h-6", isActive && "fill-primary/20")} />
            )}
            <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

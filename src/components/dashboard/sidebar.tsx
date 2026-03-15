"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Home, 
  Map, 
  Trophy, 
  User, 
  Settings, 
  LogOut,
  Sparkles,
  Shield,
  Palette,
  Code2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase-client";
import { api } from "@/utils/trpc";
import { ModularAvatar, DEFAULT_AVATAR } from "@/components/avatar/modular-avatar";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  roles?: string[];
}

const navItems: NavItem[] = [
  { icon: Home, label: "Learn", href: "/dashboard", roles: ["STUDENT", "DEVELOPER"] },
  { icon: Map, label: "Courses", href: "/courses", roles: ["STUDENT", "DEVELOPER"] },
  { icon: Trophy, label: "Leaderboards", href: "/leagues", roles: ["STUDENT", "DEVELOPER"] },
  { icon: Sparkles, label: "Quests", href: "/quests", roles: ["STUDENT", "DEVELOPER"] },
  { icon: User, label: "Profile", href: "/profile", roles: ["STUDENT", "DEVELOPER"] },
  { icon: Settings, label: "Settings", href: "/settings", roles: ["STUDENT", "DEVELOPER"] },
  { icon: Palette, label: "Creator Studio", href: "/creator", roles: ["COURSE_CREATOR"] },
  { icon: Shield, label: "Admin Panel", href: "/admin", roles: ["ADMIN"] },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  
  // Cast the hook result to any to bypass Next.js deep type instantiation limits on Prisma.JsonValue
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profileData } = api.user.getProfile.useQuery(undefined) as any;
  
  const userRole: string = profileData?.role || "STUDENT";
  
  // Force-cast to simple Record to kill excessive typescript recursion on Prisma.JsonValue
  const avatarConfig = (profileData?.studentProfile?.avatarConfig as Record<string, unknown>) || DEFAULT_AVATAR;

  // Filter nav items based on user role
  const visibleItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(userRole);
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <aside className={cn("fixed left-0 top-0 h-screen w-64 border-r-2 border-[#E5E5E5] px-4 py-8 flex flex-col bg-white z-50", className)}>
      {/* Brand */}
      <div className="px-4 mb-10 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-[0_4px_0_0_#E6722D]">
          <Trophy className="text-white w-6 h-6" />
        </div>
        <span className="text-2xl font-black text-primary tracking-tight">Omnii</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-2xl font-black uppercase tracking-wide transition-all select-none",
                isActive 
                  ? "bg-[#E5E5E5]/30 text-primary border-2 border-primary shadow-[0_4px_0_0_#E6722D] translate-y-[-2px]" 
                  : "text-[#AFAFAF] hover:bg-[#F7F7F7] border-2 border-transparent"
              )}
            >
              {item.href === "/profile" ? (
                <div className={cn("w-8 h-8 rounded-full overflow-hidden border-2", isActive ? "border-primary" : "border-[#E5E5E5]")}>
                  <ModularAvatar config={avatarConfig} size={32} showBackground={true} />
                </div>
              ) : (
                <item.icon className={cn("w-6 h-6", isActive ? "text-primary" : "text-[#AFAFAF]")} />
              )}
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="mt-auto flex items-center gap-4 px-4 py-3 rounded-2xl font-black uppercase tracking-wide text-[#AFAFAF] hover:bg-[#FFF5F5] hover:text-[#FF4B4B] transition-all group"
      >
        <LogOut className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
        <span className="text-sm">Log Out</span>
      </button>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Map, 
  Trophy, 
  User, 
  Settings, 
  LogOut,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";

const navItems = [
  { icon: Home, label: "Learn", href: "/dashboard" },
  { icon: Map, label: "Courses", href: "/courses" },
  { icon: Trophy, label: "Leagues", href: "/leagues" },
  { icon: Sparkles, label: "Quests", href: "/quests" },
  { icon: User, label: "Profile", href: "/profile" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r-2 border-[#E5E5E5] px-4 py-8 flex flex-col bg-white z-50">
      {/* Brand */}
      <div className="px-4 mb-10 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-[0_4px_0_0_#E6722D]">
          <Trophy className="text-white w-6 h-6" />
        </div>
        <span className="text-2xl font-black text-primary tracking-tight">Omnii</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
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
              <item.icon className={cn("w-6 h-6", isActive ? "text-primary" : "text-[#AFAFAF]")} />
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

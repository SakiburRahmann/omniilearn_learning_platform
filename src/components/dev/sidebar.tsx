"use client";

import {
  Activity, Users, Terminal, Settings, LogOut,
  ShieldAlert, Database, Eye, BarChart3, Cpu,
  Monitor, Shield, Palette, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase-client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

interface SimulationItem {
  name: string;
  href: string;
  icon: any;
}

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { icon: Activity, label: "Console Overview", href: "/dev" },
  { icon: Users, label: "Identity Management", href: "/dev/users" },
  { icon: Database, label: "Operations Center", href: "/dev/actions" },
  { icon: Eye, label: "Identity Impersonation", href: "/dev/impersonate" },
  { icon: BarChart3, label: "Platform Analytics", href: "/dev/analytics" },
  { icon: ShieldAlert, label: "System Audit Logs", href: "/dev/logs" },
  { icon: Settings, label: "System Topology", href: "/dev/config" },
  { icon: Database, label: "Service Catalog", href: "/dev/services" },
  { icon: Zap, label: "Feature Flags", href: "/dev/flags" },
];

const simulationItems: SimulationItem[] = [
  { name: "STUDENT DASHBOARD", href: "/dashboard", icon: Monitor },
  { name: "ADMIN CONSOLE", href: "/admin", icon: Shield },
  { name: "CREATOR STUDIO", href: "/creator", icon: Palette },
];

export function DevSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <aside className={cn("fixed left-0 top-0 h-screen w-64 border-r border-dev-border bg-black/40 backdrop-blur-md flex flex-col z-[100] font-mono", className)}>
      {/* Brand / Logo */}
      <div className="p-6 border-b border-dev-border">
        <div className="flex items-center gap-3">
          <Cpu className="text-dev-accent w-6 h-6 animate-pulse" />
          <div className="text-xs font-black tracking-widest text-white">
            ARCHITECT<span className="text-dev-accent">_CONSOLE</span>
          </div>
        </div>
        <div className="mt-2 text-[8px] opacity-40 uppercase tracking-[0.2em]">Platform Core v2.4.0_Stable</div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2 text-[9px] uppercase font-bold opacity-30 tracking-widest">Management_Cluster</div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded transition-all group border border-transparent",
                isActive 
                  ? "bg-dev-accent/10 border-dev-accent/50 text-dev-accent shadow-[0_0_15px_rgba(0,163,255,0.1)]" 
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className={cn("w-4 h-4", isActive ? "text-dev-accent" : "group-hover:text-dev-accent")} />
              <span className="text-[11px] uppercase tracking-wider">{item.label}</span>
            </Link>
          );
        })}

        <div className="px-3 mt-6 mb-2 text-[9px] uppercase font-bold opacity-30 tracking-widest">Simulation_Engines</div>
        {simulationItems.map((item) => (
          <Link 
            key={item.href}
            href={item.href} 
            className="flex items-center gap-3 px-3 py-2 rounded text-white/50 hover:text-white hover:bg-white/5 transition-all group"
          >
            <item.icon className="w-4 h-4 group-hover:text-dev-accent" />
            <span className="text-[11px] uppercase tracking-wider">{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* Security Checkmark */}
      <div className="p-4 mx-4 mb-4 rounded border border-dev-accent/20 bg-dev-accent/5">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00FF41]" />
          <span className="text-[9px] text-white/70 font-bold uppercase">Node_Authorization</span>
        </div>
        <div className="text-[8px] opacity-40 leading-tight">All write operations are recorded in the System Audit Stream.</div>
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-dev-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded text-white/50 hover:text-[#FF3B30] hover:bg-[#FF3B30]/5 transition-all group"
        >
          <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-[11px] uppercase tracking-wider">Deauthorize_Session</span>
        </button>
      </div>
    </aside>
  );
}

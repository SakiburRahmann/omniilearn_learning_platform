"use client";

import { RoleGuard } from "@/components/guards/role-guard";
import { api } from "@/utils/trpc";
import { 
  Users, BookOpen, Activity, Zap, TrendingUp, 
  UserCheck, Layers, ChevronRight, Shield, Wrench,
  Eye, GraduationCap, Palette, Code2
} from "lucide-react";
import Link from "next/link";

function DevDashboardContent() {
  const { data: stats, isLoading } = api.dev.getStats.useQuery();
  const { data: maintenance } = api.dev.getMaintenanceStatus.useQuery();

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers, icon: Users, color: "#3CC7F5" },
    { label: "Students", value: stats?.totalStudents, icon: GraduationCap, color: "#58CC02" },
    { label: "Creators", value: stats?.totalCreators, icon: Palette, color: "#FF9600" },
    { label: "Courses", value: stats?.totalCourses, icon: BookOpen, color: "#FFC800" },
    { label: "Published", value: stats?.publishedCourses, icon: Layers, color: "#58CC02" },
    { label: "Lessons", value: stats?.totalLessons, icon: BookOpen, color: "#9B59B6" },
    { label: "Completions", value: stats?.totalCompletions, icon: Activity, color: "#FF4B4B" },
    { label: "Enrollments", value: stats?.totalEnrollments, icon: UserCheck, color: "#3CC7F5" },
    { label: "XP Events", value: stats?.totalXpEvents, icon: Zap, color: "#FFC800" },
    { label: "Active Today", value: stats?.activeToday, icon: TrendingUp, color: "#58CC02" },
    { label: "New This Week", value: stats?.registeredThisWeek, icon: Users, color: "#FF9600" },
  ];

  const quickLinks = [
    { label: "All Users", desc: "View and inspect every account on the platform", icon: Users, href: "/dev/users", color: "#3CC7F5" },
    { label: "Maintenance", desc: "Toggle maintenance mode and manage platform access", icon: Wrench, href: "/dev/maintenance", color: "#FF4B4B" },
    { label: "Test: Student View", desc: "Experience the platform as a student", icon: GraduationCap, href: "/dashboard", color: "#58CC02" },
    { label: "Test: Admin View", desc: "Test admin portal features", icon: Shield, href: "/admin", color: "#FF9600" },
    { label: "Test: Creator View", desc: "Test creator studio features", icon: Palette, href: "/creator", color: "#9B59B6" },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Maintenance Banner */}
      {maintenance?.maintenanceMode && (
        <div className="mb-6 p-4 bg-[#FF4B4B]/10 border-2 border-[#FF4B4B]/20 rounded-2xl flex items-center gap-3">
          <Wrench className="w-5 h-5 text-[#FF4B4B]" />
          <p className="font-black text-[#FF4B4B] text-sm">
            MAINTENANCE MODE ACTIVE — Platform is locked for non-developer users.
          </p>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 md:mb-12">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Code2 className="w-7 h-7 text-primary" />
            <h1 className="text-3xl md:text-4xl font-black text-[#4B4B4B] tracking-tight">Developer Portal</h1>
          </div>
          <p className="text-[#AFAFAF] font-bold text-base">Platform observability & management. Read-only by design.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-12">
        {statCards.map((card) => (
          <div key={card.label} className="duo-card p-4 md:p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${card.color}15` }}>
                <card.icon className="w-4 h-4" style={{ color: card.color }} />
              </div>
            </div>
            <p className="text-xl md:text-2xl font-black text-[#4B4B4B] tabular-nums">
              {isLoading ? "—" : (card.value ?? 0).toLocaleString()}
            </p>
            <p className="text-[10px] font-black text-[#AFAFAF] uppercase tracking-widest mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Access */}
      <h2 className="text-xl font-black text-[#4B4B4B] mb-4 uppercase tracking-wide">Portal Access</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href} className="group">
            <div className="duo-card p-5 flex items-center justify-between hover:scale-[1.01] transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${link.color}10` }}>
                  <link.icon className="w-6 h-6" style={{ color: link.color }} />
                </div>
                <div>
                  <p className="font-black text-[#4B4B4B]">{link.label}</p>
                  <p className="text-xs font-bold text-[#AFAFAF]">{link.desc}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#AFAFAF] group-hover:text-primary transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function DevPage() {
  return (
    <RoleGuard allowed={["DEVELOPER"]}>
      <DevDashboardContent />
    </RoleGuard>
  );
}

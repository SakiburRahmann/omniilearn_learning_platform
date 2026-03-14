"use client";

import { RoleGuard } from "@/components/guards/role-guard";
import { api } from "@/utils/trpc";
import { Users, BookOpen, GraduationCap, Palette, Plus, ChevronRight } from "lucide-react";
import Link from "next/link";

function AdminDashboardContent() {
  const { data: stats, isLoading } = api.admin.getStats.useQuery();

  const cards = [
    { label: "Students", value: stats?.userCount ?? 0, icon: GraduationCap, color: "#3CC7F5", href: "/admin/users?role=STUDENT" },
    { label: "Course Creators", value: stats?.creatorCount ?? 0, icon: Palette, color: "#58CC02", href: "/admin/users?role=COURSE_CREATOR" },
    { label: "Courses", value: stats?.courseCount ?? 0, icon: BookOpen, color: "#FFC800", href: "/admin/courses" },
    { label: "Enrollments", value: stats?.enrollmentCount ?? 0, icon: Users, color: "#FF4B4B", href: "#" },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 md:mb-12">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-[#4B4B4B] tracking-tight">Admin Panel</h1>
          <p className="text-[#AFAFAF] font-bold text-base mt-1">Manage users, courses, and platform settings.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="group">
            <div className="duo-card p-5 md:p-6 hover:scale-[1.02] transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${card.color}20` }}
                >
                  <card.icon className="w-5 h-5" style={{ color: card.color }} />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-black text-[#4B4B4B] tabular-nums">
                {isLoading ? "—" : card.value.toLocaleString()}
              </p>
              <p className="text-xs font-black text-[#AFAFAF] uppercase tracking-widest mt-1">{card.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-black text-[#4B4B4B] mb-4 uppercase tracking-wide">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/admin/users" className="duo-card p-5 flex items-center justify-between hover:scale-[1.01] transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#3CC7F5]/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-[#3CC7F5]" />
            </div>
            <div>
              <p className="font-black text-[#4B4B4B]">Manage Users</p>
              <p className="text-sm font-bold text-[#AFAFAF]">View, create, and manage user accounts</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#AFAFAF] group-hover:text-primary transition-colors" />
        </Link>

        <Link href="/admin/courses" className="duo-card p-5 flex items-center justify-between hover:scale-[1.01] transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FFC800]/10 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-[#FFC800]" />
            </div>
            <div>
              <p className="font-black text-[#4B4B4B]">Manage Courses</p>
              <p className="text-sm font-bold text-[#AFAFAF]">Create courses and assign creators</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#AFAFAF] group-hover:text-primary transition-colors" />
        </Link>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <RoleGuard allowed={["ADMIN", "DEVELOPER"]}>
      <AdminDashboardContent />
    </RoleGuard>
  );
}

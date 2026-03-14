"use client";

import { RoleGuard } from "@/components/guards/role-guard";
import { api } from "@/utils/trpc";
import { BookOpen, ChevronRight, Clock, Layers, Users } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "#AFAFAF",
  IN_REVIEW: "#FFC800",
  PUBLISHED: "#58CC02",
  REJECTED: "#FF4B4B",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  BEGINNER: "#58CC02",
  INTERMEDIATE: "#FFC800",
  ADVANCED: "#FF4B4B",
};

function CreatorDashboardContent() {
  const { data: courses, isLoading } = api.creator.getAssignedCourses.useQuery();

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-black text-[#4B4B4B] tracking-tight">Creator Studio</h1>
        <p className="text-[#AFAFAF] font-bold text-base mt-1">Manage your assigned courses and content.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="duo-card p-6 animate-pulse bg-gray-50 h-32 rounded-2xl" />
          ))}
        </div>
      ) : !courses?.length ? (
        <div className="duo-card p-12 text-center flex flex-col items-center gap-4 border-dashed bg-gray-50/50">
          <BookOpen className="w-12 h-12 text-[#AFAFAF] opacity-30" />
          <p className="text-[#AFAFAF] font-black uppercase tracking-widest text-sm">No courses assigned yet</p>
          <p className="text-[#AFAFAF] font-bold text-sm">Contact your admin to get assigned to a course.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course: any) => (
            <Link key={course.id} href={`/creator/course/${course.id}`} className="block group">
              <div className="duo-card p-5 md:p-6 hover:scale-[1.01] transition-all">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-xl font-black text-[#4B4B4B]">{course.title}</h3>
                      <span
                        className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider"
                        style={{ backgroundColor: `${STATUS_COLORS[course.status]}15`, color: STATUS_COLORS[course.status] }}
                      >
                        {course.status}
                      </span>
                      <span
                        className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider"
                        style={{ backgroundColor: `${DIFFICULTY_COLORS[course.difficulty]}15`, color: DIFFICULTY_COLORS[course.difficulty] }}
                      >
                        {course.difficulty}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-[#AFAFAF] mb-3">{course.subtitle}</p>
                    <div className="flex items-center gap-4 text-xs font-black text-[#AFAFAF]">
                      <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /> {course._count.units} units</span>
                      <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> {course._count.lessons} lessons</span>
                      <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {course._count.enrollments} enrolled</span>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-[#AFAFAF] group-hover:text-primary transition-colors shrink-0" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CreatorPage() {
  return (
    <RoleGuard allowed={["COURSE_CREATOR", "ADMIN", "DEVELOPER"]}>
      <CreatorDashboardContent />
    </RoleGuard>
  );
}

"use client";

import { RoleGuard } from "@/components/guards/role-guard";
import { api } from "@/utils/trpc";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Search, Eye, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

const ROLE_COLORS: Record<string, string> = {
  STUDENT: "#3CC7F5",
  COURSE_CREATOR: "#58CC02",
  ADMIN: "#FF9600",
  DEVELOPER: "#9B59B6",
};

function DevUsersContent() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const { data, isLoading } = api.dev.getAllUsers.useQuery({
    page,
    limit: 25,
    role: roleFilter as any,
    search: search || undefined,
  });

  const { data: userDetail } = api.dev.getUserDetail.useQuery(
    { userId: selectedUser! },
    { enabled: !!selectedUser }
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dev" className="p-2 rounded-xl border-2 border-[#E5E5E5] hover:bg-[#F7F7F7] transition-colors">
          <ArrowLeft className="w-4 h-4 text-[#AFAFAF]" />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#4B4B4B] tracking-tight">All Accounts</h1>
          <p className="text-[#AFAFAF] font-bold text-sm">{data ? `${data.total} total accounts` : "Loading..."}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AFAFAF]" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-[#F7F7F7] border-2 border-[#E5E5E5] rounded-2xl py-3 pl-11 pr-4 text-sm font-bold focus:border-primary outline-none transition-all placeholder:text-[#AFAFAF]"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[undefined, "STUDENT", "COURSE_CREATOR", "ADMIN", "DEVELOPER"].map((role) => (
            <button
              key={role ?? "all"}
              onClick={() => { setRoleFilter(role); setPage(1); }}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-2",
                roleFilter === role
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-[#E5E5E5] text-[#AFAFAF] hover:bg-[#F7F7F7]"
              )}
            >
              {role ?? "All"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-6">
        {/* User Table */}
        <div className={cn("duo-card overflow-hidden flex-1", selectedUser && "hidden md:block")}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-[#E5E5E5]">
                  <th className="text-left px-5 py-4 font-black text-[#AFAFAF] uppercase tracking-widest text-xs">User</th>
                  <th className="text-left px-5 py-4 font-black text-[#AFAFAF] uppercase tracking-widest text-xs hidden lg:table-cell">Email</th>
                  <th className="text-left px-5 py-4 font-black text-[#AFAFAF] uppercase tracking-widest text-xs">Role</th>
                  <th className="text-right px-5 py-4 font-black text-[#AFAFAF] uppercase tracking-widest text-xs">Inspect</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-[#F7F7F7]">
                      <td colSpan={4} className="px-5 py-4"><div className="h-6 bg-[#F7F7F7] rounded animate-pulse" /></td>
                    </tr>
                  ))
                ) : data?.users.map((user: any) => (
                  <tr
                    key={user.id}
                    className={cn(
                      "border-b border-[#F7F7F7] hover:bg-[#FAFAFA] transition-colors cursor-pointer",
                      selectedUser === user.id && "bg-primary/5"
                    )}
                    onClick={() => setSelectedUser(user.id)}
                  >
                    <td className="px-5 py-4 font-black text-[#4B4B4B]">{user.firstName} {user.lastName}</td>
                    <td className="px-5 py-4 text-[#AFAFAF] font-bold hidden lg:table-cell">{user.email}</td>
                    <td className="px-5 py-4">
                      <span
                        className="px-3 py-1 rounded-lg text-[10px] font-black uppercase"
                        style={{ backgroundColor: `${ROLE_COLORS[user.role]}15`, color: ROLE_COLORS[user.role] }}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button className="p-2 rounded-lg hover:bg-primary/10 text-[#AFAFAF] hover:text-primary transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data && data.pages > 1 && (
            <div className="flex items-center justify-center gap-4 p-4 border-t-2 border-[#E5E5E5]">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="p-2 rounded-lg border-2 border-[#E5E5E5] disabled:opacity-30 hover:bg-[#F7F7F7]">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-black text-[#AFAFAF]">Page {page} of {data.pages}</span>
              <button onClick={() => setPage(Math.min(data.pages, page + 1))} disabled={page === data.pages} className="p-2 rounded-lg border-2 border-[#E5E5E5] disabled:opacity-30 hover:bg-[#F7F7F7]">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* User Detail Panel (Read-Only) */}
        {selectedUser && userDetail && (
          <div className="duo-card p-6 w-full md:w-96 shrink-0">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-[#4B4B4B]">User Inspection</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-black text-[#AFAFAF] bg-[#F7F7F7] uppercase">Read Only</span>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black text-[#AFAFAF] uppercase tracking-widest">Name</p>
                <p className="font-black text-[#4B4B4B]">{userDetail.firstName} {userDetail.lastName}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-[#AFAFAF] uppercase tracking-widest">Email</p>
                <p className="font-bold text-sm text-[#4B4B4B]">{userDetail.email}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-[#AFAFAF] uppercase tracking-widest">Role</p>
                <span className="px-3 py-1 rounded-lg text-xs font-black" style={{ backgroundColor: `${ROLE_COLORS[userDetail.role]}15`, color: ROLE_COLORS[userDetail.role] }}>
                  {userDetail.role}
                </span>
              </div>
              {userDetail.studentProfile && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-[#F7F7F7] rounded-xl">
                      <p className="text-[10px] font-black text-[#AFAFAF] uppercase">XP</p>
                      <p className="font-black text-lg text-[#4B4B4B] tabular-nums">{userDetail.studentProfile.totalXp.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-[#F7F7F7] rounded-xl">
                      <p className="text-[10px] font-black text-[#AFAFAF] uppercase">Streak</p>
                      <p className="font-black text-lg text-[#4B4B4B] tabular-nums">{userDetail.studentProfile.currentStreak}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-[#F7F7F7] rounded-xl text-center">
                      <p className="text-[10px] font-black text-[#AFAFAF] uppercase">Lessons</p>
                      <p className="font-black text-[#4B4B4B] tabular-nums">{userDetail._count.completions}</p>
                    </div>
                    <div className="p-3 bg-[#F7F7F7] rounded-xl text-center">
                      <p className="text-[10px] font-black text-[#AFAFAF] uppercase">XP Events</p>
                      <p className="font-black text-[#4B4B4B] tabular-nums">{userDetail._count.xpEvents}</p>
                    </div>
                    <div className="p-3 bg-[#F7F7F7] rounded-xl text-center">
                      <p className="text-[10px] font-black text-[#AFAFAF] uppercase">Badges</p>
                      <p className="font-black text-[#4B4B4B] tabular-nums">{userDetail._count.userBadges}</p>
                    </div>
                  </div>
                </>
              )}
              {userDetail.enrollments.length > 0 && (
                <div>
                  <p className="text-[10px] font-black text-[#AFAFAF] uppercase tracking-widest mb-2">Enrollments</p>
                  <div className="space-y-1">
                    {userDetail.enrollments.map((e: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-[#F7F7F7] rounded-lg">
                        <p className="text-xs font-bold text-[#4B4B4B] truncate">{e.course.title}</p>
                        {e.isCompleted && <span className="text-[10px] font-black text-[#58CC02]">✓</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button onClick={() => setSelectedUser(null)} className="w-full mt-6 py-3 rounded-xl border-2 border-[#E5E5E5] font-black text-[#AFAFAF] text-sm hover:bg-[#F7F7F7] transition-all">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DevUsersPage() {
  return (
    <RoleGuard allowed={["DEVELOPER"]}>
      <DevUsersContent />
    </RoleGuard>
  );
}

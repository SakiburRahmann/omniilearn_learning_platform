"use client";

import { RoleGuard } from "@/components/guards/role-guard";
import { api } from "@/utils/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Search, UserPlus, Shield, ShieldBan, ChevronLeft, ChevronRight } from "lucide-react";

const ROLE_COLORS: Record<string, string> = {
  STUDENT: "#3CC7F5",
  COURSE_CREATOR: "#58CC02",
  ADMIN: "#FF9600",
  DEVELOPER: "#9B59B6",
};

const ROLE_LABELS: Record<string, string> = {
  STUDENT: "Student",
  COURSE_CREATOR: "Creator",
  ADMIN: "Admin",
  DEVELOPER: "Developer",
};

function UsersContent() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data, isLoading, refetch } = api.admin.listUsers.useQuery({
    page,
    limit: 20,
    role: roleFilter as any,
    search: search || undefined,
  });

  const suspendMutation = api.admin.suspendUser.useMutation({
    onSuccess: () => { toast.success("User suspended."); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const restoreMutation = api.admin.restoreUser.useMutation({
    onSuccess: () => { toast.success("User restored."); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const createCreator = api.admin.createCreatorAccount.useMutation({
    onSuccess: (data) => {
      toast.success(`Creator account created: ${data.email}`);
      setShowCreateModal(false);
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#4B4B4B] tracking-tight">User Management</h1>
          <p className="text-[#AFAFAF] font-bold text-sm mt-1">
            {data ? `${data.total} total users` : "Loading..."}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="duo-button-primary flex items-center gap-2 text-sm px-6 py-3"
        >
          <UserPlus className="w-4 h-4" />
          Create Creator
        </button>
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
          {[undefined, "STUDENT", "COURSE_CREATOR", "ADMIN"].map((role) => (
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
              {role ? ROLE_LABELS[role] : "All"}
            </button>
          ))}
        </div>
      </div>

      {/* User Table */}
      <div className="duo-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-[#E5E5E5]">
                <th className="text-left px-5 py-4 font-black text-[#AFAFAF] uppercase tracking-widest text-xs">User</th>
                <th className="text-left px-5 py-4 font-black text-[#AFAFAF] uppercase tracking-widest text-xs hidden md:table-cell">Email</th>
                <th className="text-left px-5 py-4 font-black text-[#AFAFAF] uppercase tracking-widest text-xs">Role</th>
                <th className="text-left px-5 py-4 font-black text-[#AFAFAF] uppercase tracking-widest text-xs hidden md:table-cell">XP</th>
                <th className="text-left px-5 py-4 font-black text-[#AFAFAF] uppercase tracking-widest text-xs">Status</th>
                <th className="text-right px-5 py-4 font-black text-[#AFAFAF] uppercase tracking-widest text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#F7F7F7]">
                    <td colSpan={6} className="px-5 py-4"><div className="h-6 bg-[#F7F7F7] rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : data?.users.map((user: any) => (
                <tr key={user.id} className="border-b border-[#F7F7F7] hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-5 py-4 font-black text-[#4B4B4B]">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-5 py-4 text-[#AFAFAF] font-bold hidden md:table-cell">{user.email}</td>
                  <td className="px-5 py-4">
                    <span
                      className="px-3 py-1 rounded-lg text-xs font-black uppercase"
                      style={{
                        backgroundColor: `${ROLE_COLORS[user.role]}15`,
                        color: ROLE_COLORS[user.role],
                      }}
                    >
                      {ROLE_LABELS[user.role]}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-black text-[#4B4B4B] tabular-nums hidden md:table-cell">
                    {user.studentProfile?.totalXp?.toLocaleString() ?? "—"}
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-lg text-xs font-black uppercase",
                      user.status === "VERIFIED" ? "bg-[#58CC02]/10 text-[#58CC02]" : "bg-[#FF4B4B]/10 text-[#FF4B4B]"
                    )}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    {user.role !== "DEVELOPER" && user.role !== "ADMIN" && (
                      user.status === "VERIFIED" ? (
                        <button
                          onClick={() => suspendMutation.mutate({ userId: user.id })}
                          className="text-[#FF4B4B] hover:bg-[#FF4B4B]/10 p-2 rounded-lg transition-colors"
                          title="Suspend"
                        >
                          <ShieldBan className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => restoreMutation.mutate({ userId: user.id })}
                          className="text-[#58CC02] hover:bg-[#58CC02]/10 p-2 rounded-lg transition-colors"
                          title="Restore"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.pages > 1 && (
          <div className="flex items-center justify-center gap-4 p-4 border-t-2 border-[#E5E5E5]">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border-2 border-[#E5E5E5] disabled:opacity-30 hover:bg-[#F7F7F7] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-black text-[#AFAFAF]">
              Page {page} of {data.pages}
            </span>
            <button
              onClick={() => setPage(Math.min(data.pages, page + 1))}
              disabled={page === data.pages}
              className="p-2 rounded-lg border-2 border-[#E5E5E5] disabled:opacity-30 hover:bg-[#F7F7F7] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Create Creator Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 md:p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-black text-[#4B4B4B] mb-6">Create Course Creator</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                createCreator.mutate({
                  firstName: fd.get("firstName") as string,
                  lastName: fd.get("lastName") as string,
                  email: fd.get("email") as string,
                  password: fd.get("password") as string,
                });
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-[#4B4B4B] uppercase tracking-wide block mb-1">First Name</label>
                  <input name="firstName" required className="w-full bg-[#F7F7F7] border-2 border-[#E5E5E5] rounded-xl py-3 px-4 text-sm font-bold focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="text-xs font-black text-[#4B4B4B] uppercase tracking-wide block mb-1">Last Name</label>
                  <input name="lastName" required className="w-full bg-[#F7F7F7] border-2 border-[#E5E5E5] rounded-xl py-3 px-4 text-sm font-bold focus:border-primary outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-black text-[#4B4B4B] uppercase tracking-wide block mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="name.coursedesigner@omniilearn.com"
                  className="w-full bg-[#F7F7F7] border-2 border-[#E5E5E5] rounded-xl py-3 px-4 text-sm font-bold focus:border-primary outline-none placeholder:text-[#AFAFAF]"
                />
                <p className="text-[10px] font-bold text-[#AFAFAF] mt-1">Format: name.coursedesigner@omniilearn.com</p>
              </div>
              <div>
                <label className="text-xs font-black text-[#4B4B4B] uppercase tracking-wide block mb-1">Password</label>
                <input name="password" type="password" required minLength={8} className="w-full bg-[#F7F7F7] border-2 border-[#E5E5E5] rounded-xl py-3 px-4 text-sm font-bold focus:border-primary outline-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-3 rounded-xl border-2 border-[#E5E5E5] font-black text-[#AFAFAF] text-sm hover:bg-[#F7F7F7] transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={createCreator.isPending} className="flex-1 duo-button-primary py-3 text-sm">
                  {createCreator.isPending ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <RoleGuard allowed={["ADMIN", "DEVELOPER"]}>
      <UsersContent />
    </RoleGuard>
  );
}

"use client";

import { api } from "@/utils/trpc";
import { 
  Users, Search, Shield, GraduationCap, 
  Palette, Terminal, MoreVertical, Edit3,
  UserPlus, Ban, CheckCircle2, X, Loader2
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function IdentityManagementPage() {
  const [search, setSearch] = useState("");
  const { data: users, isLoading, refetch } = api.dev.getAllUsers.useQuery({});
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  const updateUser = api.dev.adminOverrideUser.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedUser(null);
    }
  });

  const filteredUsers = users?.users?.filter((u: any) => 
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.firstName.toLowerCase().includes(search.toLowerCase()) ||
    u.lastName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="dev-title text-2xl mb-1">IDENTITY_MANAGEMENT_ENGINE</h1>
          <p className="text-[10px] uppercase font-bold tracking-widest opacity-50">Direct Identity Orchestration & Lifecycle Management</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
            <input 
              type="text" 
              placeholder="SEARCH_UUID_OR_EMAIL..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-black/40 border border-dev-border rounded px-10 py-2 font-mono text-xs focus:outline-none focus:border-dev-accent w-64"
            />
          </div>
          <button className="dev-button flex items-center gap-2">
            <UserPlus className="w-3 h-3" />
            PROVISION_TEST_IDENTITY
          </button>
        </div>
      </div>

      <div className="dev-card p-0 overflow-hidden">
        <table className="dev-table">
          <thead>
            <tr>
              <th>Identity</th>
              <th>Role_Cluster</th>
              <th>Status_Flag</th>
              <th>XP_Throughput</th>
              <th>Provisioned</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="font-mono text-xs">
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-8 opacity-50">SCANNING_DISTRIBUTED_NODES...</td></tr>
            ) : filteredUsers?.map((user: any) => (
              <tr key={user.id}>
                <td className="py-4">
                  <div className="font-bold">{user.firstName} {user.lastName}</div>
                  <div className="text-[10px] opacity-50 lowercase">{user.email}</div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    {user.role === "DEVELOPER" && <Terminal className="w-3 h-3 text-dev-accent" />}
                    {user.role === "ADMIN" && <Shield className="w-3 h-3 text-[#FF9600]" />}
                    {user.role === "COURSE_CREATOR" && <Palette className="w-3 h-3 text-[#9B59B6]" />}
                    {user.role === "STUDENT" && <GraduationCap className="w-3 h-3 text-[#58CC02]" />}
                    <span className="text-[10px] uppercase font-bold tracking-tighter">{user.role}</span>
                  </div>
                </td>
                <td>
                  <span className={`dev-badge ${user.status === 'VERIFIED' ? 'dev-badge-active' : 'dev-badge-alert'}`}>
                    {user.status}
                  </span>
                </td>
                <td>
                  <div className="text-[10px] opacity-50">
                    XP_VAL: {(user as any).studentProfile?.totalXp ?? 0}
                  </div>
                </td>
                <td className="opacity-50 text-[10px]">
                  {new Date(user.createdAt).toISOString().split('T')[0]}
                </td>
                <td>
                  <button 
                    onClick={() => setSelectedUser(user)}
                    className="p-2 hover:bg-dev-accent-muted rounded text-dev-accent transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Record Override Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="dev-card w-full max-w-md border-dev-accent shadow-[0_0_50px_rgba(0,163,255,0.1)]">
            <div className="flex items-center justify-between mb-6">
              <div className="dev-title text-sm">RECORD_OVERRIDE: {selectedUser.email}</div>
              <button onClick={() => setSelectedUser(null)} className="opacity-50 hover:opacity-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              await updateUser.mutateAsync({
                userId: selectedUser.id,
                data: {
                  role: formData.get("role") as any,
                  status: formData.get("status") as any,
                }
              });
            }} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="dev-stat-label block mb-1">Identity Role Authority (IMMUTABLE)</label>
                  <div className="w-full bg-black/20 border border-dev-border/50 rounded p-2 font-mono text-xs opacity-50 flex items-center gap-2">
                    {selectedUser.role === "DEVELOPER" && <Terminal className="w-3 h-3 text-dev-accent" />}
                    {selectedUser.role === "ADMIN" && <Shield className="w-3 h-3 text-[#FF9600]" />}
                    {selectedUser.role === "COURSE_CREATOR" && <Palette className="w-3 h-3 text-[#9B59B6]" />}
                    {selectedUser.role === "STUDENT" && <GraduationCap className="w-3 h-3 text-[#58CC02]" />}
                    {selectedUser.role}
                  </div>
                </div>

                <div>
                  <label className="dev-stat-label block mb-1">Account Lifecycle Status</label>
                  <select 
                    name="status" 
                    defaultValue={selectedUser.status}
                    className="w-full bg-black/40 border border-dev-border rounded p-2 font-mono text-xs focus:border-dev-accent outline-none"
                  >
                    <option value="VERIFIED">VERIFIED</option>
                    <option value="UNVERIFIED">UNVERIFIED</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                    <option value="DELETED">DELETED</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t border-dev-border space-y-3">
                <Link 
                  href={`/dev/users/${selectedUser.id}`}
                  className="dev-card py-3 flex items-center justify-center gap-2 hover:bg-dev-accent/10 border-dev-accent/30 text-dev-accent-light transition-all group"
                >
                  <Search className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest">LAUNCH_DEEP_INSPECTION</span>
                </Link>

                <button 
                  type="submit" 
                  disabled={updateUser.isPending}
                  className="dev-button w-full bg-dev-accent/10 border-dev-accent text-dev-accent py-3 flex items-center justify-center gap-2"
                >
                  {updateUser.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  COMMIT_RECORDS_OVERRIDE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

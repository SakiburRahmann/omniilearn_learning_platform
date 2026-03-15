"use client";

import { api } from "@/utils/trpc";
import { 
  User, Shield, GraduationCap, Palette, Terminal, 
  Clock, Database, Activity, Award, BookOpen, 
  ChevronLeft, AlertTriangle, FileJson, 
  CheckCircle2, Loader2, Save
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.id as string;
  const [activeTab, setActiveTab] = useState("OVERVIEW");

  const { data: user, isLoading, refetch } = api.dev.getUserDetail.useQuery({ userId });
  const updateProfile = api.dev.adminOverrideProfile.useMutation({
    onSuccess: () => refetch()
  });

  if (isLoading) return <div className="flex items-center justify-center min-h-[400px] font-mono text-xs opacity-50 uppercase tracking-widest animate-pulse">Querying_Records_Cluster...</div>;
  if (!user) return <div className="flex items-center justify-center min-h-[400px] text-red-500 font-mono text-xs uppercase">Identity_Not_Found_In_Registry</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dev/users" className="p-2 hover:bg-white/5 rounded transition-colors">
            <ChevronLeft className="w-5 h-5 opacity-50" />
          </Link>
          <div>
            <h1 className="dev-title text-2xl mb-1">DEEP_INSPECTION: {user.firstName}_{user.lastName}</h1>
            <p className="text-[10px] uppercase font-bold tracking-widest opacity-50">Identity_UUID: {user.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="dev-badge dev-badge-active flex items-center gap-2">
            <Activity className="w-3 h-3" />
            Live_Record_Link_Established
          </div>
        </div>
      </div>

      <div className="flex border-b border-dev-border gap-8">
        {["OVERVIEW", "PROGRESS_TRACKER", "ENROLLMENT_LOG", "RAW_PAYLOAD"].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-[10px] font-bold tracking-widest uppercase transition-all relative ${
              activeTab === tab ? "text-dev-accent" : "opacity-30 hover:opacity-100"
            }`}
          >
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-dev-accent" />}
          </button>
        ))}
      </div>

      {activeTab === "OVERVIEW" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="dev-card p-6">
              <h3 className="text-[10px] uppercase font-bold tracking-widest opacity-50 mb-6 flex items-center gap-2">
                <Shield className="w-4 h-4" /> AUTHORIZATION_METADATA
              </h3>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <div className="dev-stat-label">Role_Authority</div>
                  <div className="flex items-center gap-2 font-mono text-sm text-dev-accent-light">
                    {user.role === "DEVELOPER" && <Terminal className="w-4 h-4" />}
                    {user.role === "ADMIN" && <Shield className="w-4 h-4" />}
                    {user.role}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="dev-stat-label">Account_Status</div>
                  <div className="text-sm font-mono text-[#00FF41]">{user.status}</div>
                </div>
                <div className="space-y-1">
                  <div className="dev-stat-label">Communication_Endpoint</div>
                  <div className="text-sm font-mono opacity-80">{user.email}</div>
                </div>
                <div className="space-y-1">
                  <div className="dev-stat-label">Registry_Entry_Date</div>
                  <div className="text-sm font-mono opacity-80">{new Date(user.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            {user.studentProfile && (
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                updateProfile.mutate({
                  userId: user.id,
                  data: {
                    totalXp: Number(formData.get("totalXp")),
                    currentStreak: Number(formData.get("currentStreak")),
                    heartsCurrent: Number(formData.get("heartsCurrent")),
                  }
                });
              }} className="dev-card p-6">
                <h3 className="text-[10px] uppercase font-bold tracking-widest opacity-50 mb-6 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" /> PROFILE_ATTRIBUTES_OVERRIDE
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="space-y-2">
                    <label className="dev-stat-label block">XP_THROUGHPUT</label>
                    <input 
                      name="totalXp"
                      type="number" 
                      defaultValue={user.studentProfile.totalXp}
                      className="w-full bg-black/40 border border-dev-border rounded p-2 font-mono text-sm focus:border-dev-accent outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="dev-stat-label block">STREAK_STABILITY</label>
                    <input 
                      name="currentStreak"
                      type="number" 
                      defaultValue={user.studentProfile.currentStreak}
                      className="w-full bg-black/40 border border-dev-border rounded p-2 font-mono text-sm focus:border-dev-accent outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="dev-stat-label block">HEART_CORES_CURRENT</label>
                    <input 
                      name="heartsCurrent"
                      type="number" 
                      max={5}
                      defaultValue={user.studentProfile.heartsCurrent}
                      className="w-full bg-black/40 border border-dev-border rounded p-2 font-mono text-sm focus:border-dev-accent outline-none"
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={updateProfile.isPending}
                  className="dev-button-active flex items-center gap-2 px-8"
                >
                  {updateProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  SYNC_PROFILE_RECORDS
                </button>
              </form>
            )}
          </div>

          <div className="space-y-6">
            <div className="dev-card p-6">
              <h3 className="text-[10px] uppercase font-bold tracking-widest opacity-50 mb-6">RECORDS_SUMMARY</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 opacity-60">
                    <BookOpen className="w-3 h-3" />
                    <span className="text-[10px] uppercase font-bold">Enrollments</span>
                  </div>
                  <span className="font-mono text-xs">{user.enrollments.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 opacity-60">
                    <CheckCircle2 className="w-3 h-3" />
                    <span className="text-[10px] uppercase font-bold">Completions</span>
                  </div>
                  <span className="font-mono text-xs">{user._count.completions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 opacity-60">
                    <Award className="w-3 h-3" />
                    <span className="text-[10px] uppercase font-bold">Badges</span>
                  </div>
                  <span className="font-mono text-xs">{user._count.userBadges}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 opacity-60">
                    <Database className="w-3 h-3" />
                    <span className="text-[10px] uppercase font-bold">Telemetry_Events</span>
                  </div>
                  <span className="font-mono text-xs">{user._count.xpEvents}</span>
                </div>
              </div>
            </div>

            <div className="dev-card p-6 bg-red-500/5 border-red-500/20">
              <h3 className="text-[10px] uppercase font-bold tracking-widest text-red-500/70 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> DANGER_ZONE
              </h3>
              <p className="text-[9px] opacity-40 leading-relaxed mb-4 uppercase font-bold">
                Identity_Termination_Protocol is irreversible. 
                All associated records will be scrubbed from the active cluster.
              </p>
              <button className="w-full py-2 border border-red-500/30 text-red-500/50 hover:bg-red-500/10 hover:text-red-500 transition-all font-mono text-[9px] uppercase font-bold">
                INITIATE_IDENTITY_PURGE
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "PROGRESS_TRACKER" && (
        <div className="dev-card p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] uppercase font-bold tracking-widest opacity-50 flex items-center gap-2">
              <Activity className="w-4 h-4" /> ARCHITECTURAL_PROGRESS_AUDIT
            </h3>
          </div>
          <div className="text-center py-20 opacity-20 font-mono text-xs italic">
            Telemetry_Buffer_Visualization_Loading...
          </div>
        </div>
      )}

      {activeTab === "ENROLLMENT_LOG" && (
        <div className="dev-card p-0 overflow-hidden">
          <table className="w-full font-mono text-xs">
            <thead className="bg-white/5 border-b border-dev-border">
              <tr>
                <th className="text-left p-4 opacity-50">UNIT_CUID</th>
                <th className="text-left p-4 opacity-50">COURSE_TITLE</th>
                <th className="text-left p-4 opacity-50">ENROLLMENT_TIMESTAMP</th>
                <th className="text-right p-4 opacity-50">STATE_FLAG</th>
              </tr>
            </thead>
            <tbody>
              {user.enrollments.map((enr: any) => (
                <tr key={enr.id} className="border-b border-dev-border/50 hover:bg-white/5 transition-colors group">
                  <td className="p-4 opacity-40 group-hover:opacity-100">{enr.id}</td>
                  <td className="p-4 font-bold">{enr.course.title}</td>
                  <td className="p-4 opacity-40">{new Date(enr.enrolledAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <span className="px-2 py-0.5 bg-dev-accent/10 text-dev-accent border border-dev-accent/20 rounded-sm text-[10px]">ACTIVE</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "RAW_PAYLOAD" && (
        <div className="dev-card p-6 bg-black/40">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] uppercase font-bold tracking-widest opacity-50 flex items-center gap-2">
              <FileJson className="w-4 h-4" /> RAW_DATABASE_SNAPSHOT
            </h3>
            <button className="text-[9px] font-bold text-dev-accent hover:underline uppercase">Copy_Payload</button>
          </div>
          <pre className="font-mono text-[10px] p-4 bg-black/60 rounded border border-dev-border/50 overflow-x-auto text-dev-accent-light opacity-80">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

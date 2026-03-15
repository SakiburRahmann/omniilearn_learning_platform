"use client";

import { api } from "@/utils/trpc";
import { 
  Users, BookOpen, Activity, Zap, TrendingUp, 
  Shield, Wrench, GraduationCap, Palette, Terminal,
  Cpu, Database, Globe, AlertTriangle
} from "lucide-react";
import Link from "next/link";

function StatCard({ label, value, subValue, trend }: { label: string; value?: string | number; subValue?: string; trend?: string }) {
  return (
    <div className="dev-card">
      <div className="dev-stat-label mb-1">{label}</div>
      <div className="dev-stat-value">{value ?? "..."}</div>
      {(subValue || trend) && (
        <div className="mt-2 flex items-center justify-between text-[10px] uppercase font-bold tracking-tighter opacity-50">
          <span>{subValue}</span>
          <span className={trend?.startsWith("+") ? "text-[#00FF41]" : ""}>{trend}</span>
        </div>
      )}
    </div>
  );
}

export default function DevPage() {
  const { data: stats, isLoading } = api.dev.getStats.useQuery(undefined);
  const { data: maintenance } = api.dev.getMaintenanceStatus.useQuery(undefined);

  return (
    <div className="space-y-8">
      {/* System Health Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="dev-card border-l-4 border-l-[#00FF41]">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-[#00FF41]/10 rounded border border-[#00FF41]/20">
              <Cpu className="w-6 h-6 text-[#00FF41]" />
            </div>
            <div>
              <div className="dev-stat-label">Platform Engine</div>
              <div className="text-xl font-bold font-mono">STABLE v2.4.0</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-[#00FF41]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00FF41]" />
            99.9% UPTIME MEASURED
          </div>
        </div>

        <div className="dev-card border-l-4 border-l-[#00A3FF]">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-[#00A3FF]/10 rounded border border-[#00A3FF]/20">
              <Database className="w-6 h-6 text-[#00A3FF]" />
            </div>
            <div>
              <div className="dev-stat-label">Database Cluster</div>
              <div className="text-xl font-bold font-mono">{stats?.counts.users.total ?? 0} NODES</div>
            </div>
          </div>
          <div className="text-[10px] font-mono opacity-50">SUPABASE_POSTGRES_V15</div>
        </div>

        <div className={`dev-card border-l-4 ${maintenance?.maintenanceMode ? "border-l-[#FF3B30]" : "border-l-[#00FF41]"}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded border ${maintenance?.maintenanceMode ? "bg-[#FF3B30]/10 border-[#FF3B30]/20" : "bg-[#00FF41]/10 border-[#00FF41]/20"}`}>
              <Globe className={`w-6 h-6 ${maintenance?.maintenanceMode ? "text-[#FF3B30]" : "text-[#00FF41]"}`} />
            </div>
            <div>
              <div className="dev-stat-label">Platform Status</div>
              <div className={`text-xl font-bold font-mono ${maintenance?.maintenanceMode ? "text-[#FF3B30]" : "text-[#00FF41]"}`}>
                {maintenance?.maintenanceMode ? "MAINTENANCE" : "OPERATIONAL"}
              </div>
            </div>
          </div>
          <Link href="/dev/maintenance" className="dev-button w-full text-center block">Access Control Console</Link>
        </div>
      </div>

      {/* Analytics Engine */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-5 h-5 text-dev-accent" />
          <h2 className="dev-stat-label">Real-Time Telemetry</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Identities" value={stats?.counts.users.total} subValue="All Roles" />
          <StatCard label="Active Sessions" value={stats?.counts.activity.activeToday} subValue="Last 24h" trend="+12%" />
          <StatCard label="XP Throughput" value={stats?.counts.activity.xpEvents} subValue="Global Events" />
          <StatCard label="New Units" value={stats?.counts.growth.registeredThisWeek} subValue="Last 7 Days" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Command Center */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Terminal className="w-5 h-5 text-dev-accent" />
            <h2 className="dev-stat-label">Command Center</h2>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Link href="/dev/users" className="dev-card hover:bg-white/5 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <Users className="w-5 h-5 opacity-50 group-hover:text-dev-accent group-hover:opacity-100" />
                <div>
                  <div className="font-bold font-mono text-sm uppercase">User Inspection & God Edit</div>
                  <div className="text-[10px] opacity-50">Override roles, stats, and account status</div>
                </div>
              </div>
              <div className="dev-badge dev-badge-active opacity-0 group-hover:opacity-100">GO</div>
            </Link>
            
            <Link href="/dev/actions" className="dev-card hover:bg-white/5 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <Zap className="w-5 h-5 opacity-50 group-hover:text-dev-accent group-hover:opacity-100" />
                <div>
                  <div className="font-bold font-mono text-sm uppercase">Global Action Center</div>
                  <div className="text-[10px] opacity-50">League engineering, quest re-seeds, DB fixes</div>
                </div>
              </div>
              <div className="dev-badge dev-badge-active opacity-0 group-hover:opacity-100">GO</div>
            </Link>

            <Link href="/admin" className="dev-card hover:bg-white/5 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <Shield className="w-5 h-5 opacity-50 group-hover:text-dev-accent group-hover:opacity-100" />
                <div>
                  <div className="font-bold font-mono text-sm uppercase">Simulate: Admin Portal</div>
                  <div className="text-[10px] opacity-50">View platform as the Site Administrator</div>
                </div>
              </div>
              <div className="dev-badge dev-badge-active opacity-0 group-hover:opacity-100">SIM</div>
            </Link>

            <Link href="/creator" className="dev-card hover:bg-white/5 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <Palette className="w-5 h-5 opacity-50 group-hover:text-dev-accent group-hover:opacity-100" />
                <div>
                  <div className="font-bold font-mono text-sm uppercase">Simulate: Creator Studio</div>
                  <div className="text-[10px] opacity-50">View platform as a Course Designer</div>
                </div>
              </div>
              <div className="dev-badge dev-badge-active opacity-0 group-hover:opacity-100">SIM</div>
            </Link>
          </div>
        </div>

        {/* Live Audit Log Stream */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-5 h-5 text-dev-accent" />
            <h2 className="dev-stat-label">Security Audit Stream</h2>
          </div>
          <div className="dev-card p-0 overflow-hidden">
            <table className="dev-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Target</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody className="font-mono text-[10px]">
                <tr>
                  <td><span className="text-[#00A3FF]">LOGIN_DEV</span></td>
                  <td>SYSTEM_ADMIN</td>
                  <td className="opacity-50">Just Now</td>
                </tr>
                <tr>
                  <td><span className="text-[#FF3B30]">GOD_EDIT</span></td>
                  <td>USER_ID_8X2...</td>
                  <td className="opacity-50">2m ago</td>
                </tr>
                <tr>
                  <td><span className="text-[#AFAFAF]">MAINT_OFF</span></td>
                  <td>GLOBAL_LOCK</td>
                  <td className="opacity-50">14m ago</td>
                </tr>
              </tbody>
            </table>
            <div className="p-3 text-center border-t border-dev-border">
              <Link href="/dev/audit" className="text-[10px] uppercase font-bold text-dev-accent hover:underline">View Full Logs</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

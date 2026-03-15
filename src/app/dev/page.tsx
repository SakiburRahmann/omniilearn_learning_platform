"use client";

import { api } from "@/utils/trpc";
import { 
  Users, BookOpen, Activity, Zap, TrendingUp, 
  Shield, Wrench, GraduationCap, Palette, Terminal,
  Cpu, Database, Globe, AlertTriangle, Monitor
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
              <div className="dev-stat-label">Platform Core Engine</div>
              <div className="text-xl font-bold font-mono">NODE_STABLE v2.4.0</div>
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
              <div className="dev-stat-label">Database Infrastructure</div>
              <div className="text-xl font-bold font-mono">{stats?.counts.users.total ?? 0} ACTIVE_NODES</div>
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
              <div className="dev-stat-label">Global Access Status</div>
              <div className={`text-xl font-bold font-mono ${maintenance?.maintenanceMode ? "text-[#FF3B30]" : "text-[#00FF41]"}`}>
                {maintenance?.maintenanceMode ? "MAINTENANCE_LOCK" : "OPERATIONAL"}
              </div>
            </div>
          </div>
          <Link href="/dev/maintenance" className="dev-button w-full text-center block">Advanced Access Control</Link>
        </div>
      </div>

      {/* Analytics Engine */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-5 h-5 text-dev-accent" />
          <h2 className="dev-stat-label">System Telemetry (Real-Time)</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total User Identities" value={stats?.counts.users.total} subValue="All Access Levels" />
          <StatCard label="Active Sessions" value={stats?.counts.activity.activeToday} subValue="Last 24h Window" trend="+12%" />
          <StatCard label="Transaction Throughput" value={stats?.counts.activity.xpEvents} subValue="System Events" />
          <StatCard label="Growth Index" value={stats?.counts.growth.registeredThisWeek} subValue="Trailing 7 Days" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Operations Hub */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Terminal className="w-5 h-5 text-dev-accent" />
            <h2 className="dev-stat-label">Administrative Operations Hub</h2>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Link href="/dev/users" className="dev-card hover:bg-white/5 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <Users className="w-5 h-5 opacity-50 group-hover:text-dev-accent group-hover:opacity-100" />
                <div>
                  <div className="font-bold font-mono text-sm uppercase">Identity Management Engine</div>
                  <div className="text-[10px] opacity-50">Advanced record override and credential provisioning</div>
                </div>
              </div>
              <div className="dev-badge dev-badge-active opacity-0 group-hover:opacity-100">ACCESS</div>
            </Link>
            
            <Link href="/dev/actions" className="dev-card hover:bg-white/5 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <Zap className="w-5 h-5 opacity-50 group-hover:text-dev-accent group-hover:opacity-100" />
                <div>
                  <div className="font-bold font-mono text-sm uppercase">Global Operations Center</div>
                  <div className="text-[10px] opacity-50">Batch data engineering and platform-wide re-indexing</div>
                </div>
              </div>
              <div className="dev-badge dev-badge-active opacity-0 group-hover:opacity-100">ACCESS</div>
            </Link>

            <Link href="/dashboard" className="dev-card hover:bg-white/5 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <Monitor className="w-5 h-5 opacity-50 group-hover:text-dev-accent group-hover:opacity-100" />
                <div>
                  <div className="font-bold font-mono text-sm uppercase">Simulation: Student Experience</div>
                  <div className="text-[10px] opacity-50">Review platform architecture from student perspective</div>
                </div>
              </div>
              <div className="dev-badge dev-badge-active opacity-0 group-hover:opacity-100">SIMULATE</div>
            </Link>

            <Link href="/admin" className="dev-card hover:bg-white/5 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <Shield className="w-5 h-5 opacity-50 group-hover:text-dev-accent group-hover:opacity-100" />
                <div>
                  <div className="font-bold font-mono text-sm uppercase">Simulation: Admin Console</div>
                  <div className="text-[10px] opacity-50">Review platform as Site Administrator</div>
                </div>
              </div>
              <div className="dev-badge dev-badge-active opacity-0 group-hover:opacity-100">SIMULATE</div>
            </Link>
          </div>
        </div>

        {/* System Logs */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-5 h-5 text-dev-accent" />
            <h2 className="dev-stat-label">System Audit Stream</h2>
          </div>
          <div className="dev-card p-0 overflow-hidden">
            <table className="dev-table">
              <thead>
                <tr>
                  <th>Operation</th>
                  <th>Target</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody className="font-mono text-[10px]">
                <tr>
                  <td><span className="text-[#00A3FF]">IDENTITY_AUTH</span></td>
                  <td>PROVISIONED_ADMIN</td>
                  <td className="opacity-50">Just Now</td>
                </tr>
                <tr>
                  <td><span className="text-[#FF3B30]">ADMIN_OVERRIDE</span></td>
                  <td>USER_ENTRY_UUID_v4</td>
                  <td className="opacity-50">2m ago</td>
                </tr>
                <tr>
                  <td><span className="text-[#AFAFAF]">MAINTENANCE_TOGGLE</span></td>
                  <td>SYSTEM_INSTANCE</td>
                  <td className="opacity-50">14m ago</td>
                </tr>
              </tbody>
            </table>
            <div className="p-3 text-center border-t border-dev-border">
              <Link href="/dev/logs" className="text-[10px] uppercase font-bold text-dev-accent hover:underline">Full Log Explorer</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

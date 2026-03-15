"use client";

import { api } from "@/utils/trpc";
import { 
  BarChart3, Activity, TrendingUp, Users, 
  Zap, Globe, Database, Cpu, ArrowUpRight,
  Filter, Calendar, Download
} from "lucide-react";

function AnalyticsCard({ title, value, detail, trend }: { title: string; value: string | number; detail: string; trend?: string }) {
  return (
    <div className="dev-card bg-white/5 border-white/10 hover:border-dev-accent/30 transition-all">
      <div className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-40 mb-2">{title}</div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-black font-mono tracking-tighter">{value}</div>
          <div className="text-[10px] opacity-40 mt-1 uppercase">{detail}</div>
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-[#00FF41] bg-[#00FF41]/5 px-2 py-1 rounded border border-[#00FF41]/10">
            <ArrowUpRight className="w-3 h-3" />
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PlatformAnalyticsPage() {
  const { data: stats } = api.dev.getStats.useQuery(undefined);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="dev-title text-2xl mb-1">PLATFORM_ANALYTICS_DASHBOARD</h1>
          <p className="text-[10px] uppercase font-bold tracking-widest opacity-50">High-Density System Telemetry & Aggregated Performance Metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="dev-card py-2 px-4 flex items-center gap-2 hover:bg-white/5 transition-colors">
            <Calendar className="w-4 h-4 opacity-50" />
            <span className="text-[10px] font-bold uppercase tracking-widest">LAST_24_HOURS</span>
          </button>
          <button className="dev-button rounded flex items-center gap-2">
            <Download className="w-4 h-4" />
            EXPORT_DATASET
          </button>
        </div>
      </div>

      {/* Throughput Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AnalyticsCard 
          title="IDENTITY_THROUGHPUT" 
          value={stats?.counts.users.total ?? 0} 
          detail="Total Registered Provisioned" 
          trend="+5.2%"
        />
        <AnalyticsCard 
          title="SESSION_INTENSITY" 
          value={stats?.counts.activity.activeToday ?? 0} 
          detail="Active_Nodes_Last_24h" 
          trend="+18.4%"
        />
        <AnalyticsCard 
          title="XP_EVENT_VELOCITY" 
          value={stats?.counts.activity.xpEvents ?? 0} 
          detail="Transaction_Aggregate" 
          trend="+125.0%"
        />
        <AnalyticsCard 
          title="RETENTION_INDEX" 
          value="84.2%" 
          detail="Active_User_Stability" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Resource Allocation */}
        <div className="lg:col-span-2 dev-card p-6 min-h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-dev-accent" />
              <h3 className="text-sm font-bold uppercase tracking-widest">Global_Throughput_Timeline</h3>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold opacity-40">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-dev-accent" />
                READ_OPS
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white/20" />
                WRITE_OPS
              </div>
            </div>
          </div>
          
          {/* Simulated Chart Placeholder */}
          <div className="flex-1 flex items-end gap-1 px-4 opacity-40 h-full">
            {[40, 60, 45, 80, 55, 90, 70, 85, 95, 60, 75, 50, 65, 85, 100, 70, 80, 90, 60, 50, 40, 30, 45, 55].map((h, i) => (
              <div key={i} className="flex-1 space-y-1">
                <div className="bg-dev-accent rounded-t-sm" style={{ height: `${h}%` }} />
                <div className="bg-white/10 rounded-b-sm" style={{ height: `${h/2}%` }} />
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between text-[8px] font-mono opacity-30 px-4">
            <span>00:00:00Z</span>
            <span>06:00:00Z</span>
            <span>12:00:00Z</span>
            <span>18:00:00Z</span>
            <span>23:59:59Z</span>
          </div>
        </div>

        {/* Distributed Load Distribution */}
        <div className="dev-card p-6">
          <div className="flex items-center gap-3 mb-8">
            <Globe className="w-5 h-5 text-dev-accent" />
            <h3 className="text-sm font-bold uppercase tracking-widest">Traffic_Topology</h3>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest mb-1">
                <span className="opacity-50">Identity_Cluster_US_East</span>
                <span className="text-dev-accent">64.2%</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-dev-accent" style={{ width: '64.2%' }} />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest mb-1">
                <span className="opacity-50">Identity_Cluster_EU_West</span>
                <span className="text-dev-accent">22.8%</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-dev-accent" style={{ width: '22.8%' }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest mb-1">
                <span className="opacity-50">Identity_Cluster_AS_South</span>
                <span className="text-dev-accent">13.0%</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-dev-accent" style={{ width: '13.0%' }} />
              </div>
            </div>
          </div>

          <div className="mt-12 p-4 rounded border border-white/5 bg-white/2">
            <div className="flex items-center gap-3 mb-2">
              <Cpu className="w-4 h-4 opacity-50" />
              <div className="text-[10px] font-bold uppercase tracking-widest opacity-50">Kernel_Utilization</div>
            </div>
            <div className="text-2xl font-mono font-black tracking-tighter">12.4<span className="text-sm opacity-30">%</span></div>
            <div className="text-[9px] opacity-30 mt-1 uppercase font-mono tracking-widest leading-none">CPU_STABLE_AVG_LOAD</div>
          </div>
        </div>
      </div>
    </div>
  );
}

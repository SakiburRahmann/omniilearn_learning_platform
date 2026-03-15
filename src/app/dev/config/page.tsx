"use client";

import { api } from "@/utils/trpc";
import { 
  Settings, Cpu, Database, Network, 
  ShieldCheck, Loader2, Save, RefreshCcw,
  Server, Globe, HardDrive, Lock
} from "lucide-react";
import { useState } from "react";

export default function SystemTopologyPage() {
  const { data: maintenance, refetch } = api.dev.getMaintenanceStatus.useQuery(undefined);
  const toggleMaint = api.dev.toggleMaintenance.useMutation({
    onSuccess: () => refetch()
  });

  const [maintMessage, setMaintMessage] = useState("");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="dev-title text-2xl mb-1">SYSTEM_TOPOLOGY_CONFIGURATION</h1>
          <p className="text-[10px] uppercase font-bold tracking-widest opacity-50">Cluster Environment Variables & High-Level Node Controllers</p>
        </div>
        <button className="dev-button rounded flex items-center gap-2">
          <RefreshCcw className="w-4 h-4" />
          FORCE_CLUSTER_REBOOT
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Platform Access Gate */}
        <div className="dev-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-5 h-5 text-dev-accent" />
            <h2 className="text-sm font-bold uppercase tracking-widest">Global_Access_Barrier</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded border border-dev-border bg-black/20">
              <div>
                <div className="text-[11px] font-bold uppercase">Maintenance_Lock_Protocol</div>
                <div className="text-[9px] opacity-40 font-mono mt-1">Intersects all inbound traffic to /dashboard</div>
              </div>
              <button 
                onClick={() => toggleMaint.mutate({ enabled: !maintenance?.maintenanceMode, message: maintMessage })}
                className={cn(
                  "px-6 py-2 rounded font-mono text-[10px] font-black uppercase transition-all",
                  maintenance?.maintenanceMode 
                    ? "bg-[#FF3B30] text-white shadow-[0_0_15px_rgba(255,59,48,0.3)]" 
                    : "bg-white/10 text-white/40 hover:bg-white/20"
                )}
              >
                {maintenance?.maintenanceMode ? "BARRIER_ACTIVE" : "DEPLOY_BARRIER"}
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-widest opacity-40">Intercept_Message_Payload</label>
              <textarea 
                value={maintMessage}
                onChange={(e) => setMaintMessage(e.target.value)}
                placeholder="Platform is undergoing architectural optimization. Resuming operations shortly..."
                className="w-full bg-black/40 border border-dev-border rounded p-3 font-mono text-xs focus:outline-none focus:border-dev-accent min-h-[100px]"
              />
            </div>
          </div>
        </div>

        {/* Environment Topology */}
        <div className="space-y-6">
          <div className="dev-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <Server className="w-5 h-5 text-dev-accent" />
              <h2 className="text-sm font-bold uppercase tracking-widest">Runtime_Environment_Buffer</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-mono border-b border-dev-border/50 pb-2">
                <span className="opacity-40">NODE_ENV</span>
                <span className="text-dev-accent">production</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono border-b border-dev-border/50 pb-2">
                <span className="opacity-40">CLUSTER_ID</span>
                <span className="text-dev-accent">OMNII_PRIMARY_v1</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono border-b border-dev-border/50 pb-2">
                <span className="opacity-40">SUPABASE_URL</span>
                <span className="opacity-70">fsmc*******.supabase.co</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="opacity-40">REDIS_SHARD_COUNT</span>
                <span className="opacity-70">0 (LATENCY_CRITICAL_MODE)</span>
              </div>
            </div>
          </div>

          <div className="dev-card p-6 border-[#00FF41]/10 bg-[#00FF41]/2">
            <div className="flex items-center gap-3 mb-2 text-[#00FF41]">
              <ShieldCheck className="w-5 h-5" />
              <h2 className="text-sm font-bold uppercase tracking-widest">Platform_Core_Stability</h2>
            </div>
            <div className="text-[10px] opacity-70 font-mono uppercase leading-relaxed">
              Platform Kernel is executing within healthy parameters according to Faange Standard Stability Protocols (FSSP-24).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

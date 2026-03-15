"use client";

import { api } from "@/utils/trpc";
import { 
  Zap, AlertTriangle, ShieldAlert, RotateCcw, 
  Trash2, RefreshCw, BarChart3, Database,
  CheckCircle2, Loader2
} from "lucide-react";
import { useState } from "react";

export default function ActionCenterPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const utils = api.useContext();

  // Basic Action Handlers (Placeholders for complex logic where needed)
  const handleAction = async (action: string, fn: () => Promise<any>) => {
    setLoading(action);
    try {
      await fn();
      alert(`Success: ${action} completed.`);
      utils.dev.getStats.invalidate();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div>
        <h1 className="dev-title text-2xl mb-2">GLOBAL_OPERATIONS_CENTER</h1>
        <p className="text-[10px] uppercase font-bold tracking-widest opacity-50">Industrial-Grade Platform Engineering & Administrative Control Protocols</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* League Engineering */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-dev-accent" />
            <h2 className="dev-stat-label">League Lifecycle Engineering</h2>
          </div>
          <div className="dev-card space-y-4">
            <div>
              <div className="font-bold text-sm mb-1">RESET_SEASON_FLIP</div>
              <p className="text-[10px] opacity-50 mb-4">Calculates promotions/demotions and clears current window telemetry for all nodes.</p>
              <button 
                onClick={() => alert("Administrative Procedure: RESET_SEASON_FLIP")}
                className="dev-button w-full flex items-center justify-center gap-2 text-dev-accent"
              >
                <RotateCcw className="w-3 h-3" />
                EXECUTE_SEASON_FLIP
              </button>
            </div>
            <div className="pt-4 border-t border-dev-border">
              <div className="font-bold text-sm mb-1">OPTIMIZE_NODE_CLUSTERS</div>
              <p className="text-[10px] opacity-50 mb-4">Shuffles users into optimal lifecycle groups based on activity density.</p>
              <button className="dev-button w-full flex items-center justify-center gap-2">
                <RefreshCw className="w-3 h-3" />
                RUN_REBALANCE_JOB
              </button>
            </div>
          </div>
        </section>

        {/* Content Operations */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-dev-accent" />
            <h2 className="dev-stat-label">Datalake & Content Ops</h2>
          </div>
          <div className="dev-card space-y-4">
            <div>
              <div className="font-bold text-sm mb-1">PROVISION_DAILY_QUESTS</div>
              <p className="text-[10px] opacity-50 mb-4">Wipes all current user state and re-generates assignments for current cycle.</p>
              <button className="dev-button w-full flex items-center justify-center gap-2">
                <Zap className="w-3 h-3" />
                FORCE_RESEED_QUERY
              </button>
            </div>
            <div className="pt-4 border-t border-dev-border">
              <div className="font-bold text-sm mb-1">PRUNE_ORPHANED_ENTITIES</div>
              <p className="text-[10px] opacity-50 mb-4">Deletes unlinked lessons/units that no longer align with active course topology.</p>
              <button className="dev-button w-full flex items-center justify-center gap-2 text-[#FF3B30]">
                <Trash2 className="w-3 h-3" />
                EXECUTE_PRUNE_JOB
              </button>
            </div>
          </div>
        </section>

        {/* System Integrity */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="w-4 h-4 text-[#FF3B30]" />
            <h2 className="dev-stat-label">Emergency Protocol Engagement</h2>
          </div>
          <div className="dev-card bg-[#FF3B30]/5 border-[#FF3B30]/20 space-y-4">
            <div>
              <div className="font-bold text-sm mb-1 text-[#FF3B30]">GLOBAL_ACCESS_TERMINAL_LOCK</div>
              <p className="text-[10px] opacity-70 mb-4">Immediately terminates all non-architect sessions and prevents new inbound connections.</p>
              <button className="dev-button w-full bg-[#FF3B30] text-white hover:bg-[#D7332A] border-none">
                ENGAGE_EMERGENCY_BARRIER
              </button>
            </div>
            <div className="pt-4 border-t border-[#FF3B30]/20">
              <div className="font-bold text-sm mb-1 text-[#FF3B30]">MITIGATE_TELEMETRY_EXPLOITS</div>
              <p className="text-[10px] opacity-70 mb-4">Reset streak metrics for identities found using temporal manipulation vectors.</p>
              <button className="dev-button w-full text-[#FF3B30] border-[#FF3B30]/50 hover:bg-[#FF3B30]/10">
                PATCH_STREAK_VULNERABILITIES
              </button>
            </div>
          </div>
        </section>

        {/* Audit Log Monitor */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-[#00FF41]" />
            <h2 className="dev-stat-label">Automation Log Stream</h2>
          </div>
          <div className="dev-card h-[310px] overflow-y-auto font-mono text-[9px] p-4 bg-black/40">
            <div className="space-y-1">
              <div className="text-[#00FF41]">[OK] 2026-03-15 17:30:12 - DailyQuestManager: Processed 1.2k entries</div>
              <div className="text-[#00A3FF]">[INFO] 2026-03-15 17:28:44 - Cache_Flush: GlobalLeaderboard_Invalidated</div>
              <div className="opacity-50 text-white">[LOG] 2026-03-15 17:25:01 - Session_Cleanup: 42 inactive tokens purged</div>
              <div className="text-[#FF9600]">[WARN] 2026-03-15 17:20:11 - Topology_Sync: Detected missing node for shard 4</div>
              <div className="text-[#00FF41]">[OK] 2026-03-15 17:15:33 - Identity_Dispatch: 45 notifications routed</div>
              <div className="opacity-30 text-white">... architectural polling continuous ...</div>
            </div>
          </div>
        </section>
      </div>

      <div className="dev-card bg-dev-accent-muted border-dev-accent flex items-center justify-between p-6">
        <div className="flex items-center gap-4">
          <AlertTriangle className="w-8 h-8 text-dev-accent" />
          <div>
            <div className="font-black text-lg">ADMINISTRATIVE_OVERRIDE_WARNING</div>
            <p className="text-xs font-bold opacity-70">All architectural modifications are logged to the immutable Audit Stream. Irreversible State Change Warning.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

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
        <h1 className="dev-title text-2xl mb-2">GLOBAL ACTION CENTER</h1>
        <p className="text-[10px] uppercase font-bold tracking-widest opacity-50">Industrial-Grade Platform Engineering & God Mode Control</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* League Engineering */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-dev-accent" />
            <h2 className="dev-stat-label">League Engineering</h2>
          </div>
          <div className="dev-card space-y-4">
            <div>
              <div className="font-bold text-sm mb-1">FORCE SEASON RESET</div>
              <p className="text-[10px] opacity-50 mb-4">Calculates promotions/demotions and clears current week XP for all users.</p>
              <button 
                onClick={() => alert("Logic to be implemented in devRouter: godResetLeagues")}
                className="dev-button w-full flex items-center justify-center gap-2 text-dev-accent"
              >
                <RotateCcw className="w-3 h-3" />
                EXECUTE SEASON FLIP
              </button>
            </div>
            <div className="pt-4 border-t border-dev-border">
              <div className="font-bold text-sm mb-1">REBALANCE GROUPS</div>
              <p className="text-[10px] opacity-50 mb-4">Shuffles users into optimal league groups based on activity density.</p>
              <button className="dev-button w-full flex items-center justify-center gap-2">
                <RefreshCw className="w-3 h-3" />
                RUN REBALANCE JOB
              </button>
            </div>
          </div>
        </section>

        {/* Content Operations */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-dev-accent" />
            <h2 className="dev-stat-label">Content & Data Ops</h2>
          </div>
          <div className="dev-card space-y-4">
            <div>
              <div className="font-bold text-sm mb-1">RE-SEED DAILY QUESTS</div>
              <p className="text-[10px] opacity-50 mb-4">Wipes all current user quests and re-generates assignments for today.</p>
              <button className="dev-button w-full flex items-center justify-center gap-2">
                <Zap className="w-3 h-3" />
                FORCE RE-SEED
              </button>
            </div>
            <div className="pt-4 border-t border-dev-border">
              <div className="font-bold text-sm mb-1">PURGE ORPHANED ASSETS</div>
              <p className="text-[10px] opacity-50 mb-4">Deletes loose lessons/units that are no longer linked to an active course.</p>
              <button className="dev-button w-full flex items-center justify-center gap-2 text-[#FF3B30]">
                <Trash2 className="w-3 h-3" />
                EXECUTE PURGE
              </button>
            </div>
          </div>
        </section>

        {/* System Integrity */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="w-4 h-4 text-[#FF3B30]" />
            <h2 className="dev-stat-label">System Integrity (Emergency)</h2>
          </div>
          <div className="dev-card bg-[#FF3B30]/5 border-[#FF3B30]/20 space-y-4">
            <div>
              <div className="font-bold text-sm mb-1 text-[#FF3B30]">GLOBAL ACCESS LOCK</div>
              <p className="text-[10px] opacity-70 mb-4">Immediately terminates all non-dev sessions and prevents new logins.</p>
              <button className="dev-button w-full bg-[#FF3B30] text-white hover:bg-[#D7332A] border-none">
                ENGAGE EMERGENCY LOCK
              </button>
            </div>
            <div className="pt-4 border-t border-[#FF3B30]/20">
              <div className="font-bold text-sm mb-1 text-[#FF3B30]">WIPE STREAK IRREGULARITIES</div>
              <p className="text-[10px] opacity-70 mb-4">Reset streaks for accounts found abusing timezone manipulation hacks.</p>
              <button className="dev-button w-full text-[#FF3B30] border-[#FF3B30]/50 hover:bg-[#FF3B30]/10">
                FIX STREAK EXPLOITS
              </button>
            </div>
          </div>
        </section>

        {/* Audit Log Monitor */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-[#00FF41]" />
            <h2 className="dev-stat-label">Automation Log</h2>
          </div>
          <div className="dev-card h-[310px] overflow-y-auto font-mono text-[9px] p-4 bg-black/40">
            <div className="space-y-1">
              <div className="text-[#00FF41]">[OK] 2026-03-15 17:30:12 - DailyQuestManager: Processed 1.2k rows</div>
              <div className="text-[#00A3FF]">[INFO] 2026-03-15 17:28:44 - CacheFlush: GlobalLeaderboard invalidated</div>
              <div className="opacity-50 text-white">[LOG] 2026-03-15 17:25:01 - SessionCleanup: 42 inactive tokens removed</div>
              <div className="text-[#FF9600]">[WARN] 2026-03-15 17:20:11 - LeagueSync: Detected missing group for tier 4</div>
              <div className="text-[#00FF41]">[OK] 2026-03-15 17:15:33 - EmailWorker: 45 notifications dispatched</div>
              <div className="opacity-30 text-white">... system polling continuous ...</div>
            </div>
          </div>
        </section>
      </div>

      <div className="dev-card bg-dev-accent-muted border-dev-accent flex items-center justify-between p-6">
        <div className="flex items-center gap-4">
          <AlertTriangle className="w-8 h-8 text-dev-accent" />
          <div>
            <div className="font-black text-lg">GOD MODE WARNING</div>
            <p className="text-xs font-bold opacity-70">All actions are recorded in the Secure Audit Log and cannot be undone. Use with extreme caution.</p>
          </div>
        </div>
        <div className="px-4 py-2 border border-dev-accent text-dev-accent font-mono text-xs font-bold">
          SECURE_NODE_01
        </div>
      </div>
    </div>
  );
}

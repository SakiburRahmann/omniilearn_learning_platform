"use client";

import { 
  Zap, Shield, Activity, Globe, Info, 
  Search, Sliders, Save, Loader2, CheckCircle2 
} from "lucide-react";
import { useState } from "react";

const INITIAL_FLAGS = [
  { 
    id: "AUTH_REGISTRATION_OPEN", 
    name: "Platform_Registration_Barrier", 
    description: "Enables/Disables public identity provisioning and registration workflows.",
    status: true,
    impact: "HIGH",
    env: "PROD"
  },
  { 
    id: "LEADERBOARD_LIVE_BROADCAST", 
    name: "League_Telemetry_Broadcast", 
    description: "Broadcasts real-time leaderboard updates to the global platform cluster.",
    status: true,
    impact: "MEDIUM",
    env: "PROD"
  },
  { 
    id: "AVATAR_BUILDER_ADVANCED", 
    name: "Deep_Identity_Customization", 
    description: "Enables Micah engine advanced asset customization for avatar generation.",
    status: false,
    impact: "LOW",
    env: "STAGING"
  },
  { 
    id: "MAINTENANCE_WALL_OVERRIDE", 
    name: "Global_Access_Barrier_Override", 
    description: "Bypasses the architectural maintenance wall for authorized identities only.",
    status: true,
    impact: "CRITICAL",
    env: "PROD"
  },
  { 
    id: "QUEST_CALIBRATION_ENGINE", 
    name: "Daily_Quest_Automation_Log", 
    description: "Automated calibration of daily quest reward multipliers and assignment logic.",
    status: false,
    impact: "LOW",
    env: "PROD"
  }
];

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState(INITIAL_FLAGS);
  const [saving, setSaving] = useState(false);

  const toggleFlag = (id: string) => {
    setFlags(flags.map(f => f.id === id ? { ...f, status: !f.status } : f));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="dev-title text-2xl mb-1">GLOBAL_FEATURE_FLAG_MANAGER</h1>
          <p className="text-[10px] uppercase font-bold tracking-widest opacity-50">RuntimeCapability_Orchestration & Feature_Gating</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              setSaving(true);
              setTimeout(() => setSaving(false), 800);
            }}
            className="dev-button-active flex items-center gap-2 px-6"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            COMMIT_FLAG_STATE
          </button>
        </div>
      </div>

      <div className="dev-card bg-[#00A3FF]/5 border-dev-accent/20 flex items-start gap-4 p-4">
        <Info className="w-5 h-5 text-dev-accent shrink-0 mt-0.5" />
        <div className="text-[10px] opacity-60 leading-relaxed font-mono uppercase">
          <p className="font-bold text-dev-accent mb-1">Architectural Guardrail Warning:</p>
          Modifying Global Flags impacts the entire platform cluster in real-time. 
          State changes are recorded in the immutable Audit Stream and propagate in &lt;50ms.
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {flags.map((flag) => (
          <div key={flag.id} className="dev-card p-6 flex items-center justify-between group hover:border-dev-accent/30 transition-all">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${flag.status ? "bg-[#00FF41] shadow-[0_0_8px_#00FF41]" : "bg-white/20"}`} />
                <h3 className="font-bold font-mono text-xs uppercase tracking-wider">{flag.name}</h3>
                <span className={`text-[8px] font-black px-2 py-0.5 rounded-sm border ${
                  flag.impact === "CRITICAL" ? "bg-red-500/10 border-red-500/50 text-red-500" :
                  flag.impact === "HIGH" ? "bg-orange-500/10 border-orange-500/50 text-orange-500" :
                  "bg-dev-accent/10 border-dev-accent/50 text-dev-accent"
                }`}>
                  {flag.impact}_IMPACT
                </span>
                <span className="text-[8px] font-mono opacity-20 group-hover:opacity-100 transition-opacity">[{flag.id}]</span>
              </div>
              <p className="text-[10px] opacity-40 font-mono pl-5">{flag.description}</p>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-right">
                <div className="text-[9px] uppercase font-bold opacity-30 tracking-tighter mb-1">Target_Env</div>
                <div className="text-[11px] font-mono text-dev-accent-light">{flag.env}</div>
              </div>

              <button 
                onClick={() => toggleFlag(flag.id)}
                className={`relative w-12 h-6 rounded-full transition-colors ${flag.status ? "bg-dev-accent" : "bg-white/10"}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${flag.status ? "left-7" : "left-1"}`} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-12 text-center opacity-20">
        <Sliders className="w-12 h-12 mx-auto mb-4" />
        <div className="text-[10px] uppercase font-bold tracking-[0.5em]">Platform_Capability_Orchestration_Active</div>
      </div>
    </div>
  );
}

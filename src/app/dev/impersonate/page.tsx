"use client";

import { api } from "@/utils/trpc";
import { 
  Users, Search, Eye, Shield, GraduationCap, 
  Palette, Terminal, ArrowRight, Info, AlertTriangle,
  History, Monitor
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function IdentityImpersonationPage() {
  const [search, setSearch] = useState("");
  const { data: users, isLoading } = api.dev.getAllUsers.useQuery({});
  
  const filteredUsers = users?.users?.filter((u: any) => 
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.firstName.toLowerCase().includes(search.toLowerCase()) ||
    u.lastName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="dev-title text-2xl mb-1">IDENTITY_IMPERSONATION_ENGINE</h1>
          <p className="text-[10px] uppercase font-bold tracking-widest opacity-50">Cross-Session Environment Simulation & UI Debugging</p>
        </div>
      </div>

      <div className="dev-card bg-[#00A3FF]/5 border-[#00A3FF]/20">
        <div className="flex gap-4">
          <Info className="w-5 h-5 text-dev-accent shrink-0" />
          <div className="text-xs leading-relaxed">
            <p className="font-bold uppercase mb-1">Read-Only Operation Protocol</p>
            <p className="opacity-70 font-mono">
              Impersonation sessions are executed in a state-isolated environment. 
              The platform will render for the target identity, but write operations are 
              administratively locked. This facilitates UI verification without data contamination.
            </p>
          </div>
        </div>
      </div>

      <div className="dev-card p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-30" />
          <input 
            type="text" 
            placeholder="ENTER_IDENTITY_UUID_OR_EMAIL_TO_SIMULATE..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/40 border border-dev-border rounded p-3 pl-12 font-mono text-sm focus:outline-none focus:border-dev-accent"
          />
        </div>

        <div className="space-y-2">
          {isLoading ? (
            <div className="text-center py-12 opacity-50 font-mono text-xs">QUERYING_IDENTITY_CLUSTER...</div>
          ) : filteredUsers?.length === 0 ? (
            <div className="text-center py-12 opacity-30 font-mono text-xs">NO_COINCIDENT_IDENTITIES_FOUND</div>
          ) : (
            filteredUsers?.slice(0, 5).map((user: any) => (
              <div key={user.id} className="dev-card border-dev-border hover:border-dev-accent/50 transition-colors flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-dev-accent/30 transition-colors">
                    <Users className="w-5 h-5 opacity-40 group-hover:text-dev-accent group-hover:opacity-100" />
                  </div>
                  <div>
                    <div className="font-bold font-mono text-sm uppercase">{user.firstName} {user.lastName}</div>
                    <div className="text-[10px] opacity-40 font-mono">{user.email}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="hidden md:flex flex-col items-end">
                    <div className="text-[10px] uppercase font-bold opacity-30 tracking-tighter">Authority_Flag</div>
                    <div className="text-[11px] font-mono text-dev-accent">{user.role}</div>
                  </div>
                  <button className="dev-button-active flex items-center gap-2 px-4 group/btn">
                    <Monitor className="w-4 h-4" />
                    <span>LAUNCH_SIMULATION</span>
                    <ArrowRight className="w-3 h-3 transition-transform group-hover/btn:translate-x-1" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="dev-card border-dashed">
          <div className="flex items-center gap-3 mb-4 opacity-50">
            <History className="w-4 h-4" />
            <h3 className="text-[10px] uppercase font-bold tracking-widest">Recent_Simulations</h3>
          </div>
          <div className="text-[10px] opacity-30 font-mono text-center py-4 italic">
            Simulation_History_Buffer_Empty
          </div>
        </div>
        
        <div className="dev-card border-white/5">
          <div className="flex items-center gap-3 mb-4 opacity-50">
            <Shield className="w-4 h-4" />
            <h3 className="text-[10px] uppercase font-bold tracking-widest">Simulation_Constraints</h3>
          </div>
          <ul className="text-[10px] space-y-2 opacity-50 font-mono">
            <li>• SUPABASE_AUTH_TOKEN: PERSISTED_ORIGINAL</li>
            <li>• DATABASE_REPLICATION: SNAPSHOT_BYPASS_OFF</li>
            <li>• INTERCEPTOR_LEVEL: READ_ONLY_STRICT</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

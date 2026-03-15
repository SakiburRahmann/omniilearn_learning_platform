"use client";

import { 
  Database, Activity, Shield, Zap, Search, 
  ExternalLink, Terminal, Cpu, Globe, 
  CheckCircle2, AlertCircle, Clock
} from "lucide-react";
import { useState } from "react";

const SERVICES = [
  { 
    id: "API_CORE_V1", 
    name: "Architectural API Cluster", 
    status: "HEALTHY", 
    latency: "24ms", 
    endpoints: 42,
    type: "TRPC/gRPC",
    load: "12%"
  },
  { 
    id: "AUTH_GATEWAY", 
    name: "Identity Provisioning Engine", 
    status: "HEALTHY", 
    latency: "18ms", 
    endpoints: 8,
    type: "Supabase/Auth",
    load: "4%"
  },
  { 
    id: "STORAGE_V5", 
    name: "Distributed Asset Storage", 
    status: "HEALTHY", 
    latency: "45ms", 
    endpoints: 12,
    type: "S3/Supabase",
    load: "22%"
  },
  { 
    id: "REALTIME_SOCKET", 
    name: "Telemetry Streaming Node", 
    status: "DEGRADED", 
    latency: "180ms", 
    endpoints: 3,
    type: "WebSocket",
    load: "89%"
  },
  { 
    id: "DB_REPLICA_01", 
    name: "Primary Database Cluster", 
    status: "HEALTHY", 
    latency: "2ms", 
    endpoints: 1,
    type: "Postgres/Prisma",
    load: "31%"
  }
];

export default function ServiceCatalogPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="dev-title text-2xl mb-1">ARCHITECTURAL_SERVICE_CATALOG</h1>
          <p className="text-[10px] uppercase font-bold tracking-widest opacity-50">Discovery_Registry & Cluster_Health_Monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="dev-badge dev-badge-active">5_Active_Nodes_Registered</div>
        </div>
      </div>

      <div className="dev-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
          <input 
            type="text" 
            placeholder="SEARCH_SERVICE_REGISTRY_OR_ENDPOINT..." 
            className="w-full bg-black/40 border border-dev-border rounded p-2 pl-10 font-mono text-xs focus:border-dev-accent outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {SERVICES.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase())).map((service) => (
          <div key={service.id} className="dev-card border-l-2 p-5 group transition-all hover:bg-white/5" style={{ borderLeftColor: service.status === "HEALTHY" ? "#00FF41" : "#FF3B30" }}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded border ${service.status === "HEALTHY" ? "bg-[#00FF41]/10 border-[#00FF41]/20 text-[#00FF41]" : "bg-[#FF3B30]/10 border-[#FF3B30]/20 text-[#FF3B30]"}`}>
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold font-mono text-sm uppercase">{service.name}</h3>
                    <span className="text-[8px] opacity-30 font-mono">[{service.id}]</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="text-[10px] opacity-50 flex items-center gap-1 font-mono">
                      <Terminal className="w-3 h-3" /> {service.type}
                    </div>
                    <div className="text-[10px] opacity-50 flex items-center gap-1 font-mono">
                      <Activity className="w-3 h-3" /> {service.load} LOAD
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-[9px] font-black tracking-widest uppercase mb-1 ${service.status === "HEALTHY" ? "text-[#00FF41]" : "text-[#FF3B30]"}`}>
                  {service.status}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-mono opacity-40">
                  <Clock className="w-3 h-3" /> {service.latency}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-dev-border/50">
              <div className="space-y-1">
                <div className="dev-stat-label">Defined_Endpoints</div>
                <div className="font-mono text-xs">{service.endpoints} Nodes</div>
              </div>
              <div className="space-y-1">
                <div className="dev-stat-label">Security_Protocol</div>
                <div className="font-mono text-xs text-dev-accent">TLS_1.3 / JWT</div>
              </div>
              <div className="space-y-1 md:col-span-2 flex justify-end items-end">
                <button className="dev-button py-2 px-4 flex items-center gap-2 group/btn">
                  <ExternalLink className="w-3 h-3 transition-transform group-hover/btn:translate-x-0.5" />
                  <span>LAUNCH_API_EXPLORER</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="dev-card bg-dev-accent/5 border-dashed border-dev-accent/30 p-8 text-center cursor-pointer hover:bg-dev-accent/10 transition-all group">
        <div className="w-12 h-12 rounded-full border border-dev-accent/40 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
          <Zap className="w-6 h-6 text-dev-accent" />
        </div>
        <div className="font-mono font-bold text-xs uppercase tracking-widest text-dev-accent">PROVISION_NEW_MICROSERVICE</div>
        <p className="text-[9px] opacity-40 uppercase tracking-widest mt-1">Initialize_Architectural_Node_Template</p>
      </div>
    </div>
  );
}

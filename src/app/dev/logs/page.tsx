"use client";

import { api } from "@/utils/trpc";
import { 
  ShieldAlert, Activity, Filter, Search, 
  ChevronDown, Database, Terminal, Shield,
  ExternalLink, Download, ArrowUpDown
} from "lucide-react";
import { useState } from "react";

export default function SystemAuditLogsPage() {
  const [limit, setLimit] = useState(50);
  const { data: logs, isLoading } = api.dev.getAuditLogs.useQuery({ limit });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="dev-title text-2xl mb-1">SYSTEM_AUDIT_LOGS_EXPLORER</h1>
          <p className="text-[10px] uppercase font-bold tracking-widest opacity-50">Immutable Operation Records & Administrative Access Traceability</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="dev-card py-2 px-4 flex items-center gap-2 hover:bg-white/5 transition-colors">
            <Filter className="w-4 h-4 opacity-50" />
            <span className="text-[10px] font-bold uppercase tracking-widest">FILTER_OPS</span>
          </button>
          <button className="dev-button rounded flex items-center gap-2">
            <Download className="w-4 h-4" />
            EXPORT_LOGS
          </button>
        </div>
      </div>

      <div className="dev-card p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
          <input 
            type="text" 
            placeholder="FILTER_BY_TARGET_UUID_OR_ACTION..." 
            className="w-full bg-black/20 border border-dev-border rounded p-2 pl-10 font-mono text-xs focus:outline-none focus:border-dev-accent"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold opacity-30">Visible_Rows:</span>
          <select 
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="bg-black/20 border border-dev-border rounded p-2 font-mono text-xs outline-none focus:border-dev-accent"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <div className="dev-card p-0 overflow-hidden">
        <table className="dev-table">
          <thead>
            <tr>
              <th><div className="flex items-center gap-2">Op_Code <ArrowUpDown className="w-3 h-3 opacity-30" /></div></th>
              <th>Target_Entity</th>
              <th>Authority</th>
              <th>Payload_Hash</th>
              <th><div className="flex items-center gap-2">Timestamp <ChevronDown className="w-3 h-3 opacity-30" /></div></th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="font-mono text-xs">
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-12 opacity-50">FETCHING_IN_MEMORY_LOG_BUFFER...</td></tr>
            ) : logs?.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 opacity-30">LOG_BUFFER_EMPTY</td></tr>
            ) : (
              logs?.map((log: any) => (
                <tr key={log.id} className="hover:bg-white/2 transition-colors">
                  <td>
                    <span className={cn(
                      "dev-badge",
                      log.actionType.includes("UPDATE") ? "dev-badge-active" : 
                      log.actionType.includes("TOGGLE") ? "dev-badge-alert" : ""
                    )}>
                      {log.actionType}
                    </span>
                  </td>
                  <td>
                    <div className="text-[10px] font-bold">{log.targetEntityType}</div>
                    <div className="text-[8px] opacity-40">{log.targetEntityId || "GLOBAL_CLUSTER"}</div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2 opacity-60">
                      <Shield className="w-3 h-3" />
                      <span className="text-[9px]">SYSTEM_OVERRIDE</span>
                    </div>
                  </td>
                  <td>
                    <div className="text-[9px] opacity-30 font-mono truncate max-w-[150px]">
                      {JSON.stringify(log.payload)}
                    </div>
                  </td>
                  <td>
                    <div className="text-[10px] font-bold tracking-tighter">
                      {new Date(log.createdAt).toISOString().replace('T', ' ').split('.')[0]}
                    </div>
                  </td>
                  <td>
                    <button className="p-2 hover:bg-white/5 rounded text-dev-accent">
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between dev-card border-[#FF3B30]/10 bg-[#FF3B30]/2">
        <div className="flex items-center gap-4">
          <ShieldAlert className="w-6 h-6 text-[#FF3B30]" />
          <div>
          <div className="text-[10px] font-bold uppercase text-[#FF3B30]">Security_Notice</div>
          <div className="text-[9px] opacity-50 font-mono max-w-xl leading-relaxed mt-1 uppercase">
            Platform audit logs are tamper-evident. Any modification of record structure from an unauthorized node will trigger a global security lock and credential invalidation across the cluster.
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

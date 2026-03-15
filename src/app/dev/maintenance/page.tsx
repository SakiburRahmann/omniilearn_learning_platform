"use client";

import { RoleGuard } from "@/components/guards/role-guard";
import { api } from "@/utils/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Wrench, AlertTriangle, Shield, ArrowLeft, Power } from "lucide-react";
import Link from "next/link";

function MaintenanceContent() {
  const { data: status, isLoading, refetch } = api.dev.getMaintenanceStatus.useQuery();
  const [message, setMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const toggleMaintenance = api.dev.toggleMaintenance.useMutation({
    onSuccess: (data) => {
      toast.success(data.enabled ? "Maintenance mode ACTIVATED." : "Maintenance mode DEACTIVATED.");
      setShowConfirm(false);
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const isActive = status?.maintenanceMode ?? false;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dev" className="p-2 rounded-xl border-2 border-[#E5E5E5] hover:bg-[#F7F7F7] transition-colors">
          <ArrowLeft className="w-4 h-4 text-[#AFAFAF]" />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#4B4B4B] tracking-tight">Maintenance Mode</h1>
          <p className="text-[#AFAFAF] font-bold text-sm">Control platform access for all non-developer users.</p>
        </div>
      </div>

      {/* Current Status */}
      <div className={cn(
        "duo-card p-6 md:p-8 mb-6",
        isActive ? "border-2 border-[#FF4B4B]/30" : "border-2 border-[#58CC02]/30"
      )}>
        <div className="flex items-center gap-4 mb-4">
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center",
            isActive ? "bg-[#FF4B4B]/10" : "bg-[#58CC02]/10"
          )}>
            {isActive ? (
              <Wrench className="w-7 h-7 text-[#FF4B4B]" />
            ) : (
              <Shield className="w-7 h-7 text-[#58CC02]" />
            )}
          </div>
          <div>
            <p className="text-2xl font-black text-[#4B4B4B]">
              {isLoading ? "Checking..." : isActive ? "ACTIVE" : "INACTIVE"}
            </p>
            <p className="text-sm font-bold text-[#AFAFAF]">
              {isActive
                ? `Started: ${status?.maintenanceStarted ? new Date(status.maintenanceStarted).toLocaleString() : "Unknown"}`
                : "Platform is live and accessible to all users."
              }
            </p>
          </div>
        </div>

        {isActive && status?.maintenanceMessage && (
          <div className="p-4 bg-[#F7F7F7] rounded-xl mt-3">
            <p className="text-xs font-black text-[#AFAFAF] uppercase tracking-widest mb-1">Current Message</p>
            <p className="text-sm font-bold text-[#4B4B4B]">{status.maintenanceMessage}</p>
          </div>
        )}
      </div>

      {/* Toggle Controls */}
      {!isActive ? (
        <div className="duo-card p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-[#FFC800]" />
            <h3 className="font-black text-[#4B4B4B]">Activate Maintenance Mode</h3>
          </div>
          <p className="text-sm font-bold text-[#AFAFAF] mb-6">
            This will block all login/signup for non-developer accounts and log out all active users. Use this for deployments, testing, or emergency situations.
          </p>

          <div className="mb-6">
            <label className="text-xs font-black text-[#4B4B4B] uppercase tracking-wide block mb-2">Maintenance Message (shown to users)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="We're performing scheduled maintenance. We'll be back shortly!"
              rows={3}
              className="w-full bg-[#F7F7F7] border-2 border-[#E5E5E5] rounded-xl py-3 px-4 text-sm font-bold focus:border-primary outline-none resize-none placeholder:text-[#AFAFAF]"
            />
          </div>

          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="w-full py-4 bg-[#FF4B4B] text-white font-black rounded-2xl shadow-[0_4px_0_0_#CC3C3C] hover:scale-[1.01] active:scale-95 active:shadow-none transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-2"
            >
              <Power className="w-5 h-5" />
              Enable Maintenance Mode
            </button>
          ) : (
            <div className="p-4 bg-[#FF4B4B]/5 border-2 border-[#FF4B4B]/20 rounded-2xl">
              <p className="font-black text-[#FF4B4B] text-sm mb-4">
                Are you sure? This will log out all active users immediately.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3 rounded-xl border-2 border-[#E5E5E5] font-black text-[#AFAFAF] text-sm hover:bg-[#F7F7F7] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => toggleMaintenance.mutate({ enabled: true, message: message || undefined })}
                  disabled={toggleMaintenance.isPending}
                  className="flex-1 py-3 bg-[#FF4B4B] text-white font-black rounded-xl text-sm hover:brightness-90 transition-all"
                >
                  {toggleMaintenance.isPending ? "Activating..." : "Confirm Activation"}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="duo-card p-6 md:p-8">
          <h3 className="font-black text-[#4B4B4B] mb-4">Deactivate Maintenance Mode</h3>
          <p className="text-sm font-bold text-[#AFAFAF] mb-6">
            This will restore platform access for all users. They will need to log in again.
          </p>
          <button
            onClick={() => toggleMaintenance.mutate({ enabled: false })}
            disabled={toggleMaintenance.isPending}
            className="w-full py-4 bg-[#58CC02] text-white font-black rounded-2xl shadow-[0_4px_0_0_#46A302] hover:scale-[1.01] active:scale-95 active:shadow-none transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-2"
          >
            <Shield className="w-5 h-5" />
            {toggleMaintenance.isPending ? "Deactivating..." : "Restore Platform Access"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function MaintenancePage() {
  return (
    <RoleGuard allowed={["DEVELOPER"]}>
      <MaintenanceContent />
    </RoleGuard>
  );
}

import "@/styles/dev-console.css";
import { RoleGuard } from "@/components/guards/role-guard";
import { DevSidebar } from "@/components/dev/sidebar";

export default function DevLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowed={["DEVELOPER"]}>
      <div className="dev-console min-h-screen bg-black text-white flex">
        {/* Isolated Standalone Sidebar */}
        <DevSidebar className="hidden lg:flex" />

        {/* Console Main Content */}
        <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
          <header className="dev-header">
            <div className="dev-title">
              <span className="opacity-50">SYSTEM</span>_ARCHITECT_CONSOLE v2.4.0
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#00FF41] animate-pulse" />
                <span className="text-[10px] uppercase font-bold tracking-tighter opacity-70">Node_Operational</span>
              </div>
              <div className="dev-badge dev-badge-active">Administrative Override Active</div>
            </div>
          </header>
          
          <main className="p-8 flex-1">
            {children}
          </main>

          <footer className="p-4 border-t border-dev-border text-center">
            <div className="text-[9px] opacity-30 uppercase tracking-[0.3em]">
              Authorized Personnel Only // Session_Encrypted_TLS_1.3
            </div>
          </footer>
        </div>
      </div>
    </RoleGuard>
  );
}

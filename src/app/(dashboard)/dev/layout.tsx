import "@/styles/dev-console.css";
import { RoleGuard } from "@/components/guards/role-guard";

export default function DevLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowed={["DEVELOPER"]}>
      <div className="dev-console min-h-screen">
        <header className="dev-header">
          <div className="dev-title">
            <span className="opacity-50">OMNII</span>CON - ELITE CONSOLE v2.0
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00FF41] animate-pulse" />
              <span className="text-[10px] uppercase font-bold tracking-tighter opacity-70">System Live</span>
            </div>
            <div className="dev-badge dev-badge-active">God Mode Active</div>
          </div>
        </header>
        <main className="p-8">
          {children}
        </main>
      </div>
    </RoleGuard>
  );
}

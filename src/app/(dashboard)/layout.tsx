"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { TopStats } from "@/components/dashboard/top-stats";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F7F7F7] font-nunito relative overflow-hidden">
      {/* Subtle brand pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-multiply" />
      
      {/* Sidebar for Desktop */}
      <Sidebar className="hidden lg:flex" />

      {/* Mobile Navigation */}
      <MobileNav className="lg:hidden" />

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 min-h-screen relative z-10">
        <div className="max-w-5xl mx-auto p-4 md:p-8 pb-32 lg:pb-8">
          <div className="flex justify-end mb-6">
            <TopStats />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}

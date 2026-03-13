"use client";

import React from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LessonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleQuit = () => {
    // Show confirmation if needed
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Lesson Header */}
      <header className="max-w-5xl mx-auto w-full px-6 py-6 flex items-center gap-6">
        <button 
          onClick={handleQuit}
          className="p-2 hover:bg-[#F7F7F7] rounded-full transition-colors group"
        >
          <X className="w-6 h-6 text-[#AFAFAF] group-hover:text-[#4B4B4B] transition-colors" />
        </button>

        {/* Progress Bar */}
        <div className="flex-1 h-4 bg-[#E5E5E5] rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 rounded-full" 
            style={{ width: "20%" }} 
          />
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-12">
          {children}
        </div>
      </main>
    </div>
  );
}

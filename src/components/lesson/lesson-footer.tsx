"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface LessonFooterProps {
  status: 'IDLE' | 'CORRECT' | 'WRONG';
  isDisabled?: boolean;
  isLoading?: boolean;
  onContinue: () => void;
  onCheck?: () => void;
  message?: string;
}

export function LessonFooter({
  status,
  isDisabled,
  isLoading,
  onContinue,
  onCheck,
  message,
}: LessonFooterProps) {
  return (
    <footer className={cn(
      "w-full border-t-2 py-8 px-6 transition-colors duration-300",
      status === 'IDLE' && "bg-white border-[#E5E5E5]",
      status === 'CORRECT' && "bg-[#FFF2E5] border-transparent",
      status === 'WRONG' && "bg-[#FFDFE0] border-transparent"
    )}>
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex-1">
          {status === 'CORRECT' && (
            <div className="flex items-center gap-4 text-primary">
              <div className="bg-white rounded-full p-1">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black">Amazing!</h3>
                {message && <p className="font-bold">{message}</p>}
              </div>
            </div>
          )}

          {status === 'WRONG' && (
            <div className="flex items-center gap-4 text-[#EA2B2B]">
              <div className="bg-white rounded-full p-1">
                <AlertCircle className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black">Correct answer:</h3>
                {message && <p className="font-bold">{message}</p>}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          {status === 'IDLE' ? (
             <button
                disabled={isDisabled || isLoading}
                onClick={onContinue}
                className={cn(
                   "px-10 py-3 rounded-2xl font-black uppercase tracking-wide transition-all",
                   isDisabled 
                      ? "bg-[#E5E5E5] text-[#AFB3B8] cursor-not-allowed" 
                      : "bg-primary text-white hover:brightness-110 shadow-[0_5px_0_0_#E6722D] active:shadow-none active:translate-y-1"
                )}
             >
                {isLoading ? "Checking..." : "Continue"}
             </button>
          ) : (
            <button
               onClick={onContinue}
               className={cn(
                "px-10 py-3 rounded-2xl font-black uppercase tracking-wide text-white shadow-lg active:translate-y-1 active:shadow-none transition-all",
                status === 'CORRECT' ? "bg-primary shadow-[0_5px_0_0_#E6722D]" : "bg-[#FF4B4B] shadow-[0_5px_0_0_#EA2B2B]"
              )}
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}

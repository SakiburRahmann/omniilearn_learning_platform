"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit3 } from "lucide-react";
import { ModularAvatar } from "@/components/avatar/modular-avatar";
import { RpmCreator } from "@/components/avatar/rpm-creator";
import { api } from "@/utils/trpc";
import { Loader2 } from "lucide-react";

export default function AvatarEditorPage() {
  const router = useRouter();
  const [showCreator, setShowCreator] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize with DB config if available
  // Cast the hook result to any to bypass Next.js deep type instantiation limits on Prisma.JsonValue
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profileData } = api.user.getProfile.useQuery(undefined) as any;
  
  // Force-cast to simple Record to kill excessive typescript recursion on Prisma.JsonValue
  const currentConfig = (profileData?.studentProfile?.avatarConfig as Record<string, unknown>) || {};

  const updateAvatar = api.user.updateAvatar.useMutation({
    onSuccess: () => {
      router.push("/profile");
      router.refresh();
    },
    onError: (err) => {
      console.error("Failed to save avatar", err);
      setIsSaving(false);
    }
  });

  const handleAvatarExported = (avatarUrl: string) => {
    setShowCreator(false);
    setIsSaving(true);
    
    // The RPM URL natively provides a .glb, but we want the 2D render for the UI
    // Example: https://models.readyplayer.me/678a1...9b2.glb
    // Becomes: https://models.readyplayer.me/678a1...9b2.png
    const pngUrl = avatarUrl.replace('.glb', '.png');

    updateAvatar.mutate({
      config: {
        avatarUrl,
        pngUrl
      }
    });
  };

  return (
    <div className="min-h-screen pb-12">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push("/profile")}
          className="w-10 h-10 rounded-full bg-[#F7F7F7] border-2 border-[#E5E5E5] flex items-center justify-center hover:bg-[#EBEBEB] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#4B4B4B]" />
        </button>
        <h1 className="text-xl font-black text-[#4B4B4B]">3D Avatar Creator</h1>
      </div>

      <div className="flex flex-col items-center justify-center max-w-2xl mx-auto mt-12 space-y-8 text-center">
        
        <div className="w-64 h-64 relative rounded-[2rem] overflow-hidden border-4 border-[#E5E5E5] bg-[#F7F7F7] shadow-xl">
          <ModularAvatar 
            config={currentConfig} 
            size={256} 
            showBackground={true} 
            className="w-full h-full object-cover" 
          />
          {isSaving && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          )}
        </div>

        <div>
          <h2 className="text-3xl font-black text-[#4B4B4B] mb-4">Upgrade Your Look</h2>
          <p className="text-[#AFAFAF] font-bold text-lg mb-8 max-w-md mx-auto">
            Design a premium AAA 3D avatar using the global standard character engine.
          </p>
          
          <button
            onClick={() => setShowCreator(true)}
            disabled={isSaving}
            className="duo-button-secondary py-4 px-8 uppercase flex items-center justify-center gap-3 text-lg w-full sm:w-auto mx-auto disabled:opacity-50 shadow-[0_4px_0_0_#1cb0f6] active:shadow-[0_0_0_0_#1cb0f6] active:translate-y-1"
          >
            <Edit3 className="w-6 h-6" />
            Launch 3D Engine
          </button>
        </div>

      </div>

      {showCreator && (
        <RpmCreator 
          onAvatarExported={handleAvatarExported}
          onClose={() => setShowCreator(false)}
        />
      )}
    </div>
  );
}

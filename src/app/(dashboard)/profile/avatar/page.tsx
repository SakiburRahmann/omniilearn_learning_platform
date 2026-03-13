"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Smile, User, Shirt, Palette } from "lucide-react";
import { ModularAvatar, DEFAULT_AVATAR } from "@/components/avatar/modular-avatar";
import type { AvatarConfig } from "@/components/avatar/modular-avatar";
import { cn } from "@/lib/utils";
import { api } from "@/utils/trpc";
import { Loader2 } from "lucide-react";

/* ─── Tabs ─── */
type Tab = "face" | "hair" | "clothes" | "colors";

/* ─── Palettes ─── */
const SKIN_TONES = ["#F9C9B6", "#AC6651", "#77311D", "#E0AC69", "#FFDBAC", "#8D5524"];
const HAIR_COLORS = ["#000000", "#4A3123", "#D2975A", "#FDF1B8", "#B55239", "#8B4513", "#4169E1", "#FF1493"];
const SHIRT_COLORS = ["#9287FF", "#6BD9E9", "#FC909F", "#F4D150", "#E0E0E0", "#FF8135"];
const BG_COLORS = ["#E5E5E5", "#FFEDEF", "#E0F7FA", "#FFFDE7", "#E8F5E9", "#F3E5F5", "#FFEBEE", "#EFEBE9"];

/* ─── Options ─── */
const FACE_SHAPES = [
  { id: "oval", label: "Oval Eyes" },
  { id: "circle", label: "Circle Eyes" },
  { id: "smile", label: "Smile Eyes" },
];
const MOUTH_SHAPES = [
  { id: "smile", label: "Smile" },
  { id: "laugh", label: "Laugh" },
  { id: "peace", label: "Peace" },
];
const NOSE_SHAPES = [
  { id: "short", label: "Short" },
  { id: "long", label: "Long" },
  { id: "round", label: "Round" },
];
const HAIR_STYLES = [
  { id: "normal", label: "Normal" },
  { id: "thick", label: "Thick" },
  { id: "mohawk", label: "Mohawk" },
  { id: "womanLong", label: "Long" },
  { id: "womanShort", label: "Short" },
];
const HAT_STYLES = [
  { id: "none", label: "None" },
  { id: "beanie", label: "Beanie" },
  { id: "turban", label: "Turban" },
];
const GLASSES_STYLES = [
  { id: "none", label: "None" },
  { id: "round", label: "Round" },
  { id: "square", label: "Square" },
];
const SHIRT_STYLES = [
  { id: "hoody", label: "Hoody" },
  { id: "short", label: "T-Shirt" },
  { id: "polo", label: "Polo" },
];

/* ─── Tab Definitions ─── */
const TABS: { id: Tab; icon: typeof User; label: string }[] = [
  { id: "face", icon: Smile, label: "Face" },
  { id: "hair", icon: User, label: "Hair/Hat" },
  { id: "clothes", icon: Shirt, label: "Clothes" },
  { id: "colors", icon: Palette, label: "Background" },
];

export default function AvatarEditorPage() {
  const router = useRouter();
  
  const [config, setConfig] = useState<AvatarConfig>({ ...DEFAULT_AVATAR });
  const [activeTab, setActiveTab] = useState<Tab>("face");
  const [isSaving, setIsSaving] = useState(false);

  // Initialize with DB config if available
  const { data: profileData } = api.user.getProfile.useQuery(undefined);

  useEffect(() => {
    if (profileData?.studentProfile?.avatarConfig) {
      setConfig((prev) => ({
        ...prev,
        ...(profileData?.studentProfile?.avatarConfig as unknown as AvatarConfig)
      }));
    }
  }, [profileData]);

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

  const handleSave = () => {
    setIsSaving(true);
    updateAvatar.mutate({
      config: config
    });
  };

  const update = (partial: Partial<AvatarConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
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
        <h1 className="text-xl font-black text-[#4B4B4B]">Edit Avatar</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Preview Panel */}
        <div className="w-full lg:w-[420px] flex-shrink-0">
          <div className="w-full aspect-square rounded-[2rem] overflow-hidden border-2 border-[#E5E5E5] bg-white flex justify-center items-center shadow-lg relative">
            <ModularAvatar config={config} size={420} showBackground={true} className="rounded-[2rem] overflow-hidden" />
          </div>
        </div>

        {/* Options Panel */}
        <div className="flex-1 w-full bg-white rounded-[2rem] border-2 border-[#E5E5E5] overflow-hidden flex flex-col min-h-[500px]">
          {/* Category Tabs */}
          <div className="flex border-b-2 border-[#E5E5E5] bg-[#F7F7F7] overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 min-w-[100px] py-4 flex items-center justify-center gap-2 transition-all relative text-sm font-black uppercase tracking-wide",
                  activeTab === tab.id ? "bg-white text-primary" : "text-[#AFAFAF] hover:bg-white/50"
                )}
              >
                <tab.icon className="w-5 h-5" />
                <span className="hidden sm:inline">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-6 overflow-y-auto space-y-8 max-h-[500px]">
            {activeTab === "face" && (
              <>
                <div>
                  <h3 className="text-sm font-black text-[#4B4B4B] mb-4">Skin Tone</h3>
                  <div className="grid grid-cols-6 gap-3">
                    {SKIN_TONES.map((color) => (
                      <button
                        key={color}
                        onClick={() => update({ faceColor: color })}
                        className={cn("aspect-square rounded-full border-2 transition-all hover:scale-110", config.faceColor === color ? "border-primary scale-110" : "border-transparent")}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#4B4B4B] mb-4">Eyes</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {FACE_SHAPES.map((s) => (
                      <button key={s.id} onClick={() => update({ eyeStyle: s.id as any })} className={cn("p-3 rounded-2xl border-2 font-bold text-sm hover:bg-gray-50", config.eyeStyle === s.id ? "border-primary text-primary bg-primary/5" : "border-[#E5E5E5] text-[#AFAFAF]")}>{s.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#4B4B4B] mb-4">Mouth</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {MOUTH_SHAPES.map((s) => (
                      <button key={s.id} onClick={() => update({ mouthStyle: s.id as any })} className={cn("p-3 rounded-2xl border-2 font-bold text-sm hover:bg-gray-50", config.mouthStyle === s.id ? "border-primary text-primary bg-primary/5" : "border-[#E5E5E5] text-[#AFAFAF]")}>{s.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#4B4B4B] mb-4">Nose</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {NOSE_SHAPES.map((s) => (
                      <button key={s.id} onClick={() => update({ noseStyle: s.id as any })} className={cn("p-3 rounded-2xl border-2 font-bold text-sm hover:bg-gray-50", config.noseStyle === s.id ? "border-primary text-primary bg-primary/5" : "border-[#E5E5E5] text-[#AFAFAF]")}>{s.label}</button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === "hair" && (
              <>
                <div>
                  <h3 className="text-sm font-black text-[#4B4B4B] mb-4">Hair Style</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {HAIR_STYLES.map((s) => (
                      <button key={s.id} onClick={() => update({ hairStyle: s.id as any })} className={cn("p-3 rounded-2xl border-2 font-bold text-sm hover:bg-gray-50", config.hairStyle === s.id ? "border-primary text-primary bg-primary/5" : "border-[#E5E5E5] text-[#AFAFAF]")}>{s.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#4B4B4B] mb-4">Hair Color</h3>
                  <div className="grid grid-cols-6 gap-3">
                    {HAIR_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => update({ hairColor: color })}
                        className={cn("aspect-square rounded-full border-2 transition-all hover:scale-110", config.hairColor === color ? "border-primary scale-110" : "border-transparent")}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#4B4B4B] mb-4">Hat / Headwear</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {HAT_STYLES.map((s) => (
                      <button key={s.id} onClick={() => update({ hatStyle: s.id as any })} className={cn("p-3 rounded-2xl border-2 font-bold text-sm hover:bg-gray-50", config.hatStyle === s.id ? "border-primary text-primary bg-primary/5" : "border-[#E5E5E5] text-[#AFAFAF]")}>{s.label}</button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === "clothes" && (
              <>
                <div>
                  <h3 className="text-sm font-black text-[#4B4B4B] mb-4">Shirt Style</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {SHIRT_STYLES.map((s) => (
                      <button key={s.id} onClick={() => update({ shirtStyle: s.id as any })} className={cn("p-3 rounded-2xl border-2 font-bold text-sm hover:bg-gray-50", config.shirtStyle === s.id ? "border-primary text-primary bg-primary/5" : "border-[#E5E5E5] text-[#AFAFAF]")}>{s.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#4B4B4B] mb-4">Shirt Color</h3>
                  <div className="grid grid-cols-6 gap-3">
                    {SHIRT_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => update({ shirtColor: color })}
                        className={cn("aspect-square rounded-full border-2 transition-all hover:scale-110", config.shirtColor === color ? "border-primary scale-110" : "border-transparent")}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#4B4B4B] mb-4">Glasses</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {GLASSES_STYLES.map((s) => (
                      <button key={s.id} onClick={() => update({ glassesStyle: s.id as any })} className={cn("p-3 rounded-2xl border-2 font-bold text-sm hover:bg-gray-50", config.glassesStyle === s.id ? "border-primary text-primary bg-primary/5" : "border-[#E5E5E5] text-[#AFAFAF]")}>{s.label}</button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === "colors" && (
              <>
                <div>
                  <h3 className="text-sm font-black text-[#4B4B4B] mb-4">Background Color</h3>
                  <div className="grid grid-cols-6 gap-3">
                    {BG_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => update({ bgColor: color })}
                        className={cn("aspect-square rounded-full border-2 transition-all hover:scale-110", config.bgColor === color ? "border-primary scale-110" : "border-[#E5E5E5]")}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Done Button */}
          <div className="p-5 border-t-2 border-[#E5E5E5]">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="duo-button-secondary w-full py-4 uppercase flex items-center justify-center gap-2 text-base disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Done
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

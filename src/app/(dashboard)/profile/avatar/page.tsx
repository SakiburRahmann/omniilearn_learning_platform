"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Smile, User, Shirt, Palette } from "lucide-react";
import { ModularAvatar, DEFAULT_AVATAR } from "@/components/avatar/modular-avatar";
import type { MicahOptions } from "@/components/avatar/modular-avatar";
import { cn } from "@/lib/utils";
import { api } from "@/utils/trpc";
import { Loader2 } from "lucide-react";

/* ─── Tabs ─── */
type Tab = "face" | "hair" | "clothes" | "colors";

/* ─── Palettes ─── */
const SKIN_TONES = ["f9c9b6", "ac6651", "77311d", "e0ac69", "ffdbac", "8d5524"];
const HAIR_COLORS = ["000000", "4a3123", "d2975a", "fdf1b8", "b55239", "8b4513", "4169e1", "ff1493", "77311d", "e0ac69"];
const SHIRT_COLORS = ["9287ff", "6bd9e9", "fc909f", "f4d150", "e0e0e0", "ff8135"];
const BG_COLORS = ["e5e5e5", "ffedef", "e0f7fa", "fffde7", "e8f5e9", "f3e5f5", "ffebee", "efebe9"];

/* ─── Options ─── */
const EYES = [
  { id: "eyes", label: "Normal" },
  { id: "round", label: "Round" },
  { id: "smiling", label: "Smiling" },
  { id: "eyesShadow", label: "Shadow" },
];
const MOUTHS = [
  { id: "smile", label: "Smile" },
  { id: "smirk", label: "Smirk" },
  { id: "laughing", label: "Laughing" },
  { id: "pucker", label: "Pucker" },
  { id: "nervous", label: "Nervous" },
  { id: "sad", label: "Sad" },
  { id: "surprised", label: "Surprise" },
];
const EYEBROWS = [
  { id: "eyebrows", label: "Normal" },
  { id: "up", label: "Arched Up" },
  { id: "down", label: "Arched Down" },
];
const NOSES = [
  { id: "curve", label: "Curved" },
  { id: "pointed", label: "Pointed" },
  { id: "tound", label: "Round" }, // Using dicebear's exact spelling typo
];

const HAIR_STYLES = [
  { id: "fonze", label: "Fonze" },
  { id: "full", label: "Full" },
  { id: "pixie", label: "Pixie" },
  { id: "dannyPhantom", label: "Danny" },
  { id: "dougFunny", label: "Doug" },
  { id: "mrClean", label: "Bald" },
  { id: "mrT", label: "Mohawk" },
  { id: "turban", label: "Turban" },
];
const FACIAL_HAIR = [
  { id: "none", label: "None" },
  { id: "scruff", label: "Scruff" },
  { id: "beard", label: "Beard" },
];

const SHIRT_STYLES = [
  { id: "collared", label: "Collared" },
  { id: "crew", label: "Crew Neck" },
  { id: "open", label: "Open Collar" },
];
const GLASSES = [
  { id: "none", label: "None" },
  { id: "round", label: "Round" },
  { id: "square", label: "Square" },
];
const EARRINGS = [
  { id: "none", label: "None" },
  { id: "hoop", label: "Hoop" },
  { id: "stud", label: "Stud" },
];

/* ─── Tab Definitions ─── */
const TABS: { id: Tab; icon: typeof User; label: string }[] = [
  { id: "face", icon: Smile, label: "Face" },
  { id: "hair", icon: User, label: "Hair/Facial" },
  { id: "clothes", icon: Shirt, label: "Clothes/Acc" },
  { id: "colors", icon: Palette, label: "Background" },
];

export default function AvatarEditorPage() {
  const router = useRouter();
  
  const [config, setConfig] = useState<MicahOptions>({ ...DEFAULT_AVATAR });
  const [activeTab, setActiveTab] = useState<Tab>("face");
  const [isSaving, setIsSaving] = useState(false);

  // Initialize with DB config if available
  // Cast the hook result to any to bypass Next.js deep type instantiation limits on Prisma.JsonValue
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profileData } = api.user.getProfile.useQuery(undefined) as any;

  useEffect(() => {
    // Only load from DB if there's actual configuration and it isn't the RPM style config
    const dbConfig = profileData?.studentProfile?.avatarConfig as MicahOptions | undefined;
    if (dbConfig && !dbConfig.hasOwnProperty('avatarUrl') && Object.keys(dbConfig).length > 0) {
      setConfig((prev) => ({
        ...prev,
        ...dbConfig
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

  const update = (partial: Partial<MicahOptions>) => {
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
        <h1 className="text-xl font-black text-[#4B4B4B]">Create Avatar</h1>
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
          <div className="flex border-b-2 border-[#E5E5E5] bg-[#F7F7F7] overflow-x-auto scrollbar-hide">
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
          <div className="flex-1 p-6 overflow-y-auto space-y-8 max-h-[600px] lg:max-h-[500px]">
            {activeTab === "face" && (
              <>
                <div>
                  <h3 className="text-sm font-black text-[#4B4B4B] mb-4">Skin Tone</h3>
                  <div className="grid grid-cols-6 gap-3">
                    {SKIN_TONES.map((color) => (
                      <button
                        key={color}
                        onClick={() => update({ baseColor: color })}
                        className={cn("aspect-square rounded-full border-2 transition-all hover:scale-110", config.baseColor === color ? "border-primary scale-110" : "border-transparent")}
                        style={{ backgroundColor: `#${color}` }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#4B4B4B] mb-4">Eyes</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {EYES.map((s) => (
                      <button key={s.id} onClick={() => update({ eyes: s.id })} className={cn("p-3 rounded-2xl border-2 font-bold text-sm hover:bg-gray-50", config.eyes === s.id ? "border-primary text-primary bg-primary/5" : "border-[#E5E5E5] text-[#AFAFAF]")}>{s.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#4B4B4B] mb-4">Eyebrows</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {EYEBROWS.map((s) => (
                      <button key={s.id} onClick={() => update({ eyebrows: s.id })} className={cn("p-3 rounded-2xl border-2 font-bold text-sm hover:bg-gray-50", config.eyebrows === s.id ? "border-primary text-primary bg-primary/5" : "border-[#E5E5E5] text-[#AFAFAF]")}>{s.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#4B4B4B] mb-4">Mouth</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {MOUTHS.map((s) => (
                      <button key={s.id} onClick={() => update({ mouth: s.id })} className={cn("p-3 rounded-2xl border-2 font-bold text-sm hover:bg-gray-50", config.mouth === s.id ? "border-primary text-primary bg-primary/5" : "border-[#E5E5E5] text-[#AFAFAF]")}>{s.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#4B4B4B] mb-4">Nose</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {NOSES.map((s) => (
                      <button key={s.id} onClick={() => update({ nose: s.id })} className={cn("p-3 rounded-2xl border-2 font-bold text-sm hover:bg-gray-50", config.nose === s.id ? "border-primary text-primary bg-primary/5" : "border-[#E5E5E5] text-[#AFAFAF]")}>{s.label}</button>
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
                      <button key={s.id} onClick={() => update({ hair: s.id })} className={cn("p-3 rounded-2xl border-2 font-bold text-sm hover:bg-gray-50", config.hair === s.id ? "border-primary text-primary bg-primary/5" : "border-[#E5E5E5] text-[#AFAFAF]")}>{s.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#4B4B4B] mb-4">Hair Color</h3>
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                    {HAIR_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => update({ hairColor: color })}
                        className={cn("aspect-square rounded-full border-2 transition-all hover:scale-110", config.hairColor === color ? "border-primary scale-110" : "border-transparent")}
                        style={{ backgroundColor: `#${color}` }}
                      />
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t-2 border-[#E5E5E5]">
                  <h3 className="text-sm font-black text-[#4B4B4B] mb-4">Facial Hair</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {FACIAL_HAIR.map((s) => (
                      <button key={s.id} onClick={() => update({ facialHair: s.id })} className={cn("p-3 rounded-2xl border-2 font-bold text-sm hover:bg-gray-50", config.facialHair === s.id ? "border-primary text-primary bg-primary/5" : "border-[#E5E5E5] text-[#AFAFAF]")}>{s.label}</button>
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
                      <button key={s.id} onClick={() => update({ shirt: s.id })} className={cn("p-3 rounded-2xl border-2 font-bold text-sm hover:bg-gray-50", config.shirt === s.id ? "border-primary text-primary bg-primary/5" : "border-[#E5E5E5] text-[#AFAFAF]")}>{s.label}</button>
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
                        style={{ backgroundColor: `#${color}` }}
                      />
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t-2 border-[#E5E5E5]">
                  <h3 className="text-sm font-black text-[#4B4B4B] mb-4">Glasses</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {GLASSES.map((s) => (
                      <button key={s.id} onClick={() => update({ glasses: s.id })} className={cn("p-3 rounded-2xl border-2 font-bold text-sm hover:bg-gray-50", config.glasses === s.id ? "border-primary text-primary bg-primary/5" : "border-[#E5E5E5] text-[#AFAFAF]")}>{s.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#4B4B4B] mb-4">Earrings</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {EARRINGS.map((s) => (
                      <button key={s.id} onClick={() => update({ earrings: s.id })} className={cn("p-3 rounded-2xl border-2 font-bold text-sm hover:bg-gray-50", config.earrings === s.id ? "border-primary text-primary bg-primary/5" : "border-[#E5E5E5] text-[#AFAFAF]")}>{s.label}</button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === "colors" && (
              <>
                <div>
                  <h3 className="text-sm font-black text-[#4B4B4B] mb-4">Background Color</h3>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                    {BG_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => update({ backgroundColor: color })}
                        className={cn("aspect-square rounded-full border-2 transition-all hover:scale-110", config.backgroundColor === color ? "border-primary scale-110" : "border-[#E5E5E5]")}
                        style={{ backgroundColor: `#${color}` }}
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

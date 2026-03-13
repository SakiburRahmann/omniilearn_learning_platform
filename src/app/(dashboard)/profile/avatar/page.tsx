"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, User, Eye } from "lucide-react";
import { ModularAvatar, DEFAULT_AVATAR } from "@/components/avatar/modular-avatar";
import type { AvatarConfig } from "@/components/avatar/modular-avatar";
import { cn } from "@/lib/utils";

/* ─── Tabs ─── */
type Tab = "body" | "face";

/* ─── Skin Tone Palette (12 tones) ─── */
const SKIN_TONES = [
  "#8D5524", "#A0522D", "#7B4F35", "#6B3A2A",
  "#C68642", "#D2965A", "#E0AC69", "#DEB887",
  "#FFCD94", "#FFDBAC", "#FFE0BD", "#FFF0D6",
];

/* ─── Body Shapes ─── */
const BODY_SHAPES = [
  { id: "body-slim", label: "Slim" },
  { id: "body-standard", label: "Standard" },
  { id: "body-athletic", label: "Athletic" },
  { id: "body-wide", label: "Wide" },
  { id: "body-tall", label: "Tall" },
  { id: "body-stocky", label: "Stocky" },
];

/* ─── Eye Colors (13 colors, matching Duolingo) ─── */
const EYE_COLORS = [
  "#3C3C3C", "#8B4513", "#654321", "#6B8E23",
  "#2E8B8B", "#4169E1", "#483D8B", "#7B3FA0",
  "#FF1493", "#DC143C", "#FF6F00", "#E8A317",
  "#2E8B57",
];

/* ─── Expressions ─── */
const EXPRESSIONS = [
  { id: "exp-default", label: "Default" },
  { id: "exp-happy-left", label: "Look Left" },
  { id: "exp-happy-right", label: "Look Right" },
  { id: "exp-open-smile", label: "Open Smile" },
  { id: "exp-laugh", label: "Laugh" },
  { id: "exp-tongue", label: "Tongue" },
  { id: "exp-smirk", label: "Smirk" },
  { id: "exp-surprised", label: "Surprised" },
  { id: "exp-shocked", label: "Shocked" },
  { id: "exp-worried", label: "Worried" },
  { id: "exp-angry", label: "Angry" },
  { id: "exp-angry-smirk", label: "Angry Smirk" },
  { id: "exp-grumpy", label: "Grumpy" },
  { id: "exp-angry-teeth", label: "Gritting" },
  { id: "exp-sleepy", label: "Sleepy" },
  { id: "exp-bored", label: "Bored" },
  { id: "exp-sleepy-tongue", label: "Yawn" },
  { id: "exp-unamused", label: "Unamused" },
];

/* ─── Tab Definitions ─── */
const TABS: { id: Tab; icon: typeof User; label: string }[] = [
  { id: "body", icon: User, label: "Body" },
  { id: "face", icon: Eye, label: "Face" },
];

export default function AvatarEditorPage() {
  const router = useRouter();
  const [config, setConfig] = useState<AvatarConfig>({ ...DEFAULT_AVATAR });
  const [activeTab, setActiveTab] = useState<Tab>("body");

  const update = (partial: Partial<AvatarConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push("/profile")}
          className="w-10 h-10 rounded-full bg-[#F7F7F7] border-2 border-[#E5E5E5] flex items-center justify-center hover:bg-[#EBEBEB] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#4B4B4B]" />
        </button>
        <h1 className="text-xl font-black text-[#4B4B4B]">Edit Avatar</h1>
      </div>

      {/* Editor Layout — Duolingo: Preview Left, Options Right */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* ── Preview Panel ── */}
        <div className="w-full lg:w-[420px] flex-shrink-0">
          <div
            className="w-full aspect-square rounded-[2rem] overflow-hidden border-2 border-[#E5E5E5]"
            style={{ backgroundColor: config.background }}
          >
            <ModularAvatar config={config} size={420} showBackground={false} />
          </div>
        </div>

        {/* ── Options Panel ── */}
        <div className="flex-1 w-full bg-white rounded-[2rem] border-2 border-[#E5E5E5] overflow-hidden flex flex-col min-h-[500px] lg:min-h-[420px]">
          {/* Category Tabs */}
          <div className="flex border-b-2 border-[#E5E5E5] bg-[#F7F7F7]">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 py-4 flex items-center justify-center gap-2 transition-all relative text-sm font-black uppercase tracking-wide",
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
          <div className="flex-1 p-6 overflow-y-auto space-y-8">
            {activeTab === "body" && (
              <>
                {/* Skin Tone */}
                <div>
                  <h3 className="text-sm font-black text-[#4B4B4B] mb-4">Skin tone</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {SKIN_TONES.map((color) => (
                      <button
                        key={color}
                        onClick={() => update({ skinColor: color })}
                        className={cn(
                          "aspect-square rounded-2xl border-2 transition-all hover:scale-105 active:scale-95",
                          config.skinColor === color
                            ? "border-[#1CB0F6] ring-2 ring-[#1CB0F6]/30 scale-105"
                            : "border-transparent"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Body Shape */}
                <div>
                  <h3 className="text-sm font-black text-[#4B4B4B] mb-4">Body</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {BODY_SHAPES.map((shape) => (
                      <button
                        key={shape.id}
                        onClick={() => update({ bodyShape: shape.id })}
                        className={cn(
                          "aspect-square rounded-2xl border-2 overflow-hidden transition-all hover:scale-105 active:scale-95 bg-[#3C3C3C]",
                          config.bodyShape === shape.id
                            ? "border-[#1CB0F6] ring-2 ring-[#1CB0F6]/30 scale-105"
                            : "border-[#555]"
                        )}
                      >
                        <ModularAvatar
                          config={{ ...config, bodyShape: shape.id, background: "transparent" }}
                          size={120}
                          showBackground={false}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === "face" && (
              <>
                {/* Eye Color */}
                <div>
                  <h3 className="text-sm font-black text-[#4B4B4B] mb-4">Eye color</h3>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                    {EYE_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => update({ eyeColor: color })}
                        className={cn(
                          "aspect-square rounded-2xl border-2 transition-all hover:scale-105 active:scale-95",
                          config.eyeColor === color
                            ? "border-[#1CB0F6] ring-2 ring-[#1CB0F6]/30 scale-105"
                            : "border-transparent"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Expression */}
                <div>
                  <h3 className="text-sm font-black text-[#4B4B4B] mb-4">Expression</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {EXPRESSIONS.map((exp) => (
                      <button
                        key={exp.id}
                        onClick={() => update({ expression: exp.id })}
                        className={cn(
                          "aspect-square rounded-2xl border-2 overflow-hidden transition-all hover:scale-105 active:scale-95 bg-[#3C3C3C]",
                          config.expression === exp.id
                            ? "border-[#1CB0F6] ring-2 ring-[#1CB0F6]/30 scale-105"
                            : "border-[#555]"
                        )}
                      >
                        {/* Mini face thumbnail — shows only head with the expression */}
                        <ModularAvatar
                          config={{
                            ...config,
                            expression: exp.id,
                            background: "transparent",
                            bodyShape: "body-standard",
                          }}
                          size={120}
                          showBackground={false}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Done Button */}
          <div className="p-5 border-t-2 border-[#E5E5E5]">
            <button
              onClick={() => router.push("/profile")}
              className="duo-button-secondary w-full py-4 uppercase flex items-center justify-center gap-2 text-base"
            >
              <Check className="w-5 h-5" />
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

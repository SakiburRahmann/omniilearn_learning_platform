"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ModularAvatar } from "@/components/avatar/modular-avatar";
import { Check, RotateCcw } from "lucide-react";

const SKIN_COLORS = ["#FFDBAC", "#F1C27D", "#E0AC69", "#8D5524", "#C68642"];
const HAIR_COLORS = ["#4B2C20", "#333333", "#F5E97E", "#A0522D", "#8B4513"];
const SHIRT_COLORS = ["#FF8135", "#7879FF", "#5DE2A2", "#FF6B6B", "#00D2D3"];

export function AvatarBuilder() {
  const [skin, setSkin] = useState(SKIN_COLORS[0]);
  const [hair, setHair] = useState(HAIR_COLORS[0]);
  const [shirt, setShirt] = useState(SHIRT_COLORS[0]);

  return (
    <div className="flex flex-col md:flex-row gap-12 items-center">
      {/* Preview Section */}
      <div className="flex-shrink-0 flex flex-col items-center">
        <div className="w-64 h-64 bg-[#F7F7F7] rounded-[3rem] border-4 border-[#E5E5E5] flex items-center justify-center shadow-inner mb-6">
          <ModularAvatar 
            size={200}
            skinColor={skin}
            hairColor={hair}
            shirtColor={shirt}
            eyeType="dot"
            mood="happy"
          />
        </div>
        <button 
          onClick={() => {
            setSkin(SKIN_COLORS[0]);
            setHair(HAIR_COLORS[0]);
            setShirt(SHIRT_COLORS[0]);
          }}
          className="flex items-center gap-2 text-sm font-black text-[#AFAFAF] hover:text-primary transition-colors h-14"
        >
          <RotateCcw className="w-4 h-4" />
          RESET CHARACTER
        </button>
      </div>

      {/* Controls Section */}
      <div className="flex-1 space-y-8 w-full">
        <div>
          <h3 className="text-sm font-black text-[#4B4B4B] uppercase tracking-widest mb-4">Body Tone</h3>
          <div className="flex gap-4 flex-wrap">
            {SKIN_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setSkin(color)}
                className="w-10 h-10 rounded-full border-2 border-[#E5E5E5] flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                style={{ backgroundColor: color }}
              >
                {skin === color && <Check className="w-5 h-5 text-white mix-blend-difference" />}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-black text-[#4B4B4B] uppercase tracking-widest mb-4">Hair Color</h3>
          <div className="flex gap-4 flex-wrap">
            {HAIR_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setHair(color)}
                className="w-10 h-10 rounded-full border-2 border-[#E5E5E5] flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                style={{ backgroundColor: color }}
              >
                {hair === color && <Check className="w-5 h-5 text-white mix-blend-difference" />}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-black text-[#4B4B4B] uppercase tracking-widest mb-4">Outfit Color</h3>
          <div className="flex gap-4 flex-wrap">
            {SHIRT_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setShirt(color)}
                className="w-10 h-10 rounded-full border-2 border-[#E5E5E5] flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                style={{ backgroundColor: color }}
              >
                {shirt === color && <Check className="w-5 h-5 text-white mix-blend-difference" />}
              </button>
            ))}
          </div>
        </div>

        <button className="duo-button-primary w-full py-4 mt-4 uppercase">
           Save Character
        </button>
      </div>
    </div>
  );
}

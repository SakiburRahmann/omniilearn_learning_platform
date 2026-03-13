"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ModularAvatar } from "@/components/avatar/modular-avatar";
import { 
  Check, 
  RotateCcw, 
  User, 
  Eye, 
  Scissors, 
  Glasses, 
  Shirt, 
  Palette, 
  Image as ImageIcon 
} from "lucide-react";
import { cn } from "@/lib/utils";
import * as Constants from "@/components/avatar/constants";

type Category = "body" | "eyes" | "hair" | "accessories" | "clothing" | "background";

export function AvatarBuilder() {
  const [activeCategory, setActiveCategory] = useState<Category>("body");
  
  // Avatar State
  const [skinColor, setSkinColor] = useState(Constants.SKIN_TONES[0].color);
  const [hairStyle, setHairStyle] = useState(Constants.HAIR_STYLES[2].id);
  const [hairColor, setHairColor] = useState(Constants.HAIR_COLORS[0].color);
  const [shirtColor, setShirtColor] = useState(Constants.CLOTHING_COLORS[0].color);
  const [clothingStyle, setClothingStyle] = useState(Constants.CLOTHING_STYLES[0].id);
  const [eyeType, setEyeType] = useState(Constants.EYE_TYPES[0].id);
  const [eyeColor, setEyeColor] = useState(Constants.EYE_COLORS[0].color);
  const [accessory, setAccessory] = useState(Constants.ACCESSORIES[0].id);
  const [backgroundColor, setBackgroundColor] = useState(Constants.BACKGROUNDS[0].color);
  const [mood, setMood] = useState("happy");

  const categories = [
    { id: "body", icon: User },
    { id: "eyes", icon: Eye },
    { id: "hair", icon: Scissors },
    { id: "accessories", icon: Glasses },
    { id: "clothing", icon: Shirt },
    { id: "background", icon: ImageIcon },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
      {/* Preview Section - Sticky on mobile? */}
      <div className="w-full lg:w-auto flex flex-col items-center flex-shrink-0">
        <div 
          className="w-full aspect-square max-w-[320px] lg:w-[400px] lg:h-[400px] rounded-[3rem] border-4 border-[#E5E5E5] flex items-center justify-center shadow-inner overflow-hidden"
          style={{ backgroundColor }}
        >
          <ModularAvatar 
            size={320}
            skinColor={skinColor}
            hairColor={hairColor}
            hairStyle={hairStyle}
            shirtColor={shirtColor}
            clothingStyle={clothingStyle}
            eyeType={eyeType}
            eyeColor={eyeColor}
            mood={mood}
            accessory={accessory}
            backgroundColor="transparent"
          />
        </div>
        <button 
          onClick={() => {
             // Reset logic here
          }}
          className="mt-6 flex items-center gap-2 text-sm font-black text-[#AFAFAF] hover:text-primary transition-colors py-4 px-8"
        >
          <RotateCcw className="w-4 h-4" />
          RESET CHARACTER
        </button>
      </div>

      {/* Selector Section */}
      <div className="flex-1 w-full bg-white rounded-[2rem] border-2 border-[#E5E5E5] overflow-hidden flex flex-col h-[600px]">
        {/* Category Tabs */}
        <div className="flex border-b-2 border-[#E5E5E5] bg-[#F7F7F7] overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as Category)}
              className={cn(
                "flex-1 min-w-[64px] py-6 flex flex-col items-center gap-2 transition-all relative border-r border-[#E5E5E5] last:border-r-0",
                activeCategory === cat.id ? "bg-white text-primary" : "text-[#AFAFAF] hover:bg-white/50"
              )}
            >
              <cat.icon className="w-6 h-6" />
              {activeCategory === cat.id && (
                <motion.div layoutId="activeTab" className="absolute bottom-[-2px] left-0 right-0 h-1 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Option Grid */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-8">
           <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-8"
              >
                {activeCategory === "body" && (
                  <div className="space-y-6">
                    <Section label="Skin Tone">
                      <ColorGrid 
                        items={Constants.SKIN_TONES} 
                        current={skinColor} 
                        onChange={setSkinColor} 
                      />
                    </Section>
                    <Section label="Mood">
                        <div className="flex gap-4">
                           {["happy", "neutral", "surprised"].map(m => (
                               <button 
                                key={m}
                                onClick={() => setMood(m)}
                                className={cn("px-6 py-2 rounded-xl border-2 font-black uppercase text-xs transition-all", mood === m ? "border-primary text-primary bg-primary/5" : "border-[#E5E5E5] text-[#AFAFAF]")}
                               >
                                {m}
                               </button>
                           ))}
                        </div>
                    </Section>
                  </div>
                )}

                {activeCategory === "eyes" && (
                  <div className="space-y-6">
                    <Section label="Eye Shape">
                      <OptionGrid 
                        items={Constants.EYE_TYPES} 
                        current={eyeType} 
                        onChange={setEyeType} 
                      />
                    </Section>
                  </div>
                )}

                {activeCategory === "hair" && (
                  <div className="space-y-6">
                    <Section label="Hair Style">
                      <OptionGrid 
                        items={Constants.HAIR_STYLES} 
                        current={hairStyle} 
                        onChange={setHairStyle} 
                      />
                    </Section>
                    <Section label="Hair Color">
                      <ColorGrid 
                        items={Constants.HAIR_COLORS} 
                        current={hairColor} 
                        onChange={setHairColor} 
                      />
                    </Section>
                  </div>
                )}

                {activeCategory === "clothing" && (
                  <div className="space-y-6">
                    <Section label="Outfit Style">
                      <OptionGrid 
                        items={Constants.CLOTHING_STYLES} 
                        current={clothingStyle} 
                        onChange={setClothingStyle} 
                      />
                    </Section>
                    <Section label="Outfit Color">
                      <ColorGrid 
                        items={Constants.CLOTHING_COLORS} 
                        current={shirtColor} 
                        onChange={setShirtColor} 
                      />
                    </Section>
                  </div>
                )}

                {activeCategory === "accessories" && (
                   <div className="space-y-6">
                     <Section label="Accessories">
                        <OptionGrid 
                          items={Constants.ACCESSORIES} 
                          current={accessory} 
                          onChange={setAccessory} 
                        />
                     </Section>
                   </div>
                )}

                {activeCategory === "background" && (
                   <div className="space-y-6">
                     <Section label="World Theme">
                        <div className="grid grid-cols-4 gap-4">
                           {Constants.BACKGROUNDS.map(bg => (
                               <button
                                key={bg.id}
                                onClick={() => setBackgroundColor(bg.color)}
                                className={cn("h-16 rounded-2xl border-2 transition-all shadow-inner", backgroundColor === bg.color ? "border-primary scale-110" : "border-[#E5E5E5]")}
                                style={{ backgroundColor: bg.color }}
                               />
                           ))}
                        </div>
                     </Section>
                   </div>
                )}
              </motion.div>
           </AnimatePresence>
        </div>

        {/* Footer Action */}
        <div className="p-6 border-t-2 border-[#E5E5E5] bg-white">
          <button className="duo-button-primary w-full py-4 uppercase flex items-center justify-center gap-3">
             <Check className="w-6 h-6" />
             Done
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h4 className="text-[10px] font-black uppercase text-[#AFAFAF] tracking-widest ml-1">{label}</h4>
      {children}
    </div>
  );
}

function ColorGrid({ items, current, onChange }: { items: any[], current: string, onChange: (val: string) => void }) {
  return (
    <div className="flex gap-3 flex-wrap">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onChange(item.color)}
          className={cn(
            "w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all hover:scale-110 shadow-sm",
            current === item.color ? "border-primary scale-110 ring-4 ring-primary/10" : "border-[#E5E5E5]"
          )}
          style={{ backgroundColor: item.color }}
        >
          {current === item.color && <Check className="w-5 h-5 text-white mix-blend-difference" />}
        </button>
      ))}
    </div>
  );
}

function OptionGrid({ items, current, onChange }: { items: any[], current: string, onChange: (val: string) => void }) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={cn(
              "px-4 py-4 rounded-2xl border-2 font-black text-xs uppercase text-center transition-all shadow-sm",
              current === item.id ? "border-primary bg-primary/5 text-primary" : "border-[#E5E5E5] text-[#4B4B4B] hover:bg-[#F7F7F7]"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    );
}

"use client";

import { useMemo } from "react";
import { createAvatar } from "@dicebear/core";
import { micah } from "@dicebear/collection";

export type MicahOptions = {
  baseColor?: string;
  earringColor?: string;
  earrings?: string;
  earringsProbability?: number;
  eyeShadowColor?: string;
  eyebrows?: string;
  eyebrowsColor?: string;
  eyes?: string;
  facialHair?: string;
  facialHairColor?: string;
  facialHairProbability?: number;
  glasses?: string;
  glassesColor?: string;
  glassesProbability?: number;
  hair?: string;
  hairColor?: string;
  hairProbability?: number;
  mouth?: string;
  mouthColor?: string;
  nose?: string;
  shirt?: string;
  shirtColor?: string;
  backgroundColor?: string;
  ears?: string;
};

export const DEFAULT_AVATAR: MicahOptions = {
  baseColor: "f9c9b6",
  hair: "fonze",
  hairColor: "000000",
  shirt: "collared",
  shirtColor: "9287ff",
  eyes: "eyes",
  eyebrows: "up",
  mouth: "smile",
  nose: "pointed",
  backgroundColor: "e5e5e5",
  glassesColor: "000000",
  earringColor: "000000",
};

interface ModularAvatarProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config?: any;
  size?: number;
  className?: string;
  showBackground?: boolean;
}

export function ModularAvatar({
  config,
  size = 300,
  className,
  showBackground = true,
}: ModularAvatarProps) {
  const avatarDataUri = useMemo(() => {
    const isConfigEmpty = !config || Object.keys(config).length === 0;
    // Overwrite the legacy RPM configs containing avatarUrl
    const hasOldRpmConfig = config?.avatarUrl;
    
    let activeConfig: MicahOptions;
    if (isConfigEmpty || hasOldRpmConfig) {
      activeConfig = DEFAULT_AVATAR;
    } else {
      activeConfig = config as MicahOptions;
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dicebearOptions: Record<string, any> = {
      seed: "OmniiBuilder", 
    };

    if (showBackground) {
      const bg = activeConfig.backgroundColor || DEFAULT_AVATAR.backgroundColor;
      dicebearOptions.backgroundColor = [bg?.replace("#", "") || "e5e5e5"];
    } else {
      dicebearOptions.backgroundColor = ["transparent"];
    }

    // Convert strings to single-element arrays per the DiceBear v9 standard API
    for (const [key, rawValue] of Object.entries(activeConfig)) {
      if (key === "backgroundColor") continue;
      
      if (rawValue !== undefined && rawValue !== null) {
        if (typeof rawValue === "number") {
          dicebearOptions[key] = rawValue;
        } else if (typeof rawValue === "string") {
          // Remove hash for colors
          dicebearOptions[key] = [rawValue.replace("#", "")];
        }
      }
    }

    // Force probabilities to ensure optional accessories actually render
    if (activeConfig.earrings && activeConfig.earrings !== "none") {
      dicebearOptions.earringsProbability = 100;
    } else {
      dicebearOptions.earringsProbability = 0;
    }
    
    if (activeConfig.facialHair && activeConfig.facialHair !== "none") {
      dicebearOptions.facialHairProbability = 100;
    } else {
      dicebearOptions.facialHairProbability = 0;
    }
    
    if (activeConfig.glasses && activeConfig.glasses !== "none") {
      dicebearOptions.glassesProbability = 100;
    } else {
      dicebearOptions.glassesProbability = 0;
    }

    if (activeConfig.hair && activeConfig.hair !== "none") {
      dicebearOptions.hairProbability = 100;
    } else {
      dicebearOptions.hairProbability = 0;
    }

    const avatar = createAvatar(micah, dicebearOptions);
    return avatar.toDataUri();
  }, [config, showBackground]);

  return (
    <div 
      className={className} 
      style={{ 
        width: size, 
        height: size, 
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'inherit'
      }}
    >
      {/* Render raw img block for instantaneous client rendering. Avoids Next/Image base64 layout bounds */}
      <img 
        src={avatarDataUri} 
        alt="User Avatar" 
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </div>
  );
}

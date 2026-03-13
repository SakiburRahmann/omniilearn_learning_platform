"use client";

import Avatar, { genConfig } from "react-nice-avatar";

export interface AvatarConfig {
  sex: "man" | "woman";
  faceColor: string;
  earSize: "small" | "big";
  hairColor: string;
  hairStyle: "normal" | "thick" | "mohawk" | "womanLong" | "womanShort";
  hatColor: string;
  hatStyle: "none" | "beanie" | "turban";
  eyeStyle: "circle" | "oval" | "smile";
  glassesStyle: "none" | "round" | "square";
  noseStyle: "short" | "long" | "round";
  mouthStyle: "laugh" | "smile" | "peace";
  shirtStyle: "hoody" | "short" | "polo";
  shirtColor: string;
  bgColor: string;
}

export const DEFAULT_AVATAR: AvatarConfig = {
  sex: "man",
  faceColor: "#F9C9B6",
  earSize: "small",
  hairColor: "#000000",
  hairStyle: "thick",
  hatColor: "#000000",
  hatStyle: "none",
  eyeStyle: "oval",
  glassesStyle: "none",
  noseStyle: "short",
  mouthStyle: "smile",
  shirtStyle: "hoody",
  shirtColor: "#9287FF",
  bgColor: "#E5E5E5",
};

interface ModularAvatarProps {
  config: AvatarConfig;
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
  // Use genConfig to merge with default to ensure no missing props break it
  const finalConfig = genConfig({
    ...DEFAULT_AVATAR,
    ...config,
    isGradient: false,
    ...(!showBackground && { bgColor: "transparent" })
  });

  return (
    <div className={className} style={{ width: size, height: size }}>
      <Avatar className="w-full h-full" shape="rounded" {...finalConfig} />
    </div>
  );
}

"use client";

import { User } from "lucide-react";
import Image from "next/image";

export interface AvatarConfig {
  avatarUrl?: string; // The .glb 3D model URL
  pngUrl?: string;    // The 2D render URL
}

export const DEFAULT_AVATAR: AvatarConfig = {};

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
  
  if (config?.pngUrl) {
    return (
      <div 
        className={className} 
        style={{ 
          width: size, 
          height: size, 
          backgroundColor: showBackground ? '#E5E5E5' : 'transparent',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Image 
          src={config.pngUrl} 
          alt="User Avatar" 
          fill
          sizes={`${size}px`}
          className="object-cover"
          unoptimized // The RPM CDN is already optimized
        />
      </div>
    );
  }

  // Fallback UI
  return (
    <div 
      className={className} 
      style={{ 
        width: size, 
        height: size, 
        backgroundColor: showBackground ? '#E5E5E5' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <User size={size * 0.5} className="text-[#AFAFAF]" />
    </div>
  );
}

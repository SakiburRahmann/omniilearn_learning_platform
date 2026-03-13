"use client";

import { motion } from "framer-motion";

interface AvatarProps {
  size?: number;
  skinColor?: string;
  hairColor?: string;
  shirtColor?: string;
  eyeType?: "dot" | "wide" | "wink";
  mood?: "happy" | "neutral" | "surprised";
  className?: string;
}

export function ModularAvatar({
  size = 200,
  skinColor = "#FFDBAC",
  hairColor = "#4B2C20",
  shirtColor = "#FF8135",
  eyeType = "dot",
  mood = "happy",
  className
}: AvatarProps) {
  return (
    <div className={className} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Shadow/Base */}
        <ellipse cx="100" cy="180" rx="60" ry="10" fill="#000" fillOpacity="0.05" />

        {/* Body/Shirt */}
        <path
          d="M40 190C40 150 70 140 100 140C130 140 160 150 160 190"
          fill={shirtColor}
          stroke="#000"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Head */}
        <motion.circle
          cx="100"
          cy="90"
          r="50"
          fill={skinColor}
          stroke="#000"
          strokeWidth="4"
          animate={{
            y: [0, -4, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Hair - Simple Cap Style */}
        <path
          d="M50 90C50 60 70 40 100 40C130 40 150 60 150 90"
          fill={hairColor}
          stroke="#000"
          strokeWidth="4"
        />

        {/* Eyes */}
        <g transform="translate(100, 90)">
          {eyeType === "dot" && (
            <>
              <circle cx="-15" cy="-5" r="4" fill="#000" />
              <circle cx="15" cy="-5" r="4" fill="#000" />
            </>
          )}
          {eyeType === "wide" && (
            <>
              <circle cx="-15" cy="-5" r="6" fill="#000" />
              <circle cx="15" cy="-5" r="6" fill="#000" />
            </>
          )}
        </g>

        {/* Mouth */}
        <g transform="translate(100, 90)">
          {mood === "happy" && (
            <path
              d="M-15 15C-15 15 0 25 15 15"
              stroke="#000"
              strokeWidth="4"
              strokeLinecap="round"
            />
          )}
          {mood === "surprised" && (
            <circle cy="18" r="6" stroke="#000" strokeWidth="4" />
          )}
        </g>
      </svg>
    </div>
  );
}

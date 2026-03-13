"use client";

import { motion } from "framer-motion";

interface AvatarProps {
  size?: number;
  skinColor?: string;
  hairColor?: string;
  hairStyle?: string;
  shirtColor?: string;
  clothingStyle?: string;
  eyeType?: string;
  eyeColor?: string;
  mood?: string;
  accessory?: string;
  backgroundColor?: string;
  className?: string;
}

export function ModularAvatar({
  size = 200,
  skinColor = "#FFDBAC",
  hairColor = "#4B2C20",
  hairStyle = "hair-short",
  shirtColor = "#FF8135",
  clothingStyle = "cloth-tee",
  eyeType = "eye-standard",
  eyeColor = "#333333",
  mood = "happy",
  accessory = "acc-none",
  backgroundColor = "#F7F7F7",
  className
}: AvatarProps) {
  return (
    <div className={className} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full rounded-[2.5rem]"
        style={{ backgroundColor }}
      >
        {/* Shadow */}
        <ellipse cx="100" cy="185" rx="55" ry="8" fill="#000" fillOpacity="0.08" />

        {/* Global Animation Wrapper - Subtle Breathing */}
        <motion.g
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Body/Clothing */}
          <g>
            {/* Standard T-Shirt Base */}
            <path
              d="M45 190C45 155 70 145 100 145C130 145 155 155 155 190V200H45V190Z"
              fill={shirtColor}
              stroke="#000"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Hoodie Detail */}
            {clothingStyle === "cloth-hoodie" && (
              <path
                d="M75 145L100 165L125 145"
                stroke="#000"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
                opacity="0.3"
              />
            )}
          </g>

          {/* Head Shape - Duolingo-style Rounded Square */}
          <g>
            <rect
              x="55"
              cy="45"
              width="90"
              height="100"
              rx="35"
              fill={skinColor}
              stroke="#000"
              strokeWidth="4"
            />
            {/* Nose - Subtle contrast */}
            <path
              d="M95 110C95 110 100 115 105 110"
              stroke="#000"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.4"
            />
          </g>

          {/* Hair */}
          <g>
            {hairStyle === "hair-short" && (
              <path
                d="M55 80C55 55 70 45 100 45C130 45 145 55 145 80V90H55V80Z"
                fill={hairColor}
                stroke="#000"
                strokeWidth="4"
              />
            )}
            {hairStyle === "hair-spiky" && (
              <path
                d="M55 85C55 55 70 45 100 45C130 45 145 55 145 85H135L125 70L115 85H105L95 70L85 85H55Z"
                fill={hairColor}
                stroke="#000"
                strokeWidth="4"
              />
            )}
            {hairStyle === "hair-bob" && (
              <path
                d="M50 80V120H65V80C65 55 80 40 100 40C120 40 135 55 135 80V120H150V80C150 50 130 35 100 35C70 35 50 50 50 80Z"
                fill={hairColor}
                stroke="#000"
                strokeWidth="4"
              />
            )}
          </g>

          {/* Eyes - Expressive Layers */}
          <g transform="translate(100, 95)">
            {/* Left Eye */}
            <g transform="translate(-22, 0)">
              {eyeType === "eye-standard" && (
                <circle r="7" fill={eyeColor} />
              )}
              {eyeType === "eye-large" && (
                <circle r="10" fill={eyeColor} stroke="#000" strokeWidth="2" />
              )}
            </g>
            {/* Right Eye */}
            <g transform="translate(22, 0)">
              {eyeType === "eye-standard" && (
                <circle r="7" fill={eyeColor} />
              )}
              {eyeType === "eye-large" && (
                <circle r="10" fill={eyeColor} stroke="#000" strokeWidth="2" />
              )}
              {eyeType === "eye-wink" && (
                <path d="M-8 2C-8 2 0 -3 8 2" stroke="#000" strokeWidth="4" strokeLinecap="round" />
              )}
            </g>
          </g>

          {/* Mouth - Responsive Modalities */}
          <g transform="translate(100, 125)">
            {mood === "happy" && (
              <path
                d="M-12 0C-12 0 0 12 12 0"
                stroke="#000"
                strokeWidth="4"
                strokeLinecap="round"
              />
            )}
            {mood === "neutral" && (
              <path d="M-10 2H10" stroke="#000" strokeWidth="4" strokeLinecap="round" />
            )}
            {mood === "surprised" && (
              <circle r="7" stroke="#000" strokeWidth="4" />
            )}
          </g>

          {/* Accessories */}
          <g>
            {accessory === "acc-glasses-round" && (
              <g transform="translate(100, 95)">
                <circle cx="-22" cy="0" r="14" stroke="#4B4B4B" strokeWidth="4" fill="none" />
                <circle cx="22" cy="0" r="14" stroke="#4B4B4B" strokeWidth="4" fill="none" />
                <path d="M-8 0H8" stroke="#4B4B4B" strokeWidth="4" />
              </g>
            )}
            {accessory === "acc-sunglasses" && (
              <g transform="translate(100, 95)">
                <rect x="-38" y="-12" width="32" height="20" rx="4" fill="#333" stroke="#000" strokeWidth="2" />
                <rect x="6" y="-12" width="32" height="20" rx="4" fill="#333" stroke="#000" strokeWidth="2" />
                <path d="M-6 -2H6" stroke="#000" strokeWidth="4" />
              </g>
            )}
            {accessory === "acc-beanie" && (
              <path
                d="M60 60C60 40 80 30 100 30C120 30 140 40 140 60V80H60V60Z"
                fill="#FF6B6B"
                stroke="#000"
                strokeWidth="4"
              />
            )}
          </g>
        </motion.g>
      </svg>
    </div>
  );
}

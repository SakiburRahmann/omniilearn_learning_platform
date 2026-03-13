"use client";

/**
 * High-fidelity modular avatar renderer.
 * Draws layered SVG elements for body, head, eyes, mouth, hair, and accessories.
 * Designed to replicate Duolingo's flat-illustration avatar style.
 */

export interface AvatarConfig {
  skinColor: string;
  bodyShape: string;
  hairStyle: string;
  hairColor: string;
  eyeStyle: string;
  eyeColor: string;
  mouthStyle: string;
  clothingStyle: string;
  clothingColor: string;
  accessory: string;
  accessoryColor: string;
  background: string;
}

export const DEFAULT_AVATAR: AvatarConfig = {
  skinColor: "#E0AC69",
  bodyShape: "body-standard",
  hairStyle: "hair-short-sides",
  hairColor: "#3C2415",
  eyeStyle: "eyes-standard",
  eyeColor: "#3C2415",
  mouthStyle: "mouth-smile",
  clothingStyle: "cloth-crew",
  clothingColor: "#4A4A4A",
  accessory: "acc-none",
  accessoryColor: "#4A4A4A",
  background: "#E8E8E8",
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
  const c = { ...DEFAULT_AVATAR, ...config };

  return (
    <div className={className} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Background */}
        {showBackground && (
          <rect width="400" height="400" fill={c.background} />
        )}

        {/* === BODY / CLOTHING === */}
        <BodyLayer
          bodyShape={c.bodyShape}
          clothingColor={c.clothingColor}
          skinColor={c.skinColor}
        />

        {/* === NECK === */}
        <rect x="170" y="230" width="60" height="35" fill={c.skinColor} />

        {/* === HEAD === */}
        <HeadLayer skinColor={c.skinColor} />

        {/* === EARS === */}
        <ellipse cx="120" cy="195" rx="18" ry="22" fill={c.skinColor} />
        <ellipse cx="280" cy="195" rx="18" ry="22" fill={c.skinColor} />

        {/* === HAIR (back layer behind head is handled by type) === */}
        <HairLayer
          hairStyle={c.hairStyle}
          hairColor={c.hairColor}
        />

        {/* === EYES === */}
        <EyesLayer eyeStyle={c.eyeStyle} eyeColor={c.eyeColor} />

        {/* === NOSE === */}
        <ellipse cx="200" cy="218" rx="8" ry="6" fill={c.skinColor} />
        <path
          d="M192 222 C196 228, 204 228, 208 222"
          stroke="#00000020"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />

        {/* === MOUTH === */}
        <MouthLayer mouthStyle={c.mouthStyle} />
      </svg>
    </div>
  );
}

/* ──────────────────── BODY SHAPES ──────────────────── */

function BodyLayer({
  bodyShape,
  clothingColor,
  skinColor,
}: {
  bodyShape: string;
  clothingColor: string;
  skinColor: string;
}) {
  switch (bodyShape) {
    case "body-slim":
      return (
        <g>
          <path
            d="M155 265 C155 280, 160 320, 140 400 L260 400 C240 320, 245 280, 245 265 Z"
            fill={clothingColor}
          />
          {/* Collar */}
          <path d="M170 260 L200 285 L230 260" stroke={clothingColor} strokeWidth="8" fill={clothingColor} />
        </g>
      );
    case "body-athletic":
      return (
        <g>
          <path
            d="M140 265 C130 290, 125 340, 120 400 L280 400 C275 340, 270 290, 260 265 Z"
            fill={clothingColor}
          />
          <path d="M165 260 L200 290 L235 260" stroke={clothingColor} strokeWidth="8" fill={clothingColor} />
        </g>
      );
    case "body-wide":
      return (
        <g>
          <path
            d="M130 265 C115 300, 100 350, 95 400 L305 400 C300 350, 285 300, 270 265 Z"
            fill={clothingColor}
          />
          <path d="M162 260 L200 292 L238 260" stroke={clothingColor} strokeWidth="8" fill={clothingColor} />
        </g>
      );
    case "body-tall":
      return (
        <g>
          <path
            d="M150 265 C145 300, 140 350, 135 400 L265 400 C260 350, 255 300, 250 265 Z"
            fill={clothingColor}
          />
          <path d="M168 260 L200 288 L232 260" stroke={clothingColor} strokeWidth="8" fill={clothingColor} />
        </g>
      );
    case "body-stocky":
      return (
        <g>
          <path
            d="M135 265 C120 290, 108 335, 105 400 L295 400 C292 335, 280 290, 265 265 Z"
            fill={clothingColor}
          />
          <path d="M160 260 L200 292 L240 260" stroke={clothingColor} strokeWidth="8" fill={clothingColor} />
        </g>
      );
    default: /* body-standard */
      return (
        <g>
          <path
            d="M145 265 C135 295, 128 345, 125 400 L275 400 C272 345, 265 295, 255 265 Z"
            fill={clothingColor}
          />
          <path d="M165 260 L200 290 L235 260" stroke={clothingColor} strokeWidth="8" fill={clothingColor} />
        </g>
      );
  }
}

/* ──────────────────── HEAD ──────────────────── */

function HeadLayer({ skinColor }: { skinColor: string }) {
  return (
    <rect
      x="128"
      y="120"
      width="144"
      height="140"
      rx="52"
      fill={skinColor}
    />
  );
}

/* ──────────────────── HAIR ──────────────────── */

function HairLayer({
  hairStyle,
  hairColor,
}: {
  hairStyle: string;
  hairColor: string;
}) {
  switch (hairStyle) {
    case "hair-none":
      return null;

    case "hair-buzz":
      return (
        <path
          d="M132 175 C132 130, 160 110, 200 110 C240 110, 268 130, 268 175"
          fill={hairColor}
        />
      );

    case "hair-short-sides":
      return (
        <g>
          {/* Top volume */}
          <path
            d="M128 175 C128 125, 155 100, 200 100 C245 100, 272 125, 272 175"
            fill={hairColor}
          />
          {/* Side flats */}
          <rect x="118" y="155" width="18" height="50" rx="9" fill={hairColor} />
          <rect x="264" y="155" width="18" height="50" rx="9" fill={hairColor} />
        </g>
      );

    case "hair-wavy":
      return (
        <g>
          <path
            d="M118 185 C118 120, 150 90, 200 90 C250 90, 282 120, 282 185"
            fill={hairColor}
          />
          {/* Side hair */}
          <path
            d="M118 185 C115 210, 118 240, 130 250 L130 185 Z"
            fill={hairColor}
          />
          <path
            d="M282 185 C285 210, 282 240, 270 250 L270 185 Z"
            fill={hairColor}
          />
        </g>
      );

    case "hair-long":
      return (
        <g>
          <path
            d="M115 185 C115 115, 150 85, 200 85 C250 85, 285 115, 285 185"
            fill={hairColor}
          />
          {/* Long flowing sides */}
          <path
            d="M115 185 C110 230, 115 300, 135 340 L135 185 Z"
            fill={hairColor}
          />
          <path
            d="M285 185 C290 230, 285 300, 265 340 L265 185 Z"
            fill={hairColor}
          />
        </g>
      );

    case "hair-curly":
      return (
        <g>
          <path
            d="M120 180 C120 115, 152 88, 200 88 C248 88, 280 115, 280 180"
            fill={hairColor}
          />
          {/* Curly bumps */}
          <circle cx="135" cy="115" r="18" fill={hairColor} />
          <circle cx="165" cy="100" r="18" fill={hairColor} />
          <circle cx="200" cy="92" r="20" fill={hairColor} />
          <circle cx="235" cy="100" r="18" fill={hairColor} />
          <circle cx="265" cy="115" r="18" fill={hairColor} />
        </g>
      );

    default: /* hair-short-sides */
      return (
        <g>
          <path
            d="M128 175 C128 125, 155 100, 200 100 C245 100, 272 125, 272 175"
            fill={hairColor}
          />
          <rect x="118" y="155" width="18" height="50" rx="9" fill={hairColor} />
          <rect x="264" y="155" width="18" height="50" rx="9" fill={hairColor} />
        </g>
      );
  }
}

/* ──────────────────── EYES ──────────────────── */

function EyesLayer({
  eyeStyle,
  eyeColor,
}: {
  eyeStyle: string;
  eyeColor: string;
}) {
  switch (eyeStyle) {
    case "eyes-wide":
      return (
        <g>
          {/* White sclera */}
          <ellipse cx="172" cy="192" rx="18" ry="20" fill="white" />
          <ellipse cx="228" cy="192" rx="18" ry="20" fill="white" />
          {/* Iris */}
          <circle cx="175" cy="194" r="10" fill={eyeColor} />
          <circle cx="231" cy="194" r="10" fill={eyeColor} />
          {/* Highlight */}
          <circle cx="178" cy="190" r="4" fill="white" />
          <circle cx="234" cy="190" r="4" fill="white" />
        </g>
      );

    case "eyes-small":
      return (
        <g>
          <circle cx="175" cy="194" r="6" fill={eyeColor} />
          <circle cx="225" cy="194" r="6" fill={eyeColor} />
        </g>
      );

    default: /* eyes-standard - Duolingo large eyes */
      return (
        <g>
          {/* White sclera */}
          <ellipse cx="172" cy="192" rx="22" ry="24" fill="white" />
          <ellipse cx="228" cy="192" rx="22" ry="24" fill="white" />
          {/* Iris / Pupil */}
          <circle cx="176" cy="196" r="12" fill={eyeColor} />
          <circle cx="232" cy="196" r="12" fill={eyeColor} />
          {/* Pupil */}
          <circle cx="178" cy="194" r="6" fill="#000" />
          <circle cx="234" cy="194" r="6" fill="#000" />
          {/* Highlight */}
          <circle cx="182" cy="190" r="4" fill="white" />
          <circle cx="238" cy="190" r="4" fill="white" />
        </g>
      );
  }
}

/* ──────────────────── MOUTH ──────────────────── */

function MouthLayer({ mouthStyle }: { mouthStyle: string }) {
  switch (mouthStyle) {
    case "mouth-grin":
      return (
        <path
          d="M176 238 C188 255, 212 255, 224 238"
          stroke="#3C2415"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      );
    case "mouth-open":
      return (
        <g>
          <ellipse cx="200" cy="242" rx="16" ry="12" fill="#8B2500" />
          <path
            d="M184 240 C192 248, 208 248, 216 240"
            fill="#FF6B6B"
          />
        </g>
      );
    default: /* mouth-smile */
      return (
        <path
          d="M182 240 C192 252, 208 252, 218 240"
          stroke="#3C2415"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
      );
  }
}

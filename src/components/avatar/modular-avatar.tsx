"use client";

/**
 * Duolingo-grade modular avatar renderer.
 * Carefully crafted SVG geometry matching Duolingo's exact proportions:
 * - Large egg-shaped eyes with oval iris + highlight
 * - Teardrop nose (darker than skin)
 * - Clean curved mouth
 * - Rounded-square head
 * - Subtle ears
 */

/* ══════════════════════════════════════════════════════
   CONFIG & DEFAULTS
   ══════════════════════════════════════════════════════ */

export interface AvatarConfig {
  skinColor: string;
  bodyShape: string;
  hairStyle: string;
  hairColor: string;
  eyeColor: string;
  expression: string;
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
  eyeColor: "#3C2415",
  expression: "exp-default",
  clothingStyle: "cloth-crew",
  clothingColor: "#4A4A4A",
  accessory: "acc-none",
  accessoryColor: "#4A4A4A",
  background: "#E8E8E8",
};

/* ══════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════ */

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

  /* Derive a slightly darker shade for the nose from skin color */
  const noseColor = darkenHex(c.skinColor, 0.22);

  return (
    <div className={className} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {showBackground && <rect width="400" height="400" fill={c.background} />}

        {/* === BODY / CLOTHING === */}
        <BodyLayer bodyShape={c.bodyShape} clothingColor={c.clothingColor} />

        {/* === NECK === */}
        <rect x="175" y="262" width="50" height="28" fill={c.skinColor} />

        {/* === HEAD — Rounded square (Duolingo signature shape) === */}
        <rect x="115" y="100" width="170" height="172" rx="52" fill={c.skinColor} />

        {/* === EARS — Small, subtle rounded bumps === */}
        <ellipse cx="115" cy="200" rx="12" ry="16" fill={c.skinColor} />
        <ellipse cx="285" cy="200" rx="12" ry="16" fill={c.skinColor} />

        {/* === HAIR === */}
        <HairLayer hairStyle={c.hairStyle} hairColor={c.hairColor} />

        {/* === FACE (expression preset) === */}
        <ExpressionLayer
          expression={c.expression}
          eyeColor={c.eyeColor}
          skinColor={c.skinColor}
          noseColor={noseColor}
        />
      </svg>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   UTILITY: darken a hex color
   ══════════════════════════════════════════════════════ */

function darkenHex(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, ((num >> 16) & 0xff) - Math.round(255 * amount));
  const g = Math.max(0, ((num >> 8) & 0xff) - Math.round(255 * amount));
  const b = Math.max(0, (num & 0xff) - Math.round(255 * amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

/* ══════════════════════════════════════════════════════
   BODY SHAPES
   ══════════════════════════════════════════════════════ */

function BodyLayer({ bodyShape, clothingColor }: { bodyShape: string; clothingColor: string }) {
  /* Collar V-shape */
  const collar = <path d="M172 284 L200 310 L228 284" fill={clothingColor} />;

  switch (bodyShape) {
    case "body-slim":
      return <g><path d="M158 284 C155 310,150 360,142 400 L258 400 C250 360,245 310,242 284 Z" fill={clothingColor} />{collar}</g>;
    case "body-athletic":
      return <g><path d="M145 284 C132 310,120 360,112 400 L288 400 C280 360,268 310,255 284 Z" fill={clothingColor} />{collar}</g>;
    case "body-wide":
      return <g><path d="M132 284 C115 318,98 365,90 400 L310 400 C302 365,285 318,268 284 Z" fill={clothingColor} />{collar}</g>;
    case "body-tall":
      return <g><path d="M152 284 C148 315,142 360,138 400 L262 400 C258 360,252 315,248 284 Z" fill={clothingColor} />{collar}</g>;
    case "body-stocky":
      return <g><path d="M138 284 C122 310,108 350,100 400 L300 400 C292 350,278 310,262 284 Z" fill={clothingColor} />{collar}</g>;
    default: /* body-standard */
      return <g><path d="M148 284 C138 312,128 355,122 400 L278 400 C272 355,262 312,252 284 Z" fill={clothingColor} />{collar}</g>;
  }
}

/* ══════════════════════════════════════════════════════
   HAIR
   ══════════════════════════════════════════════════════ */

function HairLayer({ hairStyle, hairColor }: { hairStyle: string; hairColor: string }) {
  switch (hairStyle) {
    case "hair-none":
      return null;
    case "hair-buzz":
      return <path d="M120 160 C120 115, 150 90, 200 90 C250 90, 280 115, 280 160" fill={hairColor} />;
    case "hair-short-sides":
      return (
        <g>
          {/* Hair cap */}
          <path d="M118 170 C118 112, 152 88, 200 88 C248 88, 282 112, 282 170" fill={hairColor} />
          {/* Side burns */}
          <rect x="105" y="162" width="16" height="42" rx="8" fill={hairColor} />
          <rect x="279" y="162" width="16" height="42" rx="8" fill={hairColor} />
        </g>
      );
    case "hair-wavy":
      return (
        <g>
          <path d="M112 178 C112 108, 148 78, 200 78 C252 78, 288 108, 288 178" fill={hairColor} />
          <path d="M112 178 C108 208, 112 242, 126 252 L126 178 Z" fill={hairColor} />
          <path d="M288 178 C292 208, 288 242, 274 252 L274 178 Z" fill={hairColor} />
        </g>
      );
    case "hair-long":
      return (
        <g>
          <path d="M108 178 C108 105, 148 72, 200 72 C252 72, 292 105, 292 178" fill={hairColor} />
          <path d="M108 178 C104 228, 108 305, 132 345 L132 178 Z" fill={hairColor} />
          <path d="M292 178 C296 228, 292 305, 268 345 L268 178 Z" fill={hairColor} />
        </g>
      );
    case "hair-curly":
      return (
        <g>
          <path d="M114 175 C114 108, 150 80, 200 80 C250 80, 286 108, 286 175" fill={hairColor} />
          <circle cx="130" cy="108" r="18" fill={hairColor} />
          <circle cx="162" cy="92" r="18" fill={hairColor} />
          <circle cx="200" cy="82" r="20" fill={hairColor} />
          <circle cx="238" cy="92" r="18" fill={hairColor} />
          <circle cx="270" cy="108" r="18" fill={hairColor} />
        </g>
      );
    default:
      return (
        <g>
          <path d="M118 170 C118 112, 152 88, 200 88 C248 88, 282 112, 282 170" fill={hairColor} />
          <rect x="105" y="162" width="16" height="42" rx="8" fill={hairColor} />
          <rect x="279" y="162" width="16" height="42" rx="8" fill={hairColor} />
        </g>
      );
  }
}

/* ══════════════════════════════════════════════════════
   EXPRESSION PRESETS
   Each preset renders: Eyes + Eyebrows + Nose + Mouth.
   Written to match Duolingo's clean, large, expressive style.
   ══════════════════════════════════════════════════════ */

function ExpressionLayer({
  expression,
  eyeColor,
  skinColor,
  noseColor,
}: {
  expression: string;
  eyeColor: string;
  skinColor: string;
  noseColor: string;
}) {
  /* ── REUSABLE: Teardrop nose (Duolingo signature) ── */
  const nose = (
    <path
      d="M195 216 C195 210, 200 204, 200 204 C200 204, 205 210, 205 216 C205 220, 203 224, 200 224 C197 224, 195 220, 195 216 Z"
      fill={noseColor}
    />
  );

  /* ── REUSABLE: Standard large Duolingo eyes ── */
  const bigEyes = (irisOX = 0, irisOY = 0) => (
    <g>
      {/* Left eye */}
      <ellipse cx="170" cy="186" rx="26" ry="28" fill="white" />
      <ellipse cx={172 + irisOX} cy={190 + irisOY} rx="14" ry="16" fill={eyeColor} />
      <circle cx={175 + irisOX} cy={187 + irisOY} r="5" fill="white" />
      {/* Right eye */}
      <ellipse cx="230" cy="186" rx="26" ry="28" fill="white" />
      <ellipse cx={232 + irisOX} cy={190 + irisOY} rx="14" ry="16" fill={eyeColor} />
      <circle cx={235 + irisOX} cy={187 + irisOY} r="5" fill="white" />
    </g>
  );

  /* ── REUSABLE: Sleepy / half-lid eyes ── */
  const sleepyEyes = (irisOX = 0) => (
    <g>
      {/* Left eye */}
      <ellipse cx="170" cy="186" rx="26" ry="28" fill="white" />
      {/* Eyelid covering top portion */}
      <ellipse cx="170" cy="176" rx="28" ry="16" fill={skinColor} />
      <ellipse cx={172 + irisOX} cy="194" rx="13" ry="14" fill={eyeColor} />
      {/* Right eye */}
      <ellipse cx="230" cy="186" rx="26" ry="28" fill="white" />
      <ellipse cx="230" cy="176" rx="28" ry="16" fill={skinColor} />
      <ellipse cx={232 + irisOX} cy="194" rx="13" ry="14" fill={eyeColor} />
    </g>
  );

  /* ── REUSABLE: Angry eyes with angled eyelids ── */
  const angryEyes = (irisOX = 0) => (
    <g>
      {/* Left eye */}
      <ellipse cx="170" cy="188" rx="26" ry="26" fill="white" />
      <polygon points="144,172 196,180 196,168" fill={skinColor} />
      <ellipse cx={172 + irisOX} cy="194" rx="13" ry="14" fill={eyeColor} />
      <circle cx={175 + irisOX} cy="191" r="4" fill="white" />
      {/* Right eye */}
      <ellipse cx="230" cy="188" rx="26" ry="26" fill="white" />
      <polygon points="256,172 204,180 204,168" fill={skinColor} />
      <ellipse cx={232 + irisOX} cy="194" rx="13" ry="14" fill={eyeColor} />
      <circle cx={235 + irisOX} cy="191" r="4" fill="white" />
    </g>
  );

  /* ── MOUTHS ── */
  const smileMouth = (
    <path d="M184 244 C194 256, 206 256, 216 244" stroke="#5C3A1E" strokeWidth="3.5" strokeLinecap="round" fill="none" />
  );

  const openSmileMouth = (
    <g>
      <ellipse cx="200" cy="250" rx="16" ry="12" fill="#5C1A0A" />
      <path d="M184 248 C194 256, 206 256, 216 248" fill="#E85D5D" />
    </g>
  );

  const laughMouth = (
    <g>
      <path d="M178 242 C190 268, 210 268, 222 242 Z" fill="#5C1A0A" />
      <path d="M180 244 C190 250, 210 250, 220 244" fill="white" />
      <path d="M186 258 C194 266, 206 266, 214 258" fill="#E85D5D" />
    </g>
  );

  const tongueMouth = (
    <g>
      <ellipse cx="200" cy="250" rx="16" ry="13" fill="#5C1A0A" />
      <ellipse cx="200" cy="258" rx="9" ry="8" fill="#E85D5D" />
    </g>
  );

  const surprisedMouth = <ellipse cx="200" cy="252" rx="9" ry="11" fill="#5C1A0A" />;

  const frownMouth = (
    <path d="M184 254 C194 244, 206 244, 216 254" stroke="#5C3A1E" strokeWidth="3.5" strokeLinecap="round" fill="none" />
  );

  const neutralMouth = (
    <path d="M185 250 L215 250" stroke="#5C3A1E" strokeWidth="3.5" strokeLinecap="round" />
  );

  const smirkMouth = (
    <path d="M188 248 C200 256, 212 252, 220 244" stroke="#5C3A1E" strokeWidth="3.5" strokeLinecap="round" fill="none" />
  );

  const grittingMouth = (
    <g>
      <rect x="182" y="244" width="36" height="18" rx="7" fill="#5C1A0A" />
      <rect x="185" y="248" width="30" height="6" rx="2" fill="white" />
    </g>
  );

  switch (expression) {
    /* ─── HAPPY FAMILY ─── */
    case "exp-happy-left":
      return <g>{bigEyes(-5, 0)}{nose}{smileMouth}</g>;

    case "exp-happy-right":
      return <g>{bigEyes(5, 0)}{nose}{smileMouth}</g>;

    case "exp-laugh":
      return <g>{bigEyes(0, -2)}{nose}{laughMouth}</g>;

    case "exp-tongue":
      return <g>{bigEyes(0, 0)}{nose}{tongueMouth}</g>;

    case "exp-open-smile":
      return <g>{bigEyes(0, 0)}{nose}{openSmileMouth}</g>;

    case "exp-smirk":
      return <g>{bigEyes(4, 0)}{nose}{smirkMouth}</g>;

    /* ─── SURPRISED / WORRIED ─── */
    case "exp-surprised":
      return (
        <g>
          {/* Extra-large eyes for surprise */}
          <ellipse cx="170" cy="184" rx="28" ry="32" fill="white" />
          <ellipse cx="230" cy="184" rx="28" ry="32" fill="white" />
          <ellipse cx="174" cy="190" rx="14" ry="16" fill={eyeColor} />
          <ellipse cx="234" cy="190" rx="14" ry="16" fill={eyeColor} />
          <circle cx="178" cy="186" r="5" fill="white" />
          <circle cx="238" cy="186" r="5" fill="white" />
          {nose}{surprisedMouth}
        </g>
      );

    case "exp-shocked":
      return (
        <g>
          <ellipse cx="170" cy="184" rx="30" ry="34" fill="white" />
          <ellipse cx="230" cy="184" rx="30" ry="34" fill="white" />
          <ellipse cx="174" cy="190" rx="15" ry="17" fill={eyeColor} />
          <ellipse cx="234" cy="190" rx="15" ry="17" fill={eyeColor} />
          <circle cx="178" cy="186" r="6" fill="white" />
          <circle cx="238" cy="186" r="6" fill="white" />
          {nose}{laughMouth}
        </g>
      );

    case "exp-worried":
      return <g>{bigEyes(0, 3)}{nose}{frownMouth}</g>;

    /* ─── ANGRY FAMILY ─── */
    case "exp-angry":
      return <g>{angryEyes(0)}{nose}{frownMouth}</g>;

    case "exp-angry-smirk":
      return <g>{angryEyes(2)}{nose}{smirkMouth}</g>;

    case "exp-grumpy":
      return <g>{angryEyes(0)}{nose}{neutralMouth}</g>;

    case "exp-angry-teeth":
      return <g>{angryEyes(0)}{nose}{grittingMouth}</g>;

    /* ─── SLEEPY / BORED ─── */
    case "exp-sleepy":
      return <g>{sleepyEyes(0)}{nose}{smileMouth}</g>;

    case "exp-bored":
      return <g>{sleepyEyes(0)}{nose}{neutralMouth}</g>;

    case "exp-sleepy-tongue":
      return <g>{sleepyEyes(0)}{nose}{tongueMouth}</g>;

    case "exp-unamused":
      return <g>{sleepyEyes(2)}{nose}{frownMouth}</g>;

    /* ─── DEFAULT: Duolingo standard happy face ─── */
    default:
      return <g>{bigEyes(0, 0)}{nose}{smileMouth}</g>;
  }
}

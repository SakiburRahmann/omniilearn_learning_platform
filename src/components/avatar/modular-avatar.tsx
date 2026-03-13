"use client";

/**
 * High-fidelity modular avatar renderer — Duolingo-grade.
 * "Expression" is a preset that controls eyes, eyebrows, nose, and mouth together.
 * Eye color is independent and applied to the iris of every expression.
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

  return (
    <div className={className} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {showBackground && <rect width="400" height="400" fill={c.background} />}

        {/* Body / Clothing */}
        <BodyLayer bodyShape={c.bodyShape} clothingColor={c.clothingColor} />

        {/* Neck */}
        <rect x="172" y="232" width="56" height="32" fill={c.skinColor} />

        {/* Head — rounded square like Duolingo */}
        <rect x="130" y="118" width="140" height="138" rx="36" fill={c.skinColor} />

        {/* Ears — small rounded */}
        <ellipse cx="126" cy="195" rx="14" ry="18" fill={c.skinColor} />
        <ellipse cx="274" cy="195" rx="14" ry="18" fill={c.skinColor} />

        {/* Hair */}
        <HairLayer hairStyle={c.hairStyle} hairColor={c.hairColor} />

        {/* Face (expression preset = eyes + eyebrows + nose + mouth) */}
        <ExpressionLayer expression={c.expression} eyeColor={c.eyeColor} skinColor={c.skinColor} />
      </svg>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   BODY SHAPES
   ══════════════════════════════════════════════════════ */

function BodyLayer({ bodyShape, clothingColor }: { bodyShape: string; clothingColor: string }) {
  const collar = (x1: number, x2: number) => (
    <path d={`M${x1} 260 L200 290 L${400 - x1} 260`} stroke={clothingColor} strokeWidth="8" fill={clothingColor} />
  );

  switch (bodyShape) {
    case "body-slim":
      return <g><path d="M155 265 C155 280,160 320,140 400 L260 400 C240 320,245 280,245 265 Z" fill={clothingColor} />{collar(170, 230)}</g>;
    case "body-athletic":
      return <g><path d="M140 265 C130 290,125 340,120 400 L280 400 C275 340,270 290,260 265 Z" fill={clothingColor} />{collar(165, 235)}</g>;
    case "body-wide":
      return <g><path d="M130 265 C115 300,100 350,95 400 L305 400 C300 350,285 300,270 265 Z" fill={clothingColor} />{collar(162, 238)}</g>;
    case "body-tall":
      return <g><path d="M150 265 C145 300,140 350,135 400 L265 400 C260 350,255 300,250 265 Z" fill={clothingColor} />{collar(168, 232)}</g>;
    case "body-stocky":
      return <g><path d="M135 265 C120 290,108 335,105 400 L295 400 C292 335,280 290,265 265 Z" fill={clothingColor} />{collar(160, 240)}</g>;
    default:
      return <g><path d="M145 265 C135 295,128 345,125 400 L275 400 C272 345,265 295,255 265 Z" fill={clothingColor} />{collar(165, 235)}</g>;
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
      return <path d="M134 175 C134 130,160 110,200 110 C240 110,266 130,266 175" fill={hairColor} />;
    case "hair-short-sides":
      return (
        <g>
          <path d="M130 175 C130 125,157 100,200 100 C243 100,270 125,270 175" fill={hairColor} />
          <rect x="118" y="155" width="16" height="48" rx="8" fill={hairColor} />
          <rect x="266" y="155" width="16" height="48" rx="8" fill={hairColor} />
        </g>
      );
    case "hair-wavy":
      return (
        <g>
          <path d="M120 185 C120 120,152 90,200 90 C248 90,280 120,280 185" fill={hairColor} />
          <path d="M120 185 C117 210,120 240,132 250 L132 185 Z" fill={hairColor} />
          <path d="M280 185 C283 210,280 240,268 250 L268 185 Z" fill={hairColor} />
        </g>
      );
    case "hair-long":
      return (
        <g>
          <path d="M117 185 C117 115,152 85,200 85 C248 85,283 115,283 185" fill={hairColor} />
          <path d="M117 185 C112 230,117 300,137 340 L137 185 Z" fill={hairColor} />
          <path d="M283 185 C288 230,283 300,263 340 L263 185 Z" fill={hairColor} />
        </g>
      );
    case "hair-curly":
      return (
        <g>
          <path d="M122 180 C122 115,154 88,200 88 C246 88,278 115,278 180" fill={hairColor} />
          <circle cx="137" cy="115" r="17" fill={hairColor} />
          <circle cx="167" cy="100" r="17" fill={hairColor} />
          <circle cx="200" cy="92" r="19" fill={hairColor} />
          <circle cx="233" cy="100" r="17" fill={hairColor} />
          <circle cx="263" cy="115" r="17" fill={hairColor} />
        </g>
      );
    default:
      return (
        <g>
          <path d="M130 175 C130 125,157 100,200 100 C243 100,270 125,270 175" fill={hairColor} />
          <rect x="118" y="155" width="16" height="48" rx="8" fill={hairColor} />
          <rect x="266" y="155" width="16" height="48" rx="8" fill={hairColor} />
        </g>
      );
  }
}

/* ══════════════════════════════════════════════════════
   EXPRESSION PRESETS
   Each expression draws the complete face:
   Eyes (sclera + iris + pupil + highlight) + Eyebrows + Nose + Mouth
   ══════════════════════════════════════════════════════ */

function ExpressionLayer({
  expression,
  eyeColor,
  skinColor,
}: {
  expression: string;
  eyeColor: string;
  skinColor: string;
}) {
  /* ── Reusable helpers ── */
  const nose = (
    <g>
      <ellipse cx="200" cy="220" rx="7" ry="5" fill={skinColor} />
      <path d="M193 224 C197 229,203 229,207 224" stroke="#00000018" strokeWidth="2" strokeLinecap="round" fill="none" />
    </g>
  );

  /** Standard Duolingo eyes with iris looking in given direction */
  const stdEyes = (irisOffX = 0, irisOffY = 2) => (
    <g>
      <ellipse cx="172" cy="192" rx="20" ry="22" fill="white" />
      <ellipse cx="228" cy="192" rx="20" ry="22" fill="white" />
      <circle cx={174 + irisOffX} cy={194 + irisOffY} r="11" fill={eyeColor} />
      <circle cx={230 + irisOffX} cy={194 + irisOffY} r="11" fill={eyeColor} />
      <circle cx={176 + irisOffX} cy={192 + irisOffY} r="5" fill="#000" />
      <circle cx={232 + irisOffX} cy={192 + irisOffY} r="5" fill="#000" />
      <circle cx={179 + irisOffX} cy={189 + irisOffY} r="3" fill="white" />
      <circle cx={235 + irisOffX} cy={189 + irisOffY} r="3" fill="white" />
    </g>
  );

  /** Half-lidded / sleepy eyes */
  const sleepyEyes = (irisOffX = 0) => (
    <g>
      <ellipse cx="172" cy="192" rx="20" ry="22" fill="white" />
      <ellipse cx="228" cy="192" rx="20" ry="22" fill="white" />
      {/* Eyelid covers top half */}
      <rect x="150" y="168" width="44" height="18" rx="4" fill={skinColor} />
      <rect x="206" y="168" width="44" height="18" rx="4" fill={skinColor} />
      <circle cx={174 + irisOffX} cy="198" r="10" fill={eyeColor} />
      <circle cx={230 + irisOffX} cy="198" r="10" fill={eyeColor} />
      <circle cx={176 + irisOffX} cy="196" r="5" fill="#000" />
      <circle cx={232 + irisOffX} cy="196" r="5" fill="#000" />
    </g>
  );

  /** Angry / furrowed eyes */
  const angryEyes = (irisOffX = 0) => (
    <g>
      <ellipse cx="172" cy="192" rx="20" ry="20" fill="white" />
      <ellipse cx="228" cy="192" rx="20" ry="20" fill="white" />
      {/* Angry eyelids — angled down toward center */}
      <path d="M152 176 L192 184 L192 172 Z" fill={skinColor} />
      <path d="M248 176 L208 184 L208 172 Z" fill={skinColor} />
      <circle cx={174 + irisOffX} cy="196" r="10" fill={eyeColor} />
      <circle cx={230 + irisOffX} cy="196" r="10" fill={eyeColor} />
      <circle cx={176 + irisOffX} cy="194" r="5" fill="#000" />
      <circle cx={232 + irisOffX} cy="194" r="5" fill="#000" />
      <circle cx={179 + irisOffX} cy="191" r="3" fill="white" />
      <circle cx={235 + irisOffX} cy="191" r="3" fill="white" />
    </g>
  );

  /* Smile mouth */
  const smileMouth = <path d="M183 240 C193 252,207 252,217 240" stroke="#3C2415" strokeWidth="3" strokeLinecap="round" fill="none" />;

  /* Open-mouth happy */
  const openHappyMouth = (
    <g>
      <ellipse cx="200" cy="244" rx="14" ry="11" fill="#5C1A0A" />
      <path d="M186 242 C194 252,206 252,214 242" fill="#E85D5D" />
    </g>
  );

  /* Wide laugh */
  const laughMouth = (
    <g>
      <path d="M178 236 C190 260,210 260,222 236 Z" fill="#5C1A0A" />
      <path d="M178 236 C190 244,210 244,222 236" fill="white" />
      <path d="M185 250 C193 258,207 258,215 250" fill="#E85D5D" />
    </g>
  );

  /* Small 'o' surprised mouth */
  const surprisedMouth = <ellipse cx="200" cy="246" rx="8" ry="10" fill="#5C1A0A" />;

  /* Frown */
  const frownMouth = <path d="M183 248 C193 238,207 238,217 248" stroke="#3C2415" strokeWidth="3" strokeLinecap="round" fill="none" />;

  /* Neutral line */
  const neutralMouth = <path d="M185 244 L215 244" stroke="#3C2415" strokeWidth="3" strokeLinecap="round" />;

  /* Smirk (one-sided smile) */
  const smirkMouth = <path d="M188 242 C198 250,210 248,218 240" stroke="#3C2415" strokeWidth="3" strokeLinecap="round" fill="none" />;

  /* Tongue out */
  const tongueOutMouth = (
    <g>
      <ellipse cx="200" cy="244" rx="14" ry="11" fill="#5C1A0A" />
      <ellipse cx="200" cy="252" rx="8" ry="7" fill="#E85D5D" />
    </g>
  );

  /* Gritting teeth */
  const grittingMouth = (
    <g>
      <rect x="183" y="237" width="34" height="16" rx="6" fill="#5C1A0A" />
      <rect x="186" y="240" width="28" height="5" rx="2" fill="white" />
    </g>
  );

  /* Eyebrows: neutral, raised, furrowed */
  const eyebrowNeutral = (
    <g>
      <rect x="156" y="168" width="28" height="5" rx="2.5" fill="#3C2415" />
      <rect x="216" y="168" width="28" height="5" rx="2.5" fill="#3C2415" />
    </g>
  );

  const eyebrowRaised = (
    <g>
      <rect x="156" y="162" width="28" height="5" rx="2.5" fill="#3C2415" transform="rotate(-5 170 164)" />
      <rect x="216" y="162" width="28" height="5" rx="2.5" fill="#3C2415" transform="rotate(5 230 164)" />
    </g>
  );

  const eyebrowFurrowed = (
    <g>
      <rect x="156" y="170" width="28" height="5" rx="2.5" fill="#3C2415" transform="rotate(8 170 172)" />
      <rect x="216" y="170" width="28" height="5" rx="2.5" fill="#3C2415" transform="rotate(-8 230 172)" />
    </g>
  );

  const eyebrowWorried = (
    <g>
      <rect x="156" y="165" width="28" height="5" rx="2.5" fill="#3C2415" transform="rotate(-10 170 167)" />
      <rect x="216" y="165" width="28" height="5" rx="2.5" fill="#3C2415" transform="rotate(10 230 167)" />
    </g>
  );

  switch (expression) {
    /* ─── HAPPY FAMILY ─── */
    case "exp-happy-left":
      return <g>{stdEyes(-4, 0)}{eyebrowNeutral}{nose}{smileMouth}</g>;

    case "exp-happy-right":
      return <g>{stdEyes(4, 0)}{eyebrowNeutral}{nose}{smileMouth}</g>;

    case "exp-laugh":
      return <g>{stdEyes(0, 0)}{eyebrowRaised}{nose}{laughMouth}</g>;

    case "exp-tongue":
      return <g>{stdEyes(0, 0)}{eyebrowRaised}{nose}{tongueOutMouth}</g>;

    case "exp-open-smile":
      return <g>{stdEyes(0, 0)}{eyebrowNeutral}{nose}{openHappyMouth}</g>;

    case "exp-smirk":
      return <g>{stdEyes(4, 0)}{eyebrowNeutral}{nose}{smirkMouth}</g>;

    /* ─── SURPRISED / EXCITED ─── */
    case "exp-surprised":
      return <g>{stdEyes(0, -2)}{eyebrowRaised}{nose}{surprisedMouth}</g>;

    case "exp-shocked":
      return (
        <g>
          {/* Extra-wide eyes */}
          <ellipse cx="172" cy="190" rx="24" ry="26" fill="white" />
          <ellipse cx="228" cy="190" rx="24" ry="26" fill="white" />
          <circle cx="174" cy="194" r="12" fill={eyeColor} />
          <circle cx="230" cy="194" r="12" fill={eyeColor} />
          <circle cx="176" cy="192" r="6" fill="#000" />
          <circle cx="232" cy="192" r="6" fill="#000" />
          <circle cx="180" cy="188" r="4" fill="white" />
          <circle cx="236" cy="188" r="4" fill="white" />
          {eyebrowRaised}{nose}
          {laughMouth}
        </g>
      );

    case "exp-worried":
      return <g>{stdEyes(0, 2)}{eyebrowWorried}{nose}{frownMouth}</g>;

    /* ─── ANGRY FAMILY ─── */
    case "exp-angry":
      return <g>{angryEyes(0)}{nose}{frownMouth}</g>;

    case "exp-angry-smirk":
      return <g>{angryEyes(2)}{nose}{smirkMouth}</g>;

    case "exp-grumpy":
      return <g>{angryEyes(0)}{nose}{neutralMouth}</g>;

    case "exp-angry-teeth":
      return <g>{angryEyes(0)}{nose}{grittingMouth}</g>;

    /* ─── SLEEPY / BORED FAMILY ─── */
    case "exp-sleepy":
      return <g>{sleepyEyes(0)}{nose}{smileMouth}</g>;

    case "exp-bored":
      return <g>{sleepyEyes(0)}{nose}{neutralMouth}</g>;

    case "exp-sleepy-tongue":
      return <g>{sleepyEyes(0)}{nose}{tongueOutMouth}</g>;

    case "exp-unamused":
      return <g>{sleepyEyes(2)}{nose}{frownMouth}</g>;

    /* ─── DEFAULT ─── */
    default:
      return <g>{stdEyes(0, 2)}{eyebrowNeutral}{nose}{smileMouth}</g>;
  }
}

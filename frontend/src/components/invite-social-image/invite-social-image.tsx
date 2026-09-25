import type { InviteSitePalette } from "@/lib/invite-site-types";
import type { TemplateKind } from "@/lib/invite-templates";

export const socialImageFonts = {
  serif: { file: "cormorant-garamond.ttf", weight: 500 },
  script: { file: "great-vibes.ttf", weight: 400 },
  condensed: { file: "oswald.ttf", weight: 500 },
  slavic: { file: "ponomar.ttf", weight: 400 },
} as const;

type Font = keyof typeof socialImageFonts;

export const socialImageStyles: Record<TemplateKind, { font: Font; size: number }> = {
  alpine: { font: "serif", size: 104 },
  aqua: { font: "serif", size: 108 },
  silk: { font: "script", size: 112 },
  clarity: { font: "condensed", size: 90 },
  electric: { font: "condensed", size: 100 },
  minimal: { font: "serif", size: 104 },
  chrome: { font: "serif", size: 108 },
  editorial: { font: "serif", size: 106 },
  crimson: { font: "serif", size: 106 },
  velvet: { font: "script", size: 112 },
  memoir: { font: "serif", size: 100 },
  chapter: { font: "serif", size: 102 },
  scribble: { font: "script", size: 112 },
  manor: { font: "serif", size: 104 },
  skazka: { font: "slavic", size: 86 },
  petal: { font: "serif", size: 104 },
  voyage: { font: "serif", size: 102 },
};

function renderDecoration({
  kind,
  palette: p,
}: {
  kind: TemplateKind;
  palette: InviteSitePalette;
}) {
  const paper = <rect x="52" y="44" width="1096" height="542" rx="4" fill={p.surface} />;
  const heart = "M0 18 C-65 -24 -38 -62 0 -28 C38 -62 65 -24 0 18Z";

  switch (kind) {
    case "alpine":
      return (
        <g>
          <rect width="1200" height="630" fill={p.surface} />
          <path d="M0 580L155 405L265 510L395 440L575 630H0Z" fill={p.accent} opacity="0.18" />
          <path d="M1200 630L1060 422L905 558L825 490L675 630Z" fill={p.accent} opacity="0.25" />
          <circle cx="574" cy="135" r="34" fill="none" stroke={p.accent} strokeWidth="5" />
          <circle cx="626" cy="135" r="34" fill="none" stroke={p.accent} strokeWidth="5" />
        </g>
      );
    case "aqua":
      return (
        <g>
          <path
            d="M0 0H1200V140C870 270 760 -50 440 105S95 240 0 170Z"
            fill={p.accent}
            opacity="0.3"
          />
          <path
            d="M0 530C350 380 520 705 850 520S1100 520 1200 440V630H0Z"
            fill={p.accent}
            opacity="0.45"
          />
          <path
            d="M0 555C350 405 520 730 850 545S1100 545 1200 465"
            fill="none"
            stroke={p.surface}
            strokeWidth="3"
          />
          <rect x="75" y="70" width="1050" height="490" rx="90" fill={p.surface} opacity="0.85" />
        </g>
      );
    case "silk":
      return (
        <g>
          {[0, 1, 2, 3].map((i) => (
            <path
              key={i}
              d={`M${-240 + i * 100} 0Q${150 + i * 100} 315 ${-100 + i * 100} 630M${1040 + i * 100} 0Q${750 + i * 100} 315 ${1140 + i * 100} 630`}
              fill="none"
              stroke={p.accent}
              strokeWidth="42"
              opacity="0.14"
            />
          ))}
          <ellipse cx="600" cy="315" rx="475" ry="238" fill={p.surface} />
          <ellipse
            cx="600"
            cy="315"
            rx="455"
            ry="219"
            fill="none"
            stroke={p.line}
            strokeWidth="2"
          />
        </g>
      );
    case "clarity":
      return (
        <g>
          <rect x="0" y="0" width="1200" height="630" fill={p.surface} />
          <rect width="24" height="630" fill={p.accent} />
          <rect x="1176" width="24" height="630" fill={p.accent} />
          <path d="M100 130H1100M100 500H1100" stroke={p.ink} strokeWidth="2" />
          <circle cx="600" cy="130" r="9" fill={p.accent} />
        </g>
      );
    case "electric":
      return (
        <g>
          <path
            d="M80 20L112 96L195 62L155 142L232 180L145 190L153 278L95 212L28 270L50 184L-35 160L50 128Z"
            fill={p.accent}
          />
          <path
            d="M1080 340L1112 416L1195 382L1155 462L1232 500L1145 510L1153 598L1095 532L1028 590L1050 504L965 480L1050 448Z"
            fill={p.accent}
          />
          <rect
            x="98"
            y="137"
            width="1010"
            height="376"
            fill={p.ink}
            transform="rotate(-3 600 315)"
          />
          <rect
            x="80"
            y="118"
            width="1010"
            height="376"
            fill={p.surface}
            stroke={p.ink}
            strokeWidth="3"
            transform="rotate(-3 600 315)"
          />
        </g>
      );
    case "minimal":
      return (
        <g>
          <rect
            x="83"
            y="67"
            width="1040"
            height="510"
            fill={p.line}
            transform="rotate(3 600 315)"
          />
          <rect
            x="75"
            y="55"
            width="1040"
            height="510"
            fill={p.surface}
            transform="rotate(-2 600 315)"
          />
          <path d="M545 141H655M545 491H655" stroke={p.accent} strokeWidth="2" />
        </g>
      );
    case "chrome":
      return (
        <g>
          <defs>
            <linearGradient id="metal">
              <stop stopColor={p.ink} />
              <stop offset="0.3" stopColor={p.surface} />
              <stop offset="0.5" stopColor={p.accent} />
              <stop offset="0.72" stopColor={p.surface} />
              <stop offset="1" stopColor={p.ink} />
            </linearGradient>
          </defs>
          <rect x="28" y="28" width="1144" height="574" rx="100" fill="url(#metal)" />
          <rect x="47" y="47" width="1106" height="536" rx="86" fill={p.surface} />
          <path
            d="M600 78L611 113L646 124L611 135L600 170L589 135L554 124L589 113Z"
            fill="url(#metal)"
          />
        </g>
      );
    case "editorial":
      return (
        <g>
          {paper}
          <path
            d="M80 75H1120V555H80ZM102 97H1098V533H102Z"
            fill="none"
            stroke={p.ink}
            strokeWidth="1"
          />
          <rect x="550" y="88" width="100" height="18" fill={p.accent} />
          <path d="M550 525H650" stroke={p.accent} strokeWidth="5" />
        </g>
      );
    case "crimson":
      return (
        <g>
          {paper}
          <path d="M78 110H1122M78 520H1122" stroke={p.accent} strokeWidth="2" />
          <path d={heart} transform="translate(600 140) scale(0.65)" fill={p.accent} />
          <path d="M95 55V575M1105 55V575" stroke={p.accent} strokeWidth="1" />
        </g>
      );
    case "velvet":
      return (
        <g>
          <path
            d="M90 60H1110V235C1040 235 1040 395 1110 395V570H90V395C160 395 160 235 90 235Z"
            fill={p.surface}
          />
          <path
            d="M170 90H1030V540H170Z"
            fill="none"
            stroke={p.accent}
            strokeWidth="2"
            strokeDasharray="3 8"
          />
          <path
            d="M555 127Q495 55 490 113Q496 162 600 134Q704 162 710 113Q705 55 645 127M600 134Q568 166 570 188M600 134Q632 166 630 188"
            fill="none"
            stroke={p.accent}
            strokeWidth="3"
          />
        </g>
      );
    case "memoir":
      return (
        <g>
          <rect x="55" y="40" width="1090" height="550" fill={p.ink} />
          <rect x="98" y="85" width="1004" height="460" fill={p.surface} />
          {Array.from({ length: 17 }, (_, i) => (
            <g key={i}>
              <rect x={80 + i * 64} y="53" width="28" height="17" rx="3" fill={p.background} />
              <rect x={80 + i * 64} y="560" width="28" height="17" rx="3" fill={p.background} />
            </g>
          ))}
          <path d="M530 125H670M530 505H670" stroke={p.accent} strokeWidth="2" />
        </g>
      );
    case "chapter":
      return (
        <g>
          {paper}
          <path d="M160 44V586M1040 44V586" stroke={p.line} strokeWidth="2" strokeDasharray="7 8" />
          {[160, 1040].map((x) => (
            <g key={x}>
              <circle cx={x} cy="44" r="24" fill={p.background} />
              <circle cx={x} cy="586" r="24" fill={p.background} />
            </g>
          ))}
          <path
            d="M545 125Q575 110 600 125Q625 110 655 125V165Q625 150 600 165Q575 150 545 165ZM600 125V165"
            fill="none"
            stroke={p.accent}
            strokeWidth="2"
          />
        </g>
      );
    case "scribble":
      return (
        <g>
          {paper}
          <path
            d="M89 85Q280 67 460 83T830 78T1115 85L1108 553Q880 568 660 550T300 556L86 548Z"
            fill="none"
            stroke={p.accent}
            strokeWidth="3"
          />
          <path
            d={heart}
            transform="translate(170 157) rotate(-18)"
            fill="none"
            stroke={p.accent}
            strokeWidth="3"
          />
          <path
            d={heart}
            transform="translate(1030 490) rotate(15)"
            fill="none"
            stroke={p.accent}
            strokeWidth="3"
          />
          <path
            d="M430 484Q575 470 770 486M455 498Q580 485 744 499"
            fill="none"
            stroke={p.accent}
            strokeWidth="2"
          />
        </g>
      );
    case "manor":
      return (
        <g>
          {Array.from({ length: 40 }, (_, i) => (
            <rect key={i} x={i * 30} width="12" height="630" fill={p.accent} opacity="0.65" />
          ))}
          <rect
            x="67"
            y="43"
            width="1066"
            height="544"
            fill={p.surface}
            stroke={p.ink}
            strokeWidth="2"
          />
          <rect
            x="82"
            y="58"
            width="1036"
            height="514"
            fill="none"
            stroke={p.line}
            strokeWidth="2"
          />
          <path
            d="M600 135C465 48 470 190 600 135C730 48 735 190 600 135M600 135L566 188M600 135L634 188"
            fill="none"
            stroke={p.accent}
            strokeWidth="3"
          />
        </g>
      );
    case "skazka":
      return (
        <g>
          {paper}
          {[90, 540].map((y) => (
            <g key={y}>
              {Array.from({ length: 16 }, (_, i) => (
                <g key={i} transform={`translate(${105 + i * 66} ${y})`}>
                  <path d="M0 -19L19 0L0 19L-19 0Z" fill={p.accent} />
                  <circle r="5" fill={p.surface} />
                  <path d="M27 -9L36 0L27 9L18 0Z" fill={p.ink} />
                </g>
              ))}
            </g>
          ))}
          <path d="M83 139V491M1117 139V491" stroke={p.accent} strokeWidth="3" />
        </g>
      );
    case "petal":
      return (
        <g>
          <rect width="1200" height="630" fill={p.surface} />
          {[
            [100, 110],
            [1100, 520],
            [1110, 80],
            [70, 560],
          ].map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${i * 22})`}>
              {Array.from({ length: 8 }, (_, n) => (
                <ellipse
                  key={n}
                  cy="-75"
                  rx="39"
                  ry="80"
                  transform={`rotate(${n * 45})`}
                  fill={i % 2 ? p.background : p.accent}
                />
              ))}
              <circle r="34" fill={p.ink} />
              <circle r="22" fill={p.surface} />
            </g>
          ))}
        </g>
      );
    case "voyage":
      return (
        <g>
          {paper}
          <path d="M90 85H1110V545H90Z" fill="none" stroke={p.ink} strokeWidth="2" />
          <path
            d="M70 475Q145 360 155 215T370 110M830 520Q1080 560 1040 405T1140 165"
            fill="none"
            stroke={p.accent}
            strokeWidth="2"
            strokeDasharray="6 8"
          />
          <path
            d="M580 120L620 120L650 142L620 137L614 153L603 153L603 135L580 130Z"
            fill={p.accent}
          />
          {Array.from({ length: 24 }, (_, i) => (
            <g key={i}>
              <circle cx={76 + i * 46} cy="44" r="5" fill={p.background} />
              <circle cx={76 + i * 46} cy="586" r="5" fill={p.background} />
            </g>
          ))}
        </g>
      );
  }
}

export function InviteSocialImage({
  kind,
  palette,
}: {
  kind: TemplateKind;
  palette: InviteSitePalette;
}) {
  const style = socialImageStyles[kind];

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        position: "relative",
        backgroundColor: palette.background,
        color: palette.ink,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        width="1200"
        height="630"
        viewBox="0 0 1200 630"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {renderDecoration({ kind, palette })}
      </svg>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: 960,
          height: 290,
          fontFamily: style.font,
          fontSize: style.size,
          lineHeight: 1.18,
          fontWeight: socialImageFonts[style.font].weight,
          transform: kind === "electric" ? "rotate(-3deg)" : "rotate(0deg)",
        }}
      >
        <div style={{ display: "flex" }}>Приглашение</div>
        <div style={{ display: "flex" }}>на свадьбу</div>
      </div>
    </div>
  );
}

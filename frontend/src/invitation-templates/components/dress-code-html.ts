import {
  createSectionEyebrowHtml,
  createSectionEyebrowStyles,
} from "./section-eyebrow-html";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function createDressCodeBlockStyles() {
  return `
    ${createSectionEyebrowStyles()}
    .dress-code {
      --dress-accent: var(--invite-accent, #c89d60);
      --dress-ink: var(--invite-ink, #34342f);
      --dress-muted: var(--invite-muted, #7d7d74);
      --dress-line: var(--invite-line, rgba(200,157,96,.28));
      --dress-surface: var(--invite-surface, #fffaf2);
      --dress-veil: var(--invite-veil, rgba(255,250,242,.84));
      --dress-radius: 34px;
      display: grid;
      width: min(100%, 680px);
      justify-items: center;
      gap: 18px;
      margin: 0 auto;
      border: 1px solid color-mix(in srgb, var(--dress-line) 70%, transparent);
      border-radius: var(--dress-radius);
      background:
        radial-gradient(circle at 18% 0%, color-mix(in srgb, var(--dress-surface) 80%, transparent), transparent 34%),
        linear-gradient(180deg, color-mix(in srgb, var(--dress-surface) 92%, transparent), var(--dress-veil));
      padding: clamp(34px, 7vw, 70px) clamp(18px, 6vw, 58px);
      color: var(--dress-ink);
      text-align: center;
      box-shadow: 0 22px 70px color-mix(in srgb, var(--dress-ink) 10%, transparent);
    }
    .dress-code--vanilla {
      --dress-accent: var(--orange, #f47a23);
      --dress-ink: var(--ink, #49434d);
      --dress-muted: var(--muted, #8f8790);
      --dress-line: var(--pink, #ef8bbb);
      --dress-surface: var(--paper, #f7f8f5);
      --dress-veil: var(--veil, rgba(249,228,238,.9));
      --dress-radius: clamp(34px, 6vw, 58px);
    }
    .dress-code--alpine { --dress-radius: 220px 220px 14px 14px; }
    .dress-code__title { margin: 0; color: var(--dress-accent); font-family: Georgia, "Times New Roman", serif; font-size: clamp(40px, 7vw, 64px); font-weight: 400; letter-spacing: -.035em; line-height: 1; }
    .dress-code--vanilla .dress-code__title { text-transform: uppercase; }
    .dress-code--alpine .dress-code__title { color: var(--dress-ink); }
    .dress-code__text { width: min(100%, 560px); margin: 0; color: var(--dress-muted); font-size: clamp(15px, 2.2vw, 18px); font-weight: 300; line-height: 1.65; }
    .dress-code__swatches { display: flex; flex-wrap: wrap; justify-content: center; gap: clamp(10px, 2.5vw, 18px); margin: 8px 0 0; padding: 0; list-style: none; }
    .dress-code__swatch-item { display: grid; justify-items: center; gap: 8px; min-width: 54px; }
    .dress-code__swatch { display: block; width: clamp(46px, 8vw, 72px); aspect-ratio: 1; border: 1px solid color-mix(in srgb, var(--dress-ink) 16%, transparent); border-radius: 50%; box-shadow: inset 0 0 0 6px color-mix(in srgb, var(--dress-surface) 32%, transparent), 0 14px 30px color-mix(in srgb, var(--dress-ink) 12%, transparent); }
    .dress-code--vanilla .dress-code__swatch { border-radius: 999px; }
    .dress-code--alpine .dress-code__swatch { border-radius: 50% 50% 8px 8px; }
    .dress-code__swatch-label { color: var(--dress-muted); font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
    @media (max-width: 560px) {
      .dress-code { gap: 15px; padding: 34px 16px; }
      .dress-code--alpine { --dress-radius: 120px 120px 12px 12px; }
      .dress-code__swatch-label { display: none; }
    }
  `;
}

export function createDressCodeBlockHtml({
  colors,
  text,
  variant,
}: {
  colors: string[];
  text: string;
  variant: "alpine" | "vanilla";
}) {
  const variantClass = variant === "vanilla" ? "dress-code--vanilla" : "dress-code--alpine";

  return `<div class="dress-code ${variantClass}">
    ${createSectionEyebrowHtml("Dress code")}
    <h2 class="dress-code__title">Дресс-код</h2>
    <p class="dress-code__text">${escapeHtml(text)}</p>
    <ul class="dress-code__swatches" aria-label="Цвета дресс-кода">
      ${colors
        .map(
          (color, index) =>
            `<li class="dress-code__swatch-item"><span class="dress-code__swatch" style="background-color: ${escapeHtml(color)}" title="${escapeHtml(color)}"></span><span class="dress-code__swatch-label">Цвет ${index + 1}</span></li>`,
        )
        .join("")}
    </ul>
  </div>`;
}

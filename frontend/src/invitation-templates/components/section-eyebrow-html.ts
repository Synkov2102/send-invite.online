function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function createSectionEyebrowStyles() {
  return `
    .invite-section-eyebrow {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      color: var(--invite-accent);
      font-size: 11px;
      font-weight: 750;
      letter-spacing: 0.2em;
      text-transform: uppercase;
    }
    .invite-section-eyebrow strong { font-weight: 750; }
    .invite-section-eyebrow span {
      width: 28px;
      height: 1px;
      background: currentColor;
      opacity: 0.45;
    }
  `;
}

export function createSectionEyebrowHtml(label: string) {
  return `<div class="invite-section-eyebrow"><span aria-hidden="true"></span><strong>${escapeHtml(label)}</strong><span aria-hidden="true"></span></div>`;
}

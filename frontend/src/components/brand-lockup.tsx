import type { CSSProperties } from "react";
import { brand } from "@/lib/brand";

type BrandLockupProps = {
  showDomain?: boolean;
  /**
   * Visually-hidden text appended after the wordmark so the link's
   * accessible name stays a superset of what's actually on screen
   * (WCAG 2.5.3) — the "send"/"invite" spans render with no space between
   * them for the tight logo kerning, so an aria-label alone would mismatch.
   */
  homeLabelSuffix?: string;
};

const visuallyHiddenStyle: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

export default function BrandLockup({ showDomain = false, homeLabelSuffix }: BrandLockupProps) {
  return (
    <span className="brand-lockup">
      <span className="brand-lockup__mark" aria-hidden>
        <svg className="brand-mark" viewBox="0 0 48 48">
          <path className="brand-mark__ribbon" d="M35 14c-3.2-3-7.8-4.8-12.5-4.8C15 9.2 9.5 13 9.5 18.4c0 10 22.6 3.7 22.6 13.4 0 4.2-4.2 7-9.6 7-5 0-9.7-1.8-13-5" />
          <path className="brand-mark__stem" d="M36.7 20.5v18.2" />
          <circle className="brand-mark__dot" cx="36.7" cy="10.3" r="3.2" />
        </svg>
      </span>
      <span className="brand-lockup__wordmark">
        <span className="brand-lockup__name">
          <span className="brand-lockup__send">send</span>
          <span className="brand-lockup__invite">invite</span>
        </span>
        {showDomain ? <small>{brand.domain}</small> : null}
      </span>
      {homeLabelSuffix ? <span style={visuallyHiddenStyle}>{homeLabelSuffix}</span> : null}
    </span>
  );
}

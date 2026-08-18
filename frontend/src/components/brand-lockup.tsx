import type { CSSProperties } from "react";
import Image from "next/image";
import { brand } from "@/lib/brand";

type BrandLockupProps = {
  imageLogo?: boolean;
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

export default function BrandLockup({
  imageLogo = false,
  showDomain = false,
  homeLabelSuffix,
}: BrandLockupProps) {
  if (imageLogo) {
    return (
      <span className="brand-lockup brand-lockup--image">
        <Image
          alt={brand.name}
          className="brand-lockup__image"
          height={360}
          loading="eager"
          sizes="(max-width: 480px) 195px, (max-width: 899px) 220px, 280px"
          src="/images/brand/send-invite-header-logo-v2.webp"
          width={1894}
        />
        {homeLabelSuffix ? <span style={visuallyHiddenStyle}>{homeLabelSuffix}</span> : null}
      </span>
    );
  }

  return (
    <span className="brand-lockup">
      <span className="brand-lockup__mark" aria-hidden>
        <Image
          alt=""
          className="brand-mark"
          height={52}
          src="/images/brand/pigeon-envelope-mark.webp"
          width={52}
        />
      </span>
      <span className="brand-lockup__wordmark">
        <span className="brand-lockup__name">
          <span className="brand-lockup__send">send-invite</span>
          {showDomain ? <span className="brand-lockup__invite">.online</span> : null}
        </span>
      </span>
      {homeLabelSuffix ? <span style={visuallyHiddenStyle}>{homeLabelSuffix}</span> : null}
    </span>
  );
}

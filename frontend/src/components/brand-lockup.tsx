import { brand } from "@/lib/brand";

type BrandLockupProps = {
  showDomain?: boolean;
};

export default function BrandLockup({ showDomain = false }: BrandLockupProps) {
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
    </span>
  );
}

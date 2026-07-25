import { brand } from "@/lib/brand";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import BrandLockup from "./brand-lockup";
import SiteHeaderMobileMenu from "./site-header-mobile-menu";
import SiteHeaderUserActions, { type HeaderUser } from "./site-header-user-actions";

type SiteHeaderProps = {
  active?: "home" | "templates";
  initialUser?: HeaderUser | null;
};

export default function SiteHeader({ active, initialUser }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <Link aria-label={brand.homeAriaLabel} className="site-header__brand" href="/">
        <BrandLockup showDomain />
      </Link>

      <nav aria-label="Основная навигация" className="site-header__nav">
        <Link
          aria-current={active === "home" ? "page" : undefined}
          className={active === "home" ? "is-active" : undefined}
          href="/"
        >
          Главная
        </Link>
        <Link
          aria-current={active === "templates" ? "page" : undefined}
          className={active === "templates" ? "is-active" : undefined}
          href="/templates"
        >
          Шаблоны
        </Link>
        <Link href="/contacts">Контакты</Link>
      </nav>

      <div className="site-header__actions">
        <div className="site-header__desktop-user-actions">
          <SiteHeaderUserActions initialUser={initialUser} />
        </div>

        <SiteHeaderMobileMenu active={active} initialUser={initialUser} />

        <Link className="site-header__cta" href="/templates">
          Создать приглашение
          <ArrowUpRight aria-hidden size={14} />
        </Link>
      </div>
    </header>
  );
}

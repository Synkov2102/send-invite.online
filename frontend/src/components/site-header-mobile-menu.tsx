"use client";

import { ArrowUpRight, House, LifeBuoy, Menu, PanelsTopLeft, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import SiteHeaderUserActions, { type HeaderUser } from "./site-header-user-actions";
import SupportModal from "./support-modal";

type SiteHeaderMobileMenuProps = {
  active?: "home" | "templates";
  initialUser?: HeaderUser | null;
};

export default function SiteHeaderMobileMenu({ active, initialUser }: SiteHeaderMobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="site-header__mobile-menu">
      <button
        aria-expanded={isOpen}
        aria-label={isOpen ? "Закрыть меню" : "Открыть меню"}
        className="site-header__menu-button"
        onClick={() => setIsOpen((value) => !value)}
        type="button"
      >
        {isOpen ? <X aria-hidden size={20} /> : <Menu aria-hidden size={20} />}
      </button>

      {isOpen ? (
        <div className="site-header__mobile-panel">
          <nav aria-label="Мобильная навигация">
            <Link
              aria-current={active === "home" ? "page" : undefined}
              className={active === "home" ? "is-active" : undefined}
              href="/"
              onClick={() => setIsOpen(false)}
            >
              <House aria-hidden size={18} />
              <span><strong>Главная</strong><small>О сервисе и возможностях</small></span>
            </Link>
            <Link
              aria-current={active === "templates" ? "page" : undefined}
              className={active === "templates" ? "is-active" : undefined}
              href="/templates"
              onClick={() => setIsOpen(false)}
            >
              <PanelsTopLeft aria-hidden size={18} />
              <span><strong>Шаблоны</strong><small>Выбрать дизайн приглашения</small></span>
            </Link>
            <SupportModal onTriggerClick={() => setIsOpen(false)}>
              <LifeBuoy aria-hidden size={18} />
              <span><strong>Поддержка</strong><small>Мы на связи в ВКонтакте</small></span>
            </SupportModal>
          </nav>

          <div className="site-header__mobile-account">
            <SiteHeaderUserActions initialUser={initialUser} variant="mobile" />
          </div>

          <Link className="site-header__mobile-cta" href="/templates" onClick={() => setIsOpen(false)}>
            Создать приглашение
            <ArrowUpRight aria-hidden size={16} />
          </Link>
        </div>
      ) : null}
    </div>
  );
}

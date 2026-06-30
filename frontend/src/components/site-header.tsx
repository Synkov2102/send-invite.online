import { getCurrentUser } from "@/lib/auth";
import { ArrowUpRight, Heart, LayoutDashboard, LogIn, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type SiteHeaderProps = {
  active?: "home" | "templates";
};

export default async function SiteHeader({ active }: SiteHeaderProps) {
  const user = await getCurrentUser();

  return (
    <header className="site-header">
      <Link className="site-header__brand" href="/">
        <span className="site-header__mark">
          <Heart aria-hidden size={15} />
        </span>
        <span>Invite</span>
        <small>wedding studio</small>
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
      </nav>

      <div className="site-header__actions">
        {user ? (
          <div className="site-header__user">
            <Link className="site-header__dashboard" href="/dashboard">
              <LayoutDashboard aria-hidden size={15} />
              <span>Мои сайты</span>
            </Link>
            <Link className="site-header__profile" href="/dashboard">
              {user.avatarUrl ? (
                <Image alt="" height={32} src={user.avatarUrl} width={32} />
              ) : (
                <span>{user.name.slice(0, 1).toUpperCase()}</span>
              )}
              <strong>{user.name}</strong>
            </Link>
            <form action="/api/auth/logout" method="post">
              <button aria-label="Выйти" title="Выйти" type="submit">
                <LogOut aria-hidden size={14} />
              </button>
            </form>
          </div>
        ) : (
          <Link className="site-header__login" href="/auth">
            <LogIn aria-hidden size={14} />
            <span>Войти</span>
          </Link>
        )}

        <Link className="site-header__cta" href="/templates">
          Создать приглашение
          <ArrowUpRight aria-hidden size={14} />
        </Link>
      </div>
    </header>
  );
}

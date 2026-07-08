"use client";

import { LayoutDashboard, LogIn, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export type HeaderUser = {
  avatarUrl: string | null;
  name: string;
};

type AuthMeResponse = {
  user: HeaderUser | null;
};

type SiteHeaderUserActionsProps = {
  initialUser?: HeaderUser | null;
};

export default function SiteHeaderUserActions({
  initialUser,
}: SiteHeaderUserActionsProps) {
  const [user, setUser] = useState<HeaderUser | null>(initialUser ?? null);

  useEffect(() => {
    if (initialUser !== undefined) {
      return;
    }

    let cancelled = false;

    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
          credentials: "same-origin",
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as AuthMeResponse;

        if (!cancelled) {
          setUser(data.user);
        }
      } catch {
        // Public pages should stay fast even if the session endpoint is unavailable.
      }
    }

    void loadUser();

    return () => {
      cancelled = true;
    };
  }, [initialUser]);

  if (!user) {
    return (
      <Link className="site-header__login" href="/auth">
        <LogIn aria-hidden size={14} />
        <span>Войти</span>
      </Link>
    );
  }

  return (
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
  );
}

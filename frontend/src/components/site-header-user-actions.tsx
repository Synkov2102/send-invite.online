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
  variant?: "desktop" | "mobile";
};

// Shared by every SiteHeaderUserActions instance mounted on the page — the
// always-present desktop pill and the one inside the mobile menu, which
// remounts each time the menu opens. Without this cache each remount would
// redo its own loading flash instead of reusing the already-known session.
let cachedUser: HeaderUser | null | undefined;
let pendingSessionFetch: Promise<HeaderUser | null> | null = null;

function fetchSessionUser(): Promise<HeaderUser | null> {
  if (!pendingSessionFetch) {
    pendingSessionFetch = fetch("/api/auth/me", {
      cache: "no-store",
      credentials: "same-origin",
    })
      .then(async (response) => {
        if (!response.ok) {
          return null;
        }

        const data = (await response.json()) as AuthMeResponse;
        return data.user ?? null;
      })
      .catch(() => null)
      .finally(() => {
        pendingSessionFetch = null;
      });
  }

  return pendingSessionFetch;
}

export default function SiteHeaderUserActions({
  initialUser,
  variant = "desktop",
}: SiteHeaderUserActionsProps) {
  const [user, setUser] = useState<HeaderUser | null>(() => initialUser ?? cachedUser ?? null);
  const [isChecking, setIsChecking] = useState(
    () => initialUser === undefined && cachedUser === undefined,
  );

  useEffect(() => {
    if (initialUser !== undefined || cachedUser !== undefined) {
      return;
    }

    let cancelled = false;

    fetchSessionUser().then((resolvedUser) => {
      cachedUser = resolvedUser;

      if (!cancelled) {
        setUser(resolvedUser);
        setIsChecking(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [initialUser]);

  if (isChecking) {
    // Reserves the guest button's footprint so the CTA next to it doesn't jump
    // once the session check resolves — invisible rather than absent.
    return (
      <Link
        aria-hidden="true"
        className={variant === "mobile" ? "site-header__mobile-login" : "site-header__login"}
        href="/auth"
        style={{ visibility: "hidden" }}
        tabIndex={-1}
      >
        <LogIn aria-hidden size={14} />
        <span>Войти</span>
      </Link>
    );
  }

  if (!user) {
    return (
      <Link className={variant === "mobile" ? "site-header__mobile-login" : "site-header__login"} href="/auth">
        <LogIn aria-hidden size={14} />
        <span>Войти</span>
      </Link>
    );
  }

  if (variant === "mobile") {
    return (
      <div className="site-header__mobile-user">
        <Link className="site-header__mobile-profile" href="/dashboard">
          {user.avatarUrl ? (
            <Image alt="" height={40} src={user.avatarUrl} width={40} />
          ) : (
            <span>{user.name.slice(0, 1).toUpperCase()}</span>
          )}
          <span>
            <small>Профиль</small>
            <strong>{user.name}</strong>
          </span>
        </Link>

        <div className="site-header__mobile-user-actions">
          <Link href="/dashboard">
            <LayoutDashboard aria-hidden size={17} />
            Мои сайты
          </Link>
          <form action="/api/auth/logout" method="post">
            <button type="submit">
              <LogOut aria-hidden size={17} />
              Выйти
            </button>
          </form>
        </div>
      </div>
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

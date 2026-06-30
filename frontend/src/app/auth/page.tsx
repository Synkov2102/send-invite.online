import SiteHeader from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth";
import { ArrowRight, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Вход и регистрация",
  description: "Войдите или зарегистрируйтесь в Invite через Yandex ID.",
};

type AuthPageProps = {
  searchParams: Promise<{ error?: string | string[]; mode?: string | string[]; returnTo?: string | string[] }>;
};

const errorMessages: Record<string, string> = {
  invalid_oauth_state: "Не удалось проверить OAuth-сессию. Попробуйте войти еще раз.",
  missing_yandex_config: "Yandex ID пока не настроен на сервере.",
  yandex_auth_failed: "Yandex ID не подтвердил вход. Попробуйте еще раз.",
};

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getStartHref(mode: "login" | "register", returnTo: string | undefined) {
  const params = new URLSearchParams({ mode });

  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    params.set("returnTo", returnTo);
  }

  return `/api/auth/yandex/start?${params.toString()}`;
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const query = await searchParams;
  const user = await getCurrentUser();
  const mode = getParam(query.mode) === "register" ? "register" : "login";
  const returnTo = getParam(query.returnTo);
  const error = getParam(query.error);
  const title = mode === "register" ? "Создайте аккаунт" : "Войдите в аккаунт";

  return (
    <div className="marketing-page auth-page">
      <SiteHeader />

      <main className="auth-shell">
        <section className="auth-panel" aria-labelledby="auth-title">
          {user ? (
            <>
              <p className="marketing-eyebrow">Yandex ID подключен</p>
              <h1 id="auth-title">Вы уже вошли</h1>
              <p>
                Аккаунт {user.name} готов к работе. Можно возвращаться к шаблонам и
                продолжать создание приглашения.
              </p>
              <div className="auth-actions">
                <Link className="marketing-button marketing-button--primary" href="/templates">
                  К шаблонам
                  <ArrowRight aria-hidden size={16} />
                </Link>
                <form action="/api/auth/logout" method="post">
                  <button className="marketing-button marketing-button--ghost" type="submit">
                    Выйти
                  </button>
                </form>
              </div>
            </>
          ) : (
            <>
              <p className="marketing-eyebrow">Авторизация через Yandex ID</p>
              <h1 id="auth-title">{title}</h1>
              <p>
                Один безопасный вход без паролей в Invite. Если аккаунта еще нет, мы
                создадим его после подтверждения в Yandex ID.
              </p>

              {error ? (
                <p className="auth-error" role="alert">
                  {errorMessages[error] ?? "Не удалось завершить вход. Попробуйте еще раз."}
                </p>
              ) : null}

              <div className="auth-mode-switch" aria-label="Режим авторизации">
                <Link
                  className={mode === "login" ? "is-active" : undefined}
                  href="/auth?mode=login"
                >
                  Вход
                </Link>
                <Link
                  className={mode === "register" ? "is-active" : undefined}
                  href="/auth?mode=register"
                >
                  Регистрация
                </Link>
              </div>

              <div className="auth-actions">
                <Link
                  className="yandex-auth-button"
                  href={getStartHref(mode, returnTo)}
                >
                  {mode === "register" ? (
                    <UserPlus aria-hidden size={18} />
                  ) : (
                    <LogIn aria-hidden size={18} />
                  )}
                  <span>{mode === "register" ? "Зарегистрироваться" : "Войти"} через Яндекс</span>
                </Link>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

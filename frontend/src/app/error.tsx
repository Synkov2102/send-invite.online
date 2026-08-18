"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import CommerceFooter from "@/components/commerce-footer";
import PageShellProvider from "@/components/page-shell";
import ProductPageShell from "@/components/product-page-shell";
import SiteHeader from "@/components/site-header";
import styles from "./error.module.css";

const errorImage = {
  src: "/images/brand/error-mascot.webp",
  height: 1024,
  width: 1536,
};

type AppErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AppError({ error, reset }: AppErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ProductPageShell className="marketing-page">
      <SiteHeader />

      <PageShellProvider as="main" className={styles.page} width="narrow">
        <Image
          alt=""
          className={styles.image}
          height={errorImage.height}
          priority
          src={errorImage.src}
          width={errorImage.width}
        />

        <p className="marketing-eyebrow">Ошибка</p>
        <h1 className={styles.title}>Что-то пошло не так</h1>
        <p className={styles.text}>
          Страница временно недоступна — попробуйте обновить её через минуту.
        </p>

        <div className="auth-actions">
          <button
            className="marketing-button marketing-button--primary"
            onClick={reset}
            type="button"
          >
            Попробовать снова
          </button>
          <Link className="marketing-button marketing-button--ghost" href="/">
            На главную
          </Link>
        </div>

        {error.digest ? <p className={styles.digest}>Код ошибки: {error.digest}</p> : null}
      </PageShellProvider>

      <CommerceFooter />
    </ProductPageShell>
  );
}

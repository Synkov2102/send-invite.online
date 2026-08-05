import Link from "next/link";
import BrandLockup from "./brand-lockup";
import { brand } from "@/lib/brand";
import { formatSellerLegalName, seller } from "@/lib/commerce";

export default function CommerceFooter() {
  return (
    <footer className="commerce-footer">
      <div className="commerce-footer__brand">
        <Link href="/">
          <BrandLockup homeLabelSuffix={brand.homeAriaLabel} showDomain />
        </Link>
        <p>
          Создание и публикация сайтов-приглашений. Стоимость услуги указана на
          странице «Оплата и возврат».
        </p>
      </div>
      <nav aria-label="Разделы и правовая информация">
        <Link href="/blog">Блог</Link>
        <Link href="/offer">Публичная оферта</Link>
        <Link href="/payment-and-refund">Оплата и возврат</Link>
        <Link href="/privacy">Персональные данные</Link>
      </nav>
      <div className="commerce-footer__seller">
        <strong>{formatSellerLegalName()}</strong>
        <span>ИНН {seller.inn}</span>
        <span>г. {seller.city}</span>
        <a href={`mailto:${seller.email}`}>{seller.email}</a>
      </div>
    </footer>
  );
}

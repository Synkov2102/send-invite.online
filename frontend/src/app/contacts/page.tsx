import type { Metadata } from "next";
import LegalPage from "@/components/legal-page";
import { brand } from "@/lib/brand";
import { formatSellerLegalName, seller } from "@/lib/commerce";
import { createPageMetadata } from "@/lib/seo";
import { support } from "@/lib/support";

export const metadata: Metadata = createPageMetadata({
  title: "Контакты и реквизиты",
  description: "Контактные данные и реквизиты продавца Send Invite.",
  path: "/contacts",
});

export default function ContactsPage() {
  return (
    <LegalPage
      eyebrow="Связь с продавцом"
      lead="По вопросам оплаты, публикации и возврата денежных средств."
      title="Контакты и реквизиты"
    >
      <section>
        <h2>Контакты</h2>
        <dl>
          <div><dt>Email</dt><dd><a href={`mailto:${seller.email}`}>{seller.email}</a></dd></div>
          <div><dt>Сайт</dt><dd><a href={brand.url}>{brand.domain}</a></dd></div>
        </dl>
      </section>
      <section>
        <h2>География работы</h2>
        <p>
          Send Invite оказывает электронные услуги пользователям по всей России.
          Создание, оплата и публикация сайта-приглашения выполняются онлайн.
        </p>
      </section>
      <section>
        <h2>Реквизиты продавца</h2>
        <dl>
          <div><dt>Исполнитель</dt><dd>{formatSellerLegalName()}</dd></div>
          <div><dt>ИНН</dt><dd>{seller.inn}</dd></div>
          <div><dt>Город</dt><dd>{seller.city}</dd></div>
        </dl>
      </section>
      <section>
        <h2>Поддержка</h2>
        <p>
          Основной канал поддержки — сообщество{" "}
          <a href={support.vkGroupUrl} rel="noreferrer" target="_blank">
            ВКонтакте
          </a>
          . В обращении укажите email аккаунта, номер заказа и кратко опишите
          вопрос — так мы быстрее разберёмся. По вопросам оплаты и возврата
          также можно написать на email, указанный выше.
        </p>
      </section>
    </LegalPage>
  );
}

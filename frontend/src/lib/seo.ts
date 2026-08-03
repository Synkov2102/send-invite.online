import type { Metadata } from "next";
import { brand } from "@/lib/brand";
import {
  formatSellerLegalName,
  INVITE_SITE_PRICE,
  INVITE_SITE_SERVICE_NAME,
  seller,
} from "@/lib/commerce";

export const defaultDescription =
  "Создайте сайт-приглашение на свадьбу за 10 минут: готовые шаблоны, редактор с превью, RSVP и публикация по ссылке. Разовая оплата.";

export const defaultKeywords = [
  "сайт приглашение на свадьбу",
  "сайт-приглашение на свадьбу",
  "свадебное приглашение онлайн",
  "конструктор свадебных приглашений",
  "электронное приглашение на свадьбу",
  "RSVP свадьба",
  "send invite",
] as const;

export const privateRobots: NonNullable<Metadata["robots"]> = {
  index: false,
  follow: false,
};

export const publicSitemapRoutes = [
  { path: "/", changeFrequency: "weekly" as const, priority: 1 },
  { path: "/templates", changeFrequency: "weekly" as const, priority: 0.9 },
  { path: "/blog", changeFrequency: "weekly" as const, priority: 0.7 },
  { path: "/contacts", changeFrequency: "monthly" as const, priority: 0.5 },
  { path: "/offer", changeFrequency: "monthly" as const, priority: 0.4 },
  { path: "/payment-and-refund", changeFrequency: "monthly" as const, priority: 0.4 },
  { path: "/privacy", changeFrequency: "monthly" as const, priority: 0.4 },
] as const;

export function absoluteUrl(path: string) {
  return new URL(path, brand.url).toString();
}

export function resolveSeoImageUrl(image?: string) {
  if (!image) {
    return absoluteUrl(brand.ogImage);
  }

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  return absoluteUrl(image.startsWith("/") ? image : `/${image}`);
}

function buildSocialTitle(title?: string) {
  if (!title) {
    return `${brand.name} — ${brand.tagline}`;
  }

  return `${title} · ${brand.name}`;
}

export function createPageMetadata(options: {
  title?: string;
  description?: string;
  path: string;
  robots?: Metadata["robots"];
  images?: string[];
  type?: "website" | "article";
}): Metadata {
  const description = options.description ?? defaultDescription;
  const canonical = absoluteUrl(options.path);
  const images = (options.images?.length ? options.images : [brand.ogImage]).map(resolveSeoImageUrl);
  const socialTitle = buildSocialTitle(options.title);

  return {
    ...(options.title ? { title: options.title } : {}),
    description,
    keywords: [...defaultKeywords],
    alternates: {
      canonical,
    },
    robots: options.robots,
    openGraph: {
      type: options.type ?? "website",
      locale: brand.locale,
      url: canonical,
      siteName: brand.name,
      title: socialTitle,
      description,
      images: images.map((url) => ({
        url,
        width: 1200,
        height: 630,
        alt: socialTitle,
      })),
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images,
    },
  };
}

export function createRootMetadata(): Metadata {
  const verification: Metadata["verification"] = {};

  if (process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION) {
    verification.google = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
  }

  if (process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION) {
    verification.yandex = process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION;
  }

  return {
    metadataBase: new URL(brand.url),
    title: {
      default: `Сайт-приглашение на свадьбу онлайн · ${brand.name}`,
      template: `%s · ${brand.name}`,
    },
    description: defaultDescription,
    keywords: [...defaultKeywords],
    applicationName: brand.name,
    category: "technology",
    creator: brand.name,
    publisher: brand.name,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    alternates: {
      canonical: brand.url,
    },
    openGraph: {
      type: "website",
      locale: brand.locale,
      url: brand.url,
      siteName: brand.name,
      title: `${brand.name} — ${brand.tagline}`,
      description: defaultDescription,
      images: [
        {
          url: resolveSeoImageUrl(brand.ogImage),
          width: 1200,
          height: 630,
          alt: `${brand.name} — ${brand.tagline}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${brand.name} — ${brand.tagline}`,
      description: defaultDescription,
      images: [resolveSeoImageUrl(brand.ogImage)],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: Object.keys(verification).length > 0 ? verification : undefined,
  };
}

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": absoluteUrl("/#organization"),
    name: brand.name,
    url: brand.url,
    logo: absoluteUrl("/icon.svg"),
    email: seller.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: seller.city,
      addressCountry: "RU",
    },
    areaServed: {
      "@type": "Country",
      name: "Россия",
    },
  };
}

export function buildWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    name: brand.name,
    url: brand.url,
    inLanguage: "ru-RU",
    description: defaultDescription,
    publisher: {
      "@id": absoluteUrl("/#organization"),
    },
  };
}

export function buildWebApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": absoluteUrl("/#web-application"),
    name: brand.name,
    url: brand.url,
    description: defaultDescription,
    applicationCategory: "LifestyleApplication",
    applicationSubCategory: "Свадьба",
    operatingSystem: "Windows | Mac | Android | iOS",
    browserRequirements: "Требуется современный браузер",
    featureList: [
      "Редактор свадебного сайта-приглашения",
      "Адаптивные шаблоны",
      "Форма RSVP",
      "Публикация по персональной ссылке",
    ],
    offers: {
      "@type": "Offer",
      url: absoluteUrl("/templates"),
      name: INVITE_SITE_SERVICE_NAME,
      priceCurrency: "RUB",
      price: INVITE_SITE_PRICE,
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Person",
        name: formatSellerLegalName(),
      },
    },
    provider: {
      "@id": absoluteUrl("/#organization"),
    },
  };
}

export function buildBlogJsonLd(articles: Array<{ slug: string; title: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": absoluteUrl("/blog#blog"),
    name: `Блог · ${brand.name}`,
    url: absoluteUrl("/blog"),
    inLanguage: "ru-RU",
    publisher: {
      "@id": absoluteUrl("/#organization"),
    },
    blogPost: articles.map((article) => ({
      "@type": "BlogPosting",
      headline: article.title,
      url: absoluteUrl(`/blog/${article.slug}`),
    })),
  };
}

export function buildArticleJsonLd(article: {
  cover: { alt: string; src: string } | null;
  description: string;
  publishedAt: string;
  slug: string;
  title: string;
  updatedAt: string;
}) {
  const url = absoluteUrl(`/blog/${article.slug}`);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: article.title,
    description: article.description,
    url,
    inLanguage: "ru-RU",
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    image: [resolveSeoImageUrl(article.cover?.src ?? brand.ogImage)],
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    author: {
      "@id": absoluteUrl("/#organization"),
    },
    publisher: {
      "@id": absoluteUrl("/#organization"),
    },
    isPartOf: {
      "@id": absoluteUrl("/blog#blog"),
    },
  };
}

export function buildFaqJsonLd(items: Array<{ answer: string; question: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function buildBreadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

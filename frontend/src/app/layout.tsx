import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Geist,
  Geist_Mono,
  Great_Vibes,
  Oswald,
  Ponomar,
} from "next/font/google";
import CookieConsent from "@/components/cookie-consent";
import { YandexMetrika } from "@/components/yandex-metrika";
import { createRootMetadata } from "@/lib/seo";
import headerBaseStyles from "@/styles/site-header-base.module.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inviteSerif = Cormorant_Garamond({
  preload: false,
  variable: "--font-invite-serif",
  subsets: ["cyrillic", "latin"],
});

const inviteScript = Great_Vibes({
  preload: false,
  variable: "--font-invite-script",
  subsets: ["cyrillic", "latin"],
  weight: "400",
});

const inviteCondensed = Oswald({
  preload: false,
  variable: "--font-invite-condensed",
  subsets: ["cyrillic", "latin"],
});

/** Уставная кириллица — для акцентного текста шаблона «Сказ» (народный стиль). */
const inviteSlavic = Ponomar({
  preload: false,
  variable: "--font-invite-slavic",
  subsets: ["cyrillic"],
  weight: "400",
});

export const metadata: Metadata = createRootMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} ${inviteSerif.variable} ${inviteScript.variable} ${inviteCondensed.variable} ${inviteSlavic.variable} h-full antialiased`}
    >
      <body className={`${headerBaseStyles.scope} min-h-full flex flex-col`}>
        {children}
        <CookieConsent />
      </body>
      <YandexMetrika />
    </html>
  );
}

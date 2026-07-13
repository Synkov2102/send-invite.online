import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Geist,
  Geist_Mono,
  Great_Vibes,
} from "next/font/google";
import { createRootMetadata } from "@/lib/seo";
import "./globals.css";
import "./product-theme.css";

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

export const metadata: Metadata = createRootMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} ${inviteSerif.variable} ${inviteScript.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

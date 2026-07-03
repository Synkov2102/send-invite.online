import type { ReactNode } from "react";
import CommerceFooter from "./commerce-footer";
import SiteHeader from "./site-header";

export default function LegalPage({
  children,
  eyebrow,
  lead,
  title,
}: {
  children: ReactNode;
  eyebrow: string;
  lead: string;
  title: string;
}) {
  return (
    <div className="marketing-page legal-page">
      <SiteHeader />
      <main className="legal-shell">
        <header className="legal-hero">
          <p className="marketing-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{lead}</p>
        </header>
        <article className="legal-document">{children}</article>
      </main>
      <CommerceFooter />
    </div>
  );
}

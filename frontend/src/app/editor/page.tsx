import type { Metadata } from "next";
import { Suspense } from "react";
import CommerceFooter from "@/components/commerce-footer";
import InvitationBuilder from "@/editor/invitation-builder";
import { getManagedInviteSite } from "@/lib/backend-api";
import { getAuthSessionToken, getCurrentUser } from "@/lib/auth";
import { getInviteTemplate } from "@/lib/invite-templates";
import { createPageMetadata, privateRobots } from "@/lib/seo";
import responsiveStyles from "@/styles/editor-responsive.module.css";
import studioStyles from "@/styles/editor-studio.module.css";
import workflowStyles from "@/styles/editor-workflow.module.css";
import productStyles from "@/styles/product.module.css";
import shellStyles from "@/styles/responsive-shells.module.css";
import { notFound, redirect } from "next/navigation";

export const metadata: Metadata = createPageMetadata({
  title: "Редактор приглашения",
  description: "Редактор сайта-приглашения Send Invite.",
  path: "/editor",
  robots: privateRobots,
});

type EditorPageProps = {
  searchParams: Promise<{
    site?: string | string[];
    template?: string | string[];
  }>;
};

export default async function EditorPage({ searchParams }: EditorPageProps) {
  const query = await searchParams;
  const templateId = Array.isArray(query.template) ? query.template[0] : query.template;
  const siteId = Array.isArray(query.site) ? query.site[0] : query.site;
  const [user, sessionToken] = await Promise.all([
    getCurrentUser(),
    getAuthSessionToken(),
  ]);

  if (siteId && (!user || !sessionToken)) {
    redirect(
      `/auth?mode=login&returnTo=${encodeURIComponent(`/editor?site=${siteId}`)}`,
    );
  }

  let managedSite = null;

  if (siteId && sessionToken) {
    try {
      managedSite = await getManagedInviteSite(siteId, sessionToken);
    } catch {
      notFound();
    }
  }

  const requestedTemplate = getInviteTemplate(templateId);
  const template =
    templateId && requestedTemplate.id === templateId
      ? requestedTemplate
      : getInviteTemplate(managedSite?.templateId);

  return (
    <div
      className={`${workflowStyles.scope} ${studioStyles.scope} ${responsiveStyles.scope} ${shellStyles.scope} ${productStyles.scope} editor-shell`}
    >
      <Suspense
        fallback={
          <div className="editor-loading">
            <div className="editor-loading__mark">
              <span />
              <span />
            </div>
            <p>Готовим вашу студию</p>
            <small>Загружаем редактор приглашения</small>
          </div>
        }
      >
        <InvitationBuilder
          initialInvite={managedSite?.invite}
          initialIsPaid={managedSite?.isPaid}
          initialPalette={managedSite?.palette}
          isAuthenticated={Boolean(user)}
          siteId={managedSite?.id}
          template={template}
        />
      </Suspense>
      <CommerceFooter />
    </div>
  );
}

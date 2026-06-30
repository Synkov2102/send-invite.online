import { Suspense } from "react";
import InvitationBuilder from "@/editor/invitation-builder";
import { getManagedInviteSite } from "@/lib/backend-api";
import { getAuthSessionToken, getCurrentUser } from "@/lib/auth";
import { getInviteTemplate } from "@/lib/invite-templates";
import { notFound, redirect } from "next/navigation";

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
        initialPalette={managedSite?.palette}
        isAuthenticated={Boolean(user)}
        siteId={managedSite?.id}
        template={template}
      />
    </Suspense>
  );
}

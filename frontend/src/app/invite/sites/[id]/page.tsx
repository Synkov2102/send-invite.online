import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublishedInviteSiteView from "@/components/published-invite-site";
import { getPublishedInviteSite } from "@/lib/backend-api";
import { getInviteTemplate } from "@/lib/invite-templates";

export const dynamic = "force-dynamic";

type InviteSitePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: InviteSitePageProps): Promise<Metadata> {
  const { id } = await params;
  const site = await getPublishedInviteSite(id);

  if (!site) {
    return {
      title: "Сайт не найден",
    };
  }

  return {
    title: `${site.invite.groom} & ${site.invite.bride}`,
  };
}

export default async function InviteSitePage({ params }: InviteSitePageProps) {
  const { id } = await params;
  const site = await getPublishedInviteSite(id);

  if (!site) {
    notFound();
  }

  const template = getInviteTemplate(site.templateId);

  if (template.id !== site.templateId) {
    notFound();
  }

  return <PublishedInviteSiteView site={site} template={template} />;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublishedInviteSiteView from "@/components/published-invite-site";
import { getPublishedInviteSite } from "@/lib/backend-api";
import { getInviteTemplate } from "@/lib/invite-templates";
import { formatDate } from "@/lib/invite-date";
import {
  createPageMetadata,
  privateRobots,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

type InviteSitePageProps = {
  params: Promise<{ id: string }>;
};

function getInviteCoverImage(coverImageUrl?: string) {
  if (coverImageUrl?.startsWith("http://") || coverImageUrl?.startsWith("https://")) {
    return coverImageUrl;
  }

  return undefined;
}

function buildInviteDescription(invite: {
  groom: string;
  bride: string;
  date: string;
  venue: string;
  city: string;
}) {
  const dateLabel = formatDate(invite.date);
  const venueLabel = [invite.venue, invite.city].filter(Boolean).join(", ");

  return `Свадебное приглашение ${invite.groom} и ${invite.bride}. ${dateLabel}${venueLabel ? ` · ${venueLabel}` : ""}.`;
}

export async function generateMetadata({ params }: InviteSitePageProps): Promise<Metadata> {
  const { id } = await params;
  const site = await getPublishedInviteSite(id);

  if (!site) {
    return createPageMetadata({
      title: "Сайт не найден",
      description: "Опубликованный сайт-приглашение не найден.",
      path: `/invite/sites/${id}`,
      robots: privateRobots,
    });
  }

  const title = `${site.invite.groom} & ${site.invite.bride}`;
  const description = buildInviteDescription(site.invite);
  const coverImage = getInviteCoverImage(site.invite.coverImageUrl);

  return createPageMetadata({
    title,
    description,
    path: `/invite/sites/${id}`,
    images: coverImage ? [coverImage] : undefined,
    robots: privateRobots,
    type: "article",
  });
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

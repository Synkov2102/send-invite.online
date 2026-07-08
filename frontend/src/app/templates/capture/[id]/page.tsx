import { notFound } from "next/navigation";
import TemplateCaptureView from "@/components/template-capture-view";
import { getInitialInvite } from "@/editor/template-presets";
import { getInviteTemplate } from "@/lib/invite-templates";
import { getPalettePreset } from "@/lib/invite-theme";
import { privateRobots } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: privateRobots,
};

type TemplateCapturePageProps = {
  params: Promise<{ id: string }>;
};

export default async function TemplateCapturePage({ params }: TemplateCapturePageProps) {
  const { id } = await params;
  const template = getInviteTemplate(id);

  if (!template || template.id !== id) {
    notFound();
  }

  const invite = getInitialInvite(template);
  const palette = getPalettePreset(invite.paletteId);

  if (!palette) {
    notFound();
  }

  return <TemplateCaptureView invite={invite} palette={palette} template={template} />;
}

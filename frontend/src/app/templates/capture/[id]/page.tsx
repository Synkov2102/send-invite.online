import { notFound } from "next/navigation";
import TemplateCaptureView from "@/components/template-capture-view";
import { getInitialInvite } from "@/editor/template-presets";
import { getInviteTemplate } from "@/lib/invite-templates";
import { getPalettePreset } from "@/lib/invite-theme";
import { getTemplatePalettes } from "@/lib/template-palettes";
import { privateRobots } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: privateRobots,
};

type TemplateCapturePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ palette?: string | string[] }>;
};

export default async function TemplateCapturePage({
  params,
  searchParams,
}: TemplateCapturePageProps) {
  const { id } = await params;
  const query = await searchParams;
  const paletteId = Array.isArray(query.palette) ? query.palette[0] : query.palette;
  const template = getInviteTemplate(id);

  if (!template || template.id !== id) {
    notFound();
  }

  const initialInvite = getInitialInvite(template);
  const resolvedPaletteId = paletteId ?? initialInvite.paletteId;
  const isTemplatePalette = getTemplatePalettes(template).some(
    (palette) => palette.id === resolvedPaletteId,
  );
  const palette = isTemplatePalette ? getPalettePreset(resolvedPaletteId) : undefined;

  if (!palette) {
    notFound();
  }

  const invite = { ...initialInvite, paletteId: palette.id };

  return <TemplateCaptureView invite={invite} palette={palette} template={template} />;
}

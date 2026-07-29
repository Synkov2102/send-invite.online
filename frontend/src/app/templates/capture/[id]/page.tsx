import { notFound } from "next/navigation";
import TemplateCaptureView from "@/components/template-capture-view";
import { getInitialInvite } from "@/editor/template-presets";
import { getInviteTemplate } from "@/lib/invite-templates";
import { getPalettePreset } from "@/lib/invite-theme";
import { getTemplatePalettes } from "@/lib/template-palettes";
import { privateRobots } from "@/lib/seo";
import type { Metadata } from "next";
import { getCaptureFixture } from "./fixtures";

export const metadata: Metadata = {
  robots: privateRobots,
};

type TemplateCapturePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ fixture?: string | string[]; palette?: string | string[] }>;
};

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function TemplateCapturePage({
  params,
  searchParams,
}: TemplateCapturePageProps) {
  const { id } = await params;
  const query = await searchParams;
  const paletteId = readParam(query.palette);
  const fixture = getCaptureFixture(readParam(query.fixture));
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

  const invite = { ...initialInvite, ...fixture, paletteId: palette.id };

  if (!fixture) {
    return <TemplateCaptureView invite={invite} palette={palette} template={template} />;
  }

  return (
    <>
      <TemplateCaptureView bare invite={invite} palette={palette} template={template} />
      {/* Тесты сверяют разметку с исходными данными — отдаём их же, без дублирования фикстур. */}
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(invite).replace(/</g, "\\u003c"),
        }}
        id="capture-fixture-invite"
        type="application/json"
      />
    </>
  );
}

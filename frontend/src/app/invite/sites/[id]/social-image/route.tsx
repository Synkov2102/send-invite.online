import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import {
  InviteSocialImage,
  socialImageFonts,
  socialImageStyles,
} from "@/components/invite-social-image/invite-social-image";
import { getPublishedInviteSite } from "@/lib/backend-api";
import { brand } from "@/lib/brand";
import { inviteTemplateCatalog } from "@/lib/invite-templates";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const site = await getPublishedInviteSite(id);

  if (!site) {
    return new Response(null, { status: 404, headers: { "Cache-Control": "no-store" } });
  }

  const template = inviteTemplateCatalog.find((item) => item.id === site.templateId);
  if (!template) {
    return Response.redirect(new URL(brand.ogImage, brand.url));
  }

  const fontName = socialImageStyles[template.kind].font;
  const font = socialImageFonts[fontName];
  const data = await readFile(path.join(process.cwd(), "public/fonts/social", font.file));

  return new ImageResponse(<InviteSocialImage kind={template.kind} palette={site.palette} />, {
    width: 1200,
    height: 630,
    fonts: [{ name: fontName, data, weight: font.weight, style: "normal" }],
    headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" },
  });
}

import { createHash } from "node:crypto";
import { brand } from "@/lib/brand";
import type { PublishedInviteSite } from "@/lib/invite-site-types";
import { inviteTemplateCatalog } from "@/lib/invite-templates";

export function getInviteSocialImagePath(
  site: Pick<PublishedInviteSite, "id" | "templateId" | "palette">,
) {
  if (!inviteTemplateCatalog.some((template) => template.id === site.templateId)) {
    return brand.ogImage;
  }

  // Меняем URL при смене оформления, чтобы превью не использовало старую картинку.
  const version = createHash("sha256")
    .update(JSON.stringify([1, site.templateId, site.palette]))
    .digest("hex")
    .slice(0, 12);

  return `/invite/sites/${encodeURIComponent(site.id)}/social-image?v=${version}`;
}

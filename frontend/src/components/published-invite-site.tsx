import { InviteSiteRenderer } from "@/components/invite-site-renderer";
import type { PublishedInviteSite } from "@/lib/invite-site-types";
import type { InviteTemplate } from "@/lib/invite-templates";

export type PublishedInviteSiteViewProps = {
  site: PublishedInviteSite;
  template: InviteTemplate;
};

export default function PublishedInviteSiteView({ site, template }: PublishedInviteSiteViewProps) {
  return (
    <InviteSiteRenderer
      invite={site.invite}
      palette={site.palette}
      siteId={site.id}
      template={template}
    />
  );
}

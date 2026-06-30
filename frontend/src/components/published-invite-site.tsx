import { InviteSiteRenderer } from "@/components/invite-site-renderer";
import type { InviteTemplate, PublishedInviteSite } from "@invite/shared";

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

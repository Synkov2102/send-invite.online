"use client";

import { useMemo } from "react";
import {
  getTemplateKind,
  isWideTemplateKind,
  type InviteTemplate,
} from "@/lib/invite-templates";
import type { InviteSitePalette } from "@/lib/invite-site-types";
import type { InviteState } from "@/lib/invite-state";
import { getCalendarDays } from "@/lib/invite-date";
import { alpineRenderer as AlpineRenderer, sharedTemplateRenderers } from "@/invitation-templates/registry";
import {
  clarityImages,
  createInviteVars,
  createRingColor,
  electricImages,
  inviteImages,
  silkImages,
} from "@/lib/invite-theme";
import baseStyles from "@/styles/invitation-base.module.css";
import responsiveStyles from "@/styles/responsive-shells.module.css";

export type InviteSiteRendererProps = {
  asMain?: boolean;
  className?: string;
  invite: InviteState;
  palette: InviteSitePalette;
  siteId?: string;
  template: InviteTemplate;
};

export function InviteSiteRenderer({
  asMain = true,
  className,
  invite,
  palette,
  siteId,
  template,
}: InviteSiteRendererProps) {
  const templateKind = getTemplateKind(template.id);
  const calendarDays = useMemo(() => getCalendarDays(invite.date), [invite.date]);
  const inviteVars = useMemo(() => createInviteVars(palette), [palette]);
  const ringColor = useMemo(() => createRingColor(invite.ringMetal), [invite.ringMetal]);
  const templateImages =
    templateKind === "silk"
      ? silkImages
      : templateKind === "electric"
        ? electricImages
      : templateKind === "clarity" || templateKind === "minimal"
        ? clarityImages
        : inviteImages;
  const coverImage = invite.coverImageUrl || templateImages.cover;
  const portraitImage = invite.portraitImageUrl || templateImages.portrait;
  const venueImage = invite.venueImageUrl || templateImages.venue;
  const rootClassName = `${baseStyles.scope} ${responsiveStyles.scope} ${
    className ?? `published-site published-site--${templateKind}`
  }`;
  const Wrapper = asMain ? "main" : "div";

  const sharedProps = {
    calendarDays,
    coverImage,
    invite,
    inviteVars,
    portraitImage,
    siteId,
    venueImage,
  };

  const SharedRenderer =
    templateKind !== "alpine" ? sharedTemplateRenderers[templateKind] : null;

  return (
    <Wrapper className={rootClassName}>
      {templateKind === "alpine" ? (
        <AlpineRenderer
          {...sharedProps}
          coverType={template.coverType}
          ringColor={ringColor}
        />
      ) : SharedRenderer ? (
        <SharedRenderer {...sharedProps} />
      ) : null}
    </Wrapper>
  );
}

export { isWideTemplateKind };

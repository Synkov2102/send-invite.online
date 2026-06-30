"use client";

import { useMemo } from "react";
import {
  getTemplateKind,
  isWideTemplateKind,
  type InviteSitePalette,
  type InviteState,
  type InviteTemplate,
} from "@invite/shared";
import { getCalendarDays } from "@/lib/invite-date";
import { alpineRenderer as AlpineRenderer, sharedTemplateRenderers } from "@/invitation-templates/registry";
import { createInviteVars, createRingColor, inviteImages, silkImages } from "@/lib/invite-theme";

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
  const templateImages = templateKind === "silk" ? silkImages : inviteImages;
  const coverImage = invite.coverImageUrl || templateImages.cover;
  const portraitImage = invite.portraitImageUrl || templateImages.portrait;
  const venueImage = invite.venueImageUrl || templateImages.venue;
  const rootClassName = className ?? `published-site published-site--${templateKind}`;
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

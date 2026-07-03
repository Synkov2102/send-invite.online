import type { InviteTemplate } from "@/lib/invite-templates";
import type { InviteState } from "@invite/shared";
import type { InvitePalette } from "@/lib/invite-theme";

export type { InviteState };
export type { InviteVars } from "@/lib/invite-theme";

export type InvitationBuilderProps = {
  initialInvite?: InviteState;
  initialIsPaid?: boolean;
  initialPalette?: InvitePalette;
  isAuthenticated: boolean;
  siteId?: string;
  template: InviteTemplate;
};

export type SaveStatus = "error" | "saved" | "saving";

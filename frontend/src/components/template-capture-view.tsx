"use client";

import { InviteSiteRenderer } from "@/components/invite-site-renderer";
import type { InviteSitePalette } from "@/lib/invite-site-types";
import type { InviteState } from "@/lib/invite-state";
import type { InviteTemplate } from "@/lib/invite-templates";
import styles from "./template-capture.module.css";

type TemplateCaptureViewProps = {
  invite: InviteState;
  palette: InviteSitePalette;
  template: InviteTemplate;
};

export default function TemplateCaptureView({
  invite,
  palette,
  template,
}: TemplateCaptureViewProps) {
  return (
    <div className={styles.root} data-template-capture={template.id}>
      <div className={styles.screen} data-template-capture-screen>
        <InviteSiteRenderer
          asMain={false}
          invite={invite}
          palette={palette}
          template={template}
        />
      </div>
    </div>
  );
}

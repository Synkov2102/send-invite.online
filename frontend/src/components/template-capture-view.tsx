"use client";

import { InviteSiteRenderer } from "@/components/invite-site-renderer";
import type { InviteSitePalette } from "@/lib/invite-site-types";
import type { InviteState } from "@/lib/invite-state";
import type { InviteTemplate } from "@/lib/invite-templates";
import styles from "./template-capture.module.css";

type TemplateCaptureViewProps = {
  /** Без рамки телефона: режим стресс-фикстур, шаблон тянется по ширине окна. */
  bare?: boolean;
  invite: InviteState;
  palette: InviteSitePalette;
  template: InviteTemplate;
};

export default function TemplateCaptureView({
  bare = false,
  invite,
  palette,
  template,
}: TemplateCaptureViewProps) {
  const renderer = (
    <InviteSiteRenderer asMain={false} invite={invite} palette={palette} template={template} />
  );

  if (bare) {
    return (
      <div className={styles.bare} data-template-capture={template.id}>
        {renderer}
      </div>
    );
  }

  return (
    <div className={styles.root} data-template-capture={template.id}>
      <div className={styles.screen} data-template-capture-screen>
        {renderer}
      </div>
    </div>
  );
}

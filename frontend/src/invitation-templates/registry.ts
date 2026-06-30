"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { CoverType, TemplateKind } from "@invite/shared";
import type { InviteState } from "@/lib/invite-state";
import type { InviteVars } from "@/lib/invite-theme";
import type { getCalendarDays } from "@/lib/invite-date";

export type TemplateCalendarDays = ReturnType<typeof getCalendarDays>;

export type SharedTemplateViewProps = {
  calendarDays: TemplateCalendarDays;
  coverImage: string;
  invite: InviteState;
  inviteVars: InviteVars;
  portraitImage: string;
  siteId?: string;
  venueImage: string;
};

export type AlpineTemplateViewProps = SharedTemplateViewProps & {
  coverType: CoverType;
  ringColor: string;
};

type SharedTemplateKind = Exclude<TemplateKind, "alpine">;

export const alpineRenderer = dynamic(
  () => import("./alpine").then((module) => module.AlpineTemplate),
  { ssr: true },
);

export const sharedTemplateRenderers: Record<
  SharedTemplateKind,
  ComponentType<SharedTemplateViewProps>
> = {
  aqua: dynamic(() => import("./aqua").then((module) => module.AquaTemplate), { ssr: true }),
  silk: dynamic(() => import("./silk").then((module) => module.SilkTemplate), { ssr: true }),
  vanilla: dynamic(
    () => import("./vanilla").then((module) => module.VanillaTemplate),
    { ssr: true },
  ),
};

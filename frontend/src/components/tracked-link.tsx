"use client";

import { trackGoal } from "@/lib/analytics";
import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";

type TrackedLinkProps = ComponentProps<typeof Link> & {
  goal: string;
};

export default function TrackedLink({ goal, onClick, ...props }: TrackedLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    trackGoal(goal);
    onClick?.(event);
  }

  return <Link {...props} onClick={handleClick} />;
}

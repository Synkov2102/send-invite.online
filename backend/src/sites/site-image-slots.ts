import type { InviteImageSlot } from "./media-utils";

type InviteImageField = "coverImageUrl" | "portraitImageUrl" | "venueImageUrl";

export const INVITE_IMAGE_SLOTS: ReadonlyArray<{
  field: InviteImageField;
  slot: InviteImageSlot;
}> = [
  { field: "coverImageUrl", slot: "cover" },
  { field: "portraitImageUrl", slot: "portrait" },
  { field: "venueImageUrl", slot: "venue" },
];

export function getImageFieldForSlot(slot: InviteImageSlot): InviteImageField {
  const match = INVITE_IMAGE_SLOTS.find((item) => item.slot === slot);

  if (!match) {
    throw new Error(`Unknown image slot: ${slot}`);
  }

  return match.field;
}

export function isInviteImageSlot(value: string): value is InviteImageSlot {
  return INVITE_IMAGE_SLOTS.some((item) => item.slot === value);
}

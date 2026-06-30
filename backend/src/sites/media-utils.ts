export type InviteImageSlot = "cover" | "portrait" | "venue";

export function parseDataUrl(dataUrl: string) {
  const match = /^data:([^;]+);base64,([\s\S]+)$/.exec(dataUrl);

  if (!match) {
    return null;
  }

  return {
    buffer: Buffer.from(match[2], "base64"),
    mime: match[1],
  };
}

export const parseDataMusicUrl = parseDataUrl;

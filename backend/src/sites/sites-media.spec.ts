import sharp from "sharp";
import {
  convertImageToWebp,
  getPublicImageUrl,
  getPublicMusicUrl,
  InviteImageUploadError,
  stripMediaVersion,
} from "./sites-media";

const solidPng = (width: number, height: number, background = "#ff4f72") =>
  sharp({ create: { background, channels: 3, height, width } })
    .png()
    .toBuffer();

describe("convertImageToWebp", () => {
  it("converts png to webp", async () => {
    const webp = await convertImageToWebp(await solidPng(120, 60));
    const metadata = await sharp(webp).metadata();

    expect(metadata.format).toBe("webp");
    expect(metadata.width).toBe(120);
    expect(metadata.height).toBe(60);
  });

  it("applies EXIF orientation so the photo is not sideways", async () => {
    const rotatedJpeg = await sharp({
      create: { background: "#00aaff", channels: 3, height: 50, width: 100 },
    })
      .withMetadata({ orientation: 6 })
      .jpeg()
      .toBuffer();

    const metadata = await sharp(await convertImageToWebp(rotatedJpeg)).metadata();

    expect(metadata.width).toBe(50);
    expect(metadata.height).toBe(100);
  });

  it("keeps every frame of an animated gif", async () => {
    const frames = await Promise.all([
      solidPng(40, 40, "#111111"),
      solidPng(40, 40, "#888888"),
      solidPng(40, 40, "#eeeeee"),
    ]);
    const gif = await sharp(frames, { join: { animated: true } })
      .gif({ delay: [120, 120, 120], loop: 0 })
      .toBuffer();

    const metadata = await sharp(await convertImageToWebp(gif), { animated: true }).metadata();

    expect(metadata.format).toBe("webp");
    expect(metadata.pages).toBe(3);
  });

  it("rejects buffers that are not images", async () => {
    await expect(convertImageToWebp(Buffer.from("not an image"))).rejects.toBeInstanceOf(
      InviteImageUploadError,
    );
  });
});

describe("public media urls", () => {
  const oldRef = "s3://bucket/invite-images/cover/2026/old.webp";
  const newRef = "s3://bucket/invite-images/cover/2026/new.webp";

  it("changes the image url when the stored photo is replaced", () => {
    const before = getPublicImageUrl("site-1", oldRef, "cover");
    const after = getPublicImageUrl("site-1", newRef, "cover");

    expect(before).toMatch(/^\/api\/sites\/site-1\/images\/cover\?v=[0-9a-f]{12}$/);
    expect(after).not.toBe(before);
    expect(getPublicImageUrl("site-1", oldRef, "cover")).toBe(before);
  });

  it("versions uploaded music the same way", () => {
    expect(getPublicMusicUrl("site-1", "s3://bucket/invite-music/2026/a.mp3")).toMatch(
      /^\/api\/sites\/site-1\/music\?v=[0-9a-f]{12}$/,
    );
  });

  it("keeps external urls untouched", () => {
    expect(getPublicImageUrl("site-1", "https://example.com/a.jpg", "cover")).toBe(
      "https://example.com/a.jpg",
    );
  });

  it("strips the version back to the stable path", () => {
    expect(stripMediaVersion(getPublicImageUrl("site-1", oldRef, "cover"))).toBe(
      "/api/sites/site-1/images/cover",
    );
    expect(stripMediaVersion("/api/sites/site-1/music")).toBe("/api/sites/site-1/music");
  });
});

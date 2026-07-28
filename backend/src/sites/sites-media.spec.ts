import sharp from "sharp";
import { convertImageToWebp, InviteImageUploadError } from "./sites-media";

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

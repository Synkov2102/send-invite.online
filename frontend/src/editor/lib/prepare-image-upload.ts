import { imageUploadTypes, maxImageUploadBytes } from "../constants";

const HEIC_TYPES = new Set(["image/heic", "image/heif", "image/heic-sequence"]);
const MAX_IMAGE_EDGE = 2040;
const JPEG_QUALITY = 0.88;

export const imageUploadAccept = [
  ...imageUploadTypes,
  "image/heic",
  "image/heif",
  ".heic",
  ".heif",
].join(",");

export function isAllowedImageUpload(file: File) {
  if (imageUploadTypes.includes(file.type) || HEIC_TYPES.has(file.type)) {
    return true;
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension === "heic" || extension === "heif") {
    return true;
  }

  if (!file.type && extension && ["jpg", "jpeg", "png", "webp", "gif"].includes(extension)) {
    return true;
  }

  return false;
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => reject(new Error("decode-failed")));
    image.src = source;
  });
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("read-failed"));
    });
    reader.addEventListener("error", () => reject(new Error("read-failed")));
    reader.readAsDataURL(file);
  });
}

function resizeImageDataUrl(dataUrl: string) {
  return loadImage(dataUrl).then((image) => {
    const largestEdge = Math.max(image.naturalWidth, image.naturalHeight);
    if (largestEdge <= MAX_IMAGE_EDGE) {
      return dataUrl;
    }

    const scale = MAX_IMAGE_EDGE / largestEdge;
    const width = Math.round(image.naturalWidth * scale);
    const height = Math.round(image.naturalHeight * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      return dataUrl;
    }

    context.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  });
}

export async function prepareImageUpload(file: File) {
  if (!isAllowedImageUpload(file)) {
    throw new Error("type");
  }

  if (file.size > maxImageUploadBytes) {
    throw new Error("size");
  }

  const dataUrl = await readFileAsDataUrl(file);

  try {
    return await resizeImageDataUrl(dataUrl);
  } catch {
    if (HEIC_TYPES.has(file.type) || file.name.toLowerCase().endsWith(".heic")) {
      throw new Error("heic");
    }

    throw new Error("decode");
  }
}

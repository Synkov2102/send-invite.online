import { randomUUID } from "crypto";
import { Injectable } from "@nestjs/common";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const defaultEndpoint = "https://storage.yandexcloud.net";
const defaultRegion = "ru-central1";
const s3RefPrefix = "s3://";
const inviteImageKeyPrefix = "invite-images/";
const inviteMusicKeyPrefix = "invite-music/";

const audioExtensions: Record<string, string> = {
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/ogg": "ogg",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
};

const imageExtensions: Record<string, string> = {
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

type S3Config = {
  accessKeyId: string;
  bucket: string;
  endpoint: string;
  forcePathStyle: boolean;
  region: string;
  secretAccessKey: string;
};

type S3Body = {
  transformToByteArray?: () => Promise<Uint8Array>;
};

function getAudioExtension(contentType: string) {
  return audioExtensions[contentType.toLowerCase()] ?? "bin";
}

function getImageExtension(contentType: string) {
  return imageExtensions[contentType.toLowerCase()] ?? "bin";
}

function createS3Ref(bucket: string, key: string) {
  return `${s3RefPrefix}${bucket}/${key}`;
}

async function readObjectBody(body: unknown) {
  if (!body) {
    return Buffer.alloc(0);
  }

  const streamBody = body as S3Body;

  if (typeof streamBody.transformToByteArray === "function") {
    return Buffer.from(await streamBody.transformToByteArray());
  }

  const chunks: Buffer[] = [];

  for await (const chunk of body as AsyncIterable<Uint8Array>) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

export function isS3ObjectRef(value: string) {
  return value.startsWith(s3RefPrefix);
}

export function parseS3ObjectRef(value: string) {
  if (!isS3ObjectRef(value)) {
    return null;
  }

  const path = value.slice(s3RefPrefix.length);
  const slashIndex = path.indexOf("/");

  if (slashIndex <= 0 || slashIndex === path.length - 1) {
    return null;
  }

  return {
    bucket: path.slice(0, slashIndex),
    key: path.slice(slashIndex + 1),
  };
}

@Injectable()
export class S3StorageService {
  private client: S3Client | undefined;
  private clientConfigKey: string | undefined;

  private readS3Config(): S3Config | null {
    const accessKeyId = process.env.S3_ACCESS_KEY_ID ?? process.env.AWS_ACCESS_KEY_ID;
    const bucket = process.env.S3_BUCKET;
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY ?? process.env.AWS_SECRET_ACCESS_KEY;

    if (!accessKeyId || !bucket || !secretAccessKey) {
      return null;
    }

    return {
      accessKeyId,
      bucket,
      endpoint: process.env.S3_ENDPOINT ?? defaultEndpoint,
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
      region: process.env.S3_REGION ?? process.env.AWS_REGION ?? defaultRegion,
      secretAccessKey,
    };
  }

  private getS3Config(): S3Config {
    const config = this.readS3Config();

    if (!config) {
      throw new Error("S3 storage is not configured.");
    }

    return config;
  }

  private getS3Client(config: S3Config) {
    const configKey = [
      config.accessKeyId,
      config.endpoint,
      config.forcePathStyle,
      config.region,
    ].join(":");

    if (!this.client || this.clientConfigKey !== configKey) {
      this.client = new S3Client({
        credentials: {
          accessKeyId: config.accessKeyId,
          secretAccessKey: config.secretAccessKey,
        },
        endpoint: config.endpoint,
        forcePathStyle: config.forcePathStyle,
        region: config.region,
      });
      this.clientConfigKey = configKey;
    }

    return this.client;
  }

  async uploadInviteMusicObject({
    buffer,
    contentType,
  }: {
    buffer: Buffer;
    contentType: string;
  }) {
    const config = this.getS3Config();
    const key = `invite-music/${new Date().getUTCFullYear()}/${randomUUID()}.${getAudioExtension(
      contentType,
    )}`;

    await this.getS3Client(config).send(
      new PutObjectCommand({
        Body: buffer,
        Bucket: config.bucket,
        CacheControl: "public, max-age=31536000, immutable",
        ContentType: contentType,
        Key: key,
      }),
    );

    return createS3Ref(config.bucket, key);
  }

  async uploadInviteImageObject({
    buffer,
    contentType,
    slot,
  }: {
    buffer: Buffer;
    contentType: string;
    slot: "cover" | "portrait" | "venue";
  }) {
    const config = this.getS3Config();
    const key = `invite-images/${slot}/${new Date().getUTCFullYear()}/${randomUUID()}.${getImageExtension(
      contentType,
    )}`;

    await this.getS3Client(config).send(
      new PutObjectCommand({
        Body: buffer,
        Bucket: config.bucket,
        CacheControl: "public, max-age=31536000, immutable",
        ContentType: contentType,
        Key: key,
      }),
    );

    return createS3Ref(config.bucket, key);
  }

  async getInviteS3Object(ref: string) {
    const parsed = parseS3ObjectRef(ref);

    if (!parsed) {
      throw new Error("Invalid S3 object reference.");
    }

    const config = this.getS3Config();

    if (parsed.bucket !== config.bucket) {
      throw new Error("S3 bucket is not allowed.");
    }

    if (
      !parsed.key.startsWith(inviteImageKeyPrefix) &&
      !parsed.key.startsWith(inviteMusicKeyPrefix)
    ) {
      throw new Error("S3 object key is not allowed.");
    }

    const response = await this.getS3Client(config).send(
      new GetObjectCommand({
        Bucket: parsed.bucket,
        Key: parsed.key,
      }),
    );

    return {
      buffer: await readObjectBody(response.Body),
      cacheControl: response.CacheControl ?? "public, max-age=31536000, immutable",
      contentType: response.ContentType ?? "application/octet-stream",
    };
  }
}

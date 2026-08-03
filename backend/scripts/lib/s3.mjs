/** S3 client for the CLI scripts, configured from the same env as `S3StorageService`. */

import { requireFromBackend } from "./cli.mjs";

const { PutObjectCommand, S3Client } = requireFromBackend("@aws-sdk/client-s3");

const defaultEndpoint = "https://storage.yandexcloud.net";
const defaultRegion = "ru-central1";

export function getS3Config() {
  const accessKeyId = process.env.S3_ACCESS_KEY_ID ?? process.env.AWS_ACCESS_KEY_ID;
  const bucket = process.env.S3_BUCKET;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY ?? process.env.AWS_SECRET_ACCESS_KEY;

  if (!accessKeyId || !bucket || !secretAccessKey) {
    throw new Error(
      "S3 не настроен: заполните S3_BUCKET, S3_ACCESS_KEY_ID и S3_SECRET_ACCESS_KEY.",
    );
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

export function createS3Client(config) {
  return new S3Client({
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    endpoint: config.endpoint,
    forcePathStyle: config.forcePathStyle,
    region: config.region,
  });
}

export async function putObject(client, config, { body, contentType, key }) {
  await client.send(
    new PutObjectCommand({
      Body: body,
      Bucket: config.bucket,
      CacheControl: "public, max-age=31536000, immutable",
      ContentType: contentType,
      Key: key,
    }),
  );

  return `s3://${config.bucket}/${key}`;
}

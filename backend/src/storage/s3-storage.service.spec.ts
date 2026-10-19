import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { inviteImageKeyPrefix, S3StorageService } from "./s3-storage.service";

const S3_ENV_KEYS = ["S3_BUCKET", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY"] as const;

describe("S3StorageService.listInviteMediaObjects", () => {
  const originalEnv = Object.fromEntries(S3_ENV_KEYS.map((key) => [key, process.env[key]]));
  let service: S3StorageService;

  beforeEach(() => {
    process.env.S3_BUCKET = "invite-bucket";
    process.env.S3_ACCESS_KEY_ID = "test-key";
    process.env.S3_SECRET_ACCESS_KEY = "test-secret";
    service = new S3StorageService();
  });

  afterEach(() => {
    service.onModuleDestroy();
    jest.restoreAllMocks();

    for (const key of S3_ENV_KEYS) {
      if (originalEnv[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = originalEnv[key];
      }
    }
  });

  it("walks every page and returns s3 refs", async () => {
    const lastModified = new Date("2026-10-01T00:00:00.000Z");
    const send = jest
      .spyOn(S3Client.prototype, "send")
      .mockImplementationOnce(async () => ({
        Contents: [
          { Key: "invite-images/cover/2026/a.webp", LastModified: lastModified, Size: 10 },
          { Key: "invite-images/cover/2026/no-date.webp" },
        ],
        IsTruncated: true,
        NextContinuationToken: "page-2",
      }))
      .mockImplementationOnce(async () => ({
        Contents: [{ Key: "invite-images/venue/2026/b.webp", LastModified: lastModified }],
        IsTruncated: false,
      }));

    const objects = [];

    for await (const object of service.listInviteMediaObjects(inviteImageKeyPrefix)) {
      objects.push(object);
    }

    expect(objects).toEqual([
      { lastModified, ref: "s3://invite-bucket/invite-images/cover/2026/a.webp", size: 10 },
      { lastModified, ref: "s3://invite-bucket/invite-images/venue/2026/b.webp", size: 0 },
    ]);
    expect(send).toHaveBeenCalledTimes(2);

    const secondCommand = send.mock.calls[1][0] as ListObjectsV2Command;
    expect(secondCommand.input).toMatchObject({
      Bucket: "invite-bucket",
      ContinuationToken: "page-2",
      Prefix: inviteImageKeyPrefix,
    });
  });

  it("refuses prefixes outside invite media", async () => {
    const iterator = service.listInviteMediaObjects("catalog-music/");

    await expect(iterator.next()).rejects.toThrow("S3 prefix is not allowed.");
  });
});

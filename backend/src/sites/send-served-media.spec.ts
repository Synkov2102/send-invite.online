import { PassThrough, Readable } from "stream";
import type { Response } from "express";
import { sendServedMedia } from "./send-served-media";

type FakeResponse = PassThrough & {
  headers: Record<string, string>;
  sent: Buffer | null;
  statusCode: number;
  set: (headers: Record<string, string>) => FakeResponse;
  status: (code: number) => FakeResponse;
  send: (body: Buffer) => FakeResponse;
};

function createResponse() {
  const response = new PassThrough() as FakeResponse;

  response.headers = {};
  response.statusCode = 200;
  response.sent = null;
  response.set = (headers) => {
    Object.assign(response.headers, headers);
    return response;
  };
  response.status = (code) => {
    response.statusCode = code;
    return response;
  };
  response.send = (body) => {
    response.sent = body;
    return response;
  };

  return response;
}

function readAll(stream: Readable) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];

    stream.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

describe("sendServedMedia", () => {
  it("sends a buffer without range headers", () => {
    const response = createResponse();

    sendServedMedia(response as unknown as Response, {
      buffer: Buffer.from("image-bytes"),
      cacheControl: "public, max-age=31536000, immutable",
      contentType: "image/webp",
      kind: "buffer",
    });

    expect(response.sent?.toString()).toBe("image-bytes");
    expect(response.headers["Content-Type"]).toBe("image/webp");
    expect(response.headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(response.headers["Accept-Ranges"]).toBeUndefined();
  });

  it("streams a full track as 200 with Accept-Ranges and ETag", async () => {
    const response = createResponse();
    const body = readAll(response);

    sendServedMedia(response as unknown as Response, {
      cacheControl: "public, max-age=31536000, immutable",
      contentLength: 9,
      contentType: "audio/mpeg",
      etag: '"abc123"',
      kind: "stream",
      stream: Readable.from([Buffer.from("mp3-bytes")]),
    });

    await expect(body).resolves.toEqual(Buffer.from("mp3-bytes"));
    expect(response.statusCode).toBe(200);
    expect(response.headers["Accept-Ranges"]).toBe("bytes");
    expect(response.headers["Content-Length"]).toBe("9");
    expect(response.headers.ETag).toBe('"abc123"');
    expect(response.headers["Content-Range"]).toBeUndefined();
  });

  it("answers a satisfied range with 206 and Content-Range", async () => {
    const response = createResponse();
    const body = readAll(response);

    sendServedMedia(response as unknown as Response, {
      cacheControl: "public, max-age=31536000, immutable",
      contentLength: 4,
      contentRange: "bytes 0-3/9",
      contentType: "audio/mpeg",
      kind: "stream",
      stream: Readable.from([Buffer.from("mp3-")]),
    });

    await expect(body).resolves.toEqual(Buffer.from("mp3-"));
    expect(response.statusCode).toBe(206);
    expect(response.headers["Content-Range"]).toBe("bytes 0-3/9");
  });

  it("closes the S3 stream when the client disconnects", async () => {
    const response = createResponse();
    const stream = Readable.from([Buffer.from("mp3-bytes")]);

    sendServedMedia(response as unknown as Response, {
      cacheControl: "public, max-age=31536000, immutable",
      contentType: "audio/mpeg",
      kind: "stream",
      stream,
    });

    response.destroy();
    await new Promise((resolve) => response.on("close", resolve));

    expect(stream.destroyed).toBe(true);
  });
});

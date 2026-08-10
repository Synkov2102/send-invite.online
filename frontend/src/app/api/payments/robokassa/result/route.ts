import { getServerApiBaseUrl } from "@/lib/server-api-base-url";

async function proxyResult(request: Request) {
  const target = new URL("/api/payments/robokassa/result", getServerApiBaseUrl());
  const incoming = new URL(request.url);
  target.search = incoming.search;

  try {
    const response = await fetch(target, {
      body: request.method === "POST" ? await request.text() : undefined,
      cache: "no-store",
      headers:
        request.method === "POST"
          ? {
              "Content-Type":
                request.headers.get("content-type") ?? "application/x-www-form-urlencoded",
            }
          : undefined,
      method: request.method,
    });

    return new Response(response.body, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
      status: response.status,
    });
  } catch (error) {
    // Молчаливый 502 здесь означает потерянный платёж: в логах backend не
    // останется ничего, а Robokassa увидит только код ответа.
    console.error("Robokassa result proxy failed", {
      error: error instanceof Error ? error.message : String(error),
      search: incoming.search,
    });
    return new Response("Payment callback unavailable", { status: 502 });
  }
}

export function GET(request: Request) {
  return proxyResult(request);
}

export function POST(request: Request) {
  return proxyResult(request);
}

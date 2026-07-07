import "server-only";

const defaultApiBaseUrl = "http://localhost:3001";

export function getServerApiBaseUrl() {
  return (
    process.env.BACKEND_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    defaultApiBaseUrl
  ).replace(/\/$/, "");
}

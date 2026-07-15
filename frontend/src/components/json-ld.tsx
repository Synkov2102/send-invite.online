type JsonLdProps = {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
};

/** Serialize JSON-LD for a <script> tag without allowing </script> breakout. */
export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export default function JsonLd({ data }: JsonLdProps) {
  const payload = Array.isArray(data) ? data : [data];

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: serializeJsonLd(payload.length === 1 ? payload[0] : payload),
      }}
      type="application/ld+json"
    />
  );
}

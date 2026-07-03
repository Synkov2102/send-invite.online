export type RobokassaPayload = Record<string, unknown>;

export function readRobokassaField(
  payload: RobokassaPayload,
  ...keys: string[]
): string {
  for (const key of keys) {
    const value = payload[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  const wanted = new Set(keys.map((key) => key.toLowerCase()));

  for (const [key, value] of Object.entries(payload)) {
    if (!wanted.has(key.toLowerCase())) {
      continue;
    }

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return "";
}

export function readRobokassaShpOrder(payload: RobokassaPayload) {
  return readRobokassaField(payload, "Shp_order", "shp_order");
}

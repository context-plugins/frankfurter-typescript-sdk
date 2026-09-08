import type { Param } from "./param-value.js";
import { encodedParam, flattenValue } from "./param-value.js";
import { percentEncode } from "./params.js";
import type { ContentType } from "./request-body.js";

export function buildHeaders(
  contentType: ContentType | undefined,
  layers: ReadonlyArray<readonly Param[] | undefined>,
  cookies?: readonly Param[],
): Headers {
  const merged = new Map<string, string | null>();
  if (contentType !== undefined) merged.set("content-type", contentType);
  for (const layer of layers) {
    for (const source of layer ?? []) {
      const value = encodedParam(source);
      if (value === undefined) continue;
      const parts = flattenValue(value);
      merged.set(source.name.toLowerCase(), parts.length === 0 ? null : parts.join(","));
    }
  }

  const cookie = mergeCookies(merged.get("cookie") ?? undefined, cookies);
  if (cookie !== undefined) merged.set("cookie", cookie);

  const headers = new Headers();
  for (const [name, value] of merged) {
    if (value === null) continue;
    headers.set(name, value);
  }
  return headers;
}

function mergeCookies(
  existing: string | undefined,
  cookies: readonly Param[] | undefined,
): string | undefined {
  if (cookies === undefined || cookies.length === 0) return existing;

  const pairs = new Map<string, string>();
  for (const part of (existing ?? "").split(";")) {
    const trimmed = part.trim();
    const separator = trimmed.indexOf("=");
    if (separator <= 0) continue;
    pairs.set(trimmed.slice(0, separator), trimmed.slice(separator + 1));
  }
  for (const source of cookies) {
    const value = encodedParam(source);
    if (value === undefined) continue;
    pairs.set(source.name, flattenValue(value).map(percentEncode).join(","));
  }

  const merged = [...pairs].map(([name, value]) => `${name}=${value}`).join("; ");
  return merged === "" ? undefined : merged;
}

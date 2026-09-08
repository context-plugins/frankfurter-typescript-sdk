import type { AuthParams, AuthScheme } from "../api-request.js";
import type { BasicAuthCredentials, TokenProvider } from "./credentials.js";
import { SdkError } from "../errors.js";
import * as s from "../validation/index.js";

export const NO_PARAMS: AuthParams = {};

export const noneAuth: AuthScheme = {
  resolve: () => NO_PARAMS,
  hasCredentials: () => false,
};

export function bearerAuth(token: TokenProvider | undefined): AuthScheme {
  return {
    async resolve() {
      const value = await resolveToken(token);
      return value === undefined ? NO_PARAMS : header("Authorization", `Bearer ${value}`);
    },
    hasCredentials: () => hasToken(token),
  };
}

export function basicAuth(credentials: BasicAuthCredentials | undefined): AuthScheme {
  if (credentials !== undefined && credentials.username.includes(":")) {
    throw new SdkError({
      message: "A basic-auth username cannot contain a colon (RFC 7617 section 2).",
    });
  }
  return {
    resolve() {
      if (credentials === undefined) return NO_PARAMS;
      return header("Authorization", basicCredential(credentials.username, credentials.password));
    },
    hasCredentials: () => credentials !== undefined,
  };
}

export function apiKeyHeaderAuth(config: { name: string; token: TokenProvider | undefined }): AuthScheme {
  return {
    async resolve() {
      const value = await resolveToken(config.token);
      return value === undefined ? NO_PARAMS : header(config.name, value);
    },
    hasCredentials: () => hasToken(config.token),
  };
}

export function apiKeyQueryAuth(config: { name: string; token: TokenProvider | undefined }): AuthScheme {
  return {
    async resolve() {
      const value = await resolveToken(config.token);
      if (value === undefined) return NO_PARAMS;
      return { query: [{ name: config.name, value, schema: s.string() }] };
    },
    hasCredentials: () => hasToken(config.token),
  };
}

export function apiKeyCookieAuth(config: { name: string; token: TokenProvider | undefined }): AuthScheme {
  return {
    async resolve() {
      const value = await resolveToken(config.token);
      if (value === undefined) return NO_PARAMS;
      return { cookies: [{ name: config.name, value, schema: s.string() }] };
    },
    hasCredentials: () => hasToken(config.token),
  };
}

export function allAuth(...schemes: readonly AuthScheme[]): AuthScheme {
  return {
    async resolve(signal) {
      const parts: AuthParams[] = [];
      for (const scheme of schemes) parts.push(await scheme.resolve(signal));
      return {
        headers: parts.flatMap((part) => part.headers ?? []),
        query: parts.flatMap((part) => part.query ?? []),
        cookies: parts.flatMap((part) => part.cookies ?? []),
      };
    },
    hasCredentials: () => schemes.length > 0 && schemes.every((scheme) => scheme.hasCredentials()),
    invalidate() {
      for (const scheme of schemes) scheme.invalidate?.();
    },
  };
}

export function anyAuth(...schemes: readonly AuthScheme[]): AuthScheme {
  return {
    resolve(signal) {
      for (const scheme of schemes) {
        if (scheme.hasCredentials()) return scheme.resolve(signal);
      }
      return NO_PARAMS;
    },
    hasCredentials: () => schemes.some((scheme) => scheme.hasCredentials()),
    invalidate() {
      for (const scheme of schemes) scheme.invalidate?.();
    },
  };
}

export function header(name: string, value: string): AuthParams {
  return { headers: [{ name, value, schema: s.string() }] };
}

export function basicCredential(username: string, password: string): string {
  return `Basic ${base64(new TextEncoder().encode(`${username}:${password}`))}`;
}

export function base64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

async function resolveToken(token: TokenProvider | undefined): Promise<string | undefined> {
  return present(typeof token === "function" ? await token() : token);
}

function hasToken(token: TokenProvider | undefined): boolean {
  return typeof token === "function" || present(token) !== undefined;
}

function present(value: string | undefined): string | undefined {
  return value !== undefined && value !== "" ? value : undefined;
}

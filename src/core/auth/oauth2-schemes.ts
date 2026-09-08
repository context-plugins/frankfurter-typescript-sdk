import type { AuthScheme } from "../api-request.js";
import type {
  OAuth2RefreshableTokenStrategy,
  OAuth2TokenStrategy,
  OAuthToken,
  OAuthTokenRefreshable,
} from "./oauth2-strategies.js";
import { NO_PARAMS, header } from "./schemes.js";

const EXPIRY_BUFFER_MS = 30_000;

export function oauth2Scheme<TCredentials>(
  credentials: TCredentials | undefined,
  strategy: OAuth2TokenStrategy<TCredentials>,
): AuthScheme {
  let cached: { token: string; expiresAt: number } | undefined;
  let inflight: Promise<string> | undefined;

  const acquire = (present: TCredentials, signal: AbortSignal): Promise<string> => {
    if (inflight !== undefined) return inflight;

    const run = strategy
      .getToken(present, signal)
      .then((token) => {
        cached = { token: token.accessToken, expiresAt: expiryOf(token) };
        return cached.token;
      })
      .finally(() => {
        inflight = undefined;
      });
    inflight = run;
    return run;
  };

  return {
    async resolve(signal) {
      if (credentials === undefined) return NO_PARAMS;

      const current = cached;
      if (current !== undefined && Date.now() < current.expiresAt) {
        return header("Authorization", `Bearer ${current.token}`);
      }

      const token = await acquire(credentials, signal);
      return header("Authorization", `Bearer ${token}`);
    },
    hasCredentials: () => credentials !== undefined,
    invalidate: () => {
      cached = undefined;
    },
  };
}

export function oauth2RefreshableScheme<TCredentials>(
  credentials: TCredentials | undefined,
  strategy: OAuth2RefreshableTokenStrategy<TCredentials>,
): AuthScheme {
  let cached: { token: OAuthTokenRefreshable; expiresAt: number } | undefined;
  let inflight: Promise<OAuthTokenRefreshable> | undefined;

  const acquire = (present: TCredentials, signal: AbortSignal): Promise<OAuthTokenRefreshable> => {
    if (inflight !== undefined) return inflight;

    const stale = cached?.token.refreshToken;
    const run = renew(strategy, present, stale, signal)
      .then((token) => {
        cached = { token, expiresAt: expiryOf(token) };
        return token;
      })
      .finally(() => {
        inflight = undefined;
      });
    inflight = run;
    return run;
  };

  return {
    async resolve(signal) {
      if (credentials === undefined) return NO_PARAMS;

      const current = cached;
      if (current !== undefined && Date.now() < current.expiresAt) {
        return header("Authorization", `Bearer ${current.token.accessToken}`);
      }

      const token = await acquire(credentials, signal);
      return header("Authorization", `Bearer ${token.accessToken}`);
    },
    hasCredentials: () => credentials !== undefined,
    invalidate: () => {
      cached = undefined;
    },
  };
}

function expiryOf(token: OAuthToken): number {
  if (token.expiresIn === undefined || token.expiresIn <= 0) return Number.POSITIVE_INFINITY;
  return Date.now() + token.expiresIn * 1000 - EXPIRY_BUFFER_MS;
}

async function renew<TCredentials>(
  strategy: OAuth2RefreshableTokenStrategy<TCredentials>,
  credentials: TCredentials,
  refreshToken: string | undefined,
  signal: AbortSignal,
): Promise<OAuthTokenRefreshable> {
  if (refreshToken !== undefined) {
    const refreshed = await strategy.tryRefreshToken(credentials, refreshToken, signal);
    if (refreshed !== null) {
      return refreshed.refreshToken === undefined ? { ...refreshed, refreshToken } : refreshed;
    }
  }
  return strategy.getToken(credentials, signal);
}

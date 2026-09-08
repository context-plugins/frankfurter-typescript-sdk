import type { UrlTemplate } from "../api-request.js";
import type { Param, StyledParam } from "../param-value.js";
import type { RawClient } from "../raw-client.js";
import type { Entry, Schema } from "../validation/schema.js";
import type {
  OAuth2AuthorizationCodeCredentials,
  OAuth2ClientCredentials,
  OAuth2PasswordCredentials,
} from "./credentials.js";
import { PkceMethod } from "./credentials.js";
import { base64, basicCredential, noneAuth } from "./schemes.js";
import { AuthError, CoreError } from "../errors.js";
import { ResponseError } from "../response-error.js";
import { buildUrl } from "../url.js";
import * as s from "../validation/index.js";

/**
 * An OAuth 2.0 token response (RFC 6749 section 5.1).
 *
 * @remarks
 * Wire names are snake_case; these are the decoded SDK names. Returned by an
 * {@link OAuth2TokenStrategy}, and cached by the scheme that owns it until it expires.
 */
export type OAuthToken = {
  /** The token to send in `Authorization`. */
  accessToken: string;

  /** How the token is presented, normally `Bearer`. */
  tokenType: string;

  /**
   * Lifetime in seconds. RECOMMENDED, not required (RFC 6749 section 5.1) — a token with no
   * `expiresIn` is treated as never expiring.
   */
  expiresIn?: number;

  /** Scopes the server actually granted, which may be narrower than those requested. */
  scope?: string;
};

export const oauthTokenSchema: Schema<OAuthToken> = s.object<OAuthToken>({
  accessToken: s.string(),
  tokenType: s.string(),
  expiresIn: s.optional(s.number()),
  scope: s.optional(s.string()),
  _keysMap: {
    accessToken: "access_token",
    tokenType: "token_type",
    expiresIn: "expires_in",
  },
});

/**
 * An OAuth 2.0 token response that may carry a refresh token.
 *
 * @remarks
 * Only the authorization-code grant issues one — RFC 6749 forbids it for the implicit grant and
 * says client-credentials SHOULD NOT issue one.
 */
export type OAuthTokenRefreshable = OAuthToken & {
  /**
   * Issued at the server's discretion (RFC 6749 sections 4.1.4 and 4.3.3). When a refresh response
   * omits it, the previously issued one is carried forward.
   */
  refreshToken?: string;
};

export const oauthTokenRefreshableSchema: Schema<OAuthTokenRefreshable> = s.object<OAuthTokenRefreshable>({
  accessToken: s.string(),
  tokenType: s.string(),
  expiresIn: s.optional(s.number()),
  scope: s.optional(s.string()),
  refreshToken: s.optional(s.string()),
  _keysMap: {
    accessToken: "access_token",
    tokenType: "token_type",
    expiresIn: "expires_in",
    refreshToken: "refresh_token",
  },
});

/**
 * How a token is obtained for a grant. The replaceable half of the OAuth2 design.
 *
 * @remarks
 * The scheme owns caching, single-flight and expiry; a strategy owns only the exchange. Supply one
 * on {@link ClientOptions} to talk to a server whose token endpoint does not follow the built-in
 * shape; the SDK then never builds the request itself.
 */
export type OAuth2TokenStrategy<TCredentials> = {
  getToken(credentials: TCredentials, signal: AbortSignal): Promise<OAuthToken>;
};

/**
 * A token strategy that can also refresh, used by the authorization-code grant.
 *
 * @remarks
 * `tryRefreshToken` returns `null` rather than throwing when the refresh is rejected, which is what
 * makes "refresh failed, re-authorize" a normal path instead of an error path.
 */
export type OAuth2RefreshableTokenStrategy<TCredentials> = {
  getToken(credentials: TCredentials, signal: AbortSignal): Promise<OAuthTokenRefreshable>;
  tryRefreshToken(
    credentials: TCredentials,
    refreshToken: string,
    signal: AbortSignal,
  ): Promise<OAuthTokenRefreshable | null>;
};

/**
 * Where client credentials travel on a token request.
 *
 * @remarks
 * `"header"` sends them as `Authorization: Basic`; `"body"` sends them as form fields, the
 * `client_secret_post` style.
 */
export type OAuth2CredentialPlacement = "header" | "body";

export function oauth2ClientCredentialsStrategy(config: {
  tokenUrl: UrlTemplate;
  rawClient: RawClient;
  placement?: OAuth2CredentialPlacement;
}): OAuth2TokenStrategy<OAuth2ClientCredentials> {
  return {
    getToken(credentials, signal) {
      const placed = placeCredentials(
        config.placement ?? "header",
        credentials.clientId,
        credentials.clientSecret,
      );
      return requestToken(
        config,
        oauthTokenSchema,
        placed.headers,
        [
          { name: "grant_type", value: "client_credentials", schema: s.string() },
          ...scopeField(credentials.scope),
          ...placed.fields,
        ],
        signal,
      );
    },
  };
}

export function oauth2PasswordStrategy(config: {
  tokenUrl: UrlTemplate;
  rawClient: RawClient;
  placement?: OAuth2CredentialPlacement;
}): OAuth2TokenStrategy<OAuth2PasswordCredentials> {
  return {
    getToken(credentials, signal) {
      const placed = placeCredentials(
        config.placement ?? "header",
        credentials.clientId,
        credentials.clientSecret,
      );
      return requestToken(
        config,
        oauthTokenSchema,
        placed.headers,
        [
          { name: "grant_type", value: "password", schema: s.string() },
          { name: "username", value: credentials.username, schema: s.string() },
          { name: "password", value: credentials.password, schema: s.string() },
          ...scopeField(credentials.scope),
          ...placed.fields,
        ],
        signal,
      );
    },
  };
}

export function oauth2AuthorizationCodeStrategy(config: {
  authorizationUrl: UrlTemplate;
  tokenUrl: UrlTemplate;
  rawClient: RawClient;
  placement?: OAuth2CredentialPlacement;
}): OAuth2RefreshableTokenStrategy<OAuth2AuthorizationCodeCredentials> {
  const placementOf = (
    credentials: OAuth2AuthorizationCodeCredentials,
  ): { headers: Param[]; fields: StyledParam[] } =>
    placeCredentials(config.placement ?? "header", credentials.clientId, credentials.clientSecret);

  return {
    async getToken(credentials, signal) {
      const method = credentials.pkce === undefined ? PkceMethod.S256 : credentials.pkce;
      if (method === null && (credentials.clientSecret === undefined || credentials.clientSecret === "")) {
        throw new AuthError({
          message:
            "A client secret is required when PKCE is disabled. Set pkce to PkceMethod.S256 for a public client.",
        });
      }

      const pkce = method === null ? undefined : await generatePkce(method);
      const authorizationUrl = buildUrl(
        config.authorizationUrl,
        undefined,
        authorizationFields(credentials, pkce),
        [],
      ).href;
      const code = await credentials.promptForAuthorizationCode(authorizationUrl, signal);
      const placed = placementOf(credentials);

      return requestToken(
        config,
        oauthTokenRefreshableSchema,
        placed.headers,
        [
          { name: "grant_type", value: "authorization_code", schema: s.string() },
          { name: "code", value: code, schema: s.string() },
          { name: "redirect_uri", value: credentials.redirectUri, schema: s.string() },
          ...(pkce === undefined
            ? []
            : [{ name: "code_verifier", value: pkce.verifier, schema: s.string() }]),
          ...placed.fields,
        ],
        signal,
      );
    },

    async tryRefreshToken(credentials, refreshToken, signal) {
      const placed = placementOf(credentials);
      const outcome = await config.rawClient
        .execute<OAuthTokenRefreshable, ResponseError>(
          {
            method: "POST",
            url: config.tokenUrl,
            auth: noneAuth,
            headers: placed.headers,
            body: {
              kind: "formUrlEncoded",
              value: [
                { name: "grant_type", value: "refresh_token", schema: s.string() },
                { name: "refresh_token", value: refreshToken, schema: s.string() },
                ...placed.fields,
              ],
            },
          },
          {
            success: { kind: "json", schema: oauthTokenRefreshableSchema },
            errorFactory: ResponseError,
          },
          { signal },
        )
        .asApiResult();

      return outcome.ok ? outcome.value : null;
    },
  };
}

function scopeField(scope: string | undefined): StyledParam[] {
  if (scope === undefined || scope === "") return [];
  return [{ name: "scope", value: scope, schema: s.string() }];
}

function placeCredentials(
  placement: OAuth2CredentialPlacement,
  clientId: string,
  clientSecret: string | undefined,
): { headers: Param[]; fields: StyledParam[] } {
  if (placement === "header") {
    return {
      headers: [
        {
          name: "Authorization",
          value: basicCredential(clientId, clientSecret ?? ""),
          schema: s.string(),
        },
      ],
      fields: [],
    };
  }

  const fields: StyledParam[] = [{ name: "client_id", value: clientId, schema: s.string() }];
  if (clientSecret !== undefined) {
    fields.push({ name: "client_secret", value: clientSecret, schema: s.string() });
  }
  return { headers: [], fields };
}

async function requestToken<T>(
  config: { tokenUrl: UrlTemplate; rawClient: RawClient },
  schema: Entry<T>,
  headers: readonly Param[],
  fields: readonly StyledParam[],
  signal: AbortSignal,
): Promise<T> {
  try {
    return await config.rawClient.execute<T, ResponseError>(
      {
        method: "POST",
        url: config.tokenUrl,
        auth: noneAuth,
        headers: [...headers],
        body: { kind: "formUrlEncoded", value: [...fields] },
      },
      {
        success: { kind: "json", schema },
        errorFactory: ResponseError,
      },
      { signal },
    );
  } catch (err) {
    if (err instanceof CoreError) throw err;
    throw new AuthError({ message: "The OAuth2 token request failed.", cause: err });
  }
}

function authorizationFields(
  credentials: OAuth2AuthorizationCodeCredentials,
  pkce: PkceValues | undefined,
): StyledParam[] {
  const fields: StyledParam[] = [
    { name: "response_type", value: "code", schema: s.string() },
    { name: "client_id", value: credentials.clientId, schema: s.string() },
    { name: "redirect_uri", value: credentials.redirectUri, schema: s.string() },
    ...scopeField(credentials.scope),
  ];
  if (credentials.state !== undefined && credentials.state !== "") {
    fields.push({ name: "state", value: credentials.state, schema: s.string() });
  }
  if (pkce !== undefined) {
    fields.push(
      { name: "code_challenge", value: pkce.challenge, schema: s.string() },
      { name: "code_challenge_method", value: pkce.method, schema: s.string() },
    );
  }
  return fields;
}

type PkceValues = { verifier: string; challenge: string; method: PkceMethod };

async function generatePkce(method: PkceMethod): Promise<PkceValues> {
  const entropy = new Uint8Array(32);
  crypto.getRandomValues(entropy);
  const verifier = base64Url(entropy);
  if (method === PkceMethod.Plain) return { verifier, challenge: verifier, method };

  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return { verifier, challenge: base64Url(new Uint8Array(digest)), method };
}

function base64Url(bytes: Uint8Array): string {
  return base64(bytes).replace(/=+$/, "").replaceAll("+", "-").replaceAll("/", "_");
}

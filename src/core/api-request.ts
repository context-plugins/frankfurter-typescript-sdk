import type { RequestBody } from "./request-body.js";
import type { StyledParam, Param } from "./param-value.js";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

export type FetchLike = typeof fetch;

/**
 * Per-call options, the optional second argument of every operation.
 *
 * @remarks
 * Aborting rejects the returned {@link ApiPromise} with an `AbortError`. Everything else —
 * credentials, the server, the timeout — is configured once on the client, not per call.
 */
export type RequestOptions = {
  signal?: AbortSignal;
};

export type RawClientOptions = {
  readonly timeout: number;
  readonly defaultHeaders: readonly Param[];
  readonly defaultQuery: readonly StyledParam[];
  readonly defaultPathParams: readonly Param[];
  readonly fetch?: FetchLike | undefined;
};

export type UrlTemplate = {
  baseUrl: string;
  subPath: string;
  variables?: Record<string, string> | undefined;
};

export type AuthParams = {
  readonly headers?: readonly Param[];
  readonly query?: readonly StyledParam[];
  readonly cookies?: readonly Param[];
};

export type AuthScheme = {
  resolve(signal: AbortSignal): Promise<AuthParams> | AuthParams;
  hasCredentials(): boolean;
  invalidate?(): void;
};

export type ApiRequest = {
  method: HttpMethod;
  url: UrlTemplate;
  auth: AuthScheme;
  pathParams?: Param[] | undefined;
  query?: StyledParam[] | undefined;
  headers?: Param[] | undefined;
  body: RequestBody;
};

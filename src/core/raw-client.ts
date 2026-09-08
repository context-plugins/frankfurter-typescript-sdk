import type { ApiRequest, RequestOptions, RawClientOptions, FetchLike } from "./api-request.js";
import { CoreError, ConnectionError, TimeoutError, AbortError, SdkError } from "./errors.js";
import { decodeErrorPayload, type AnyResponseError, type ResponseHandler } from "./response-error.js";
import { decodeResponse } from "./response-decoder.js";
import { ApiPromise, type RequestOutcome } from "./api-promise.js";
import { buildBody } from "./request-body.js";
import { buildUrl } from "./url.js";
import { buildHeaders } from "./headers.js";

const DEFAULT_TIMEOUT_MS = 100_000;
const MAX_TIMEOUT_MS = 2_147_483_647;

export class RawClient {
  readonly #config: RawClientOptions;
  readonly #fetch: FetchLike;

  constructor(config: RawClientOptions) {
    const fetchImpl = config.fetch ?? globalThis.fetch;
    if (typeof fetchImpl !== "function") {
      throw new SdkError({ message: "No fetch implementation available; pass ClientOptions.fetch." });
    }
    this.#config = config;
    this.#fetch = fetchImpl;
  }

  execute<T, E extends AnyResponseError>(
    apiRequest: ApiRequest,
    responseHandler: ResponseHandler<T, E>,
    options?: RequestOptions,
  ): ApiPromise<T, E> {
    return new ApiPromise<T, E>(this.#dispatch<T, E>(apiRequest, responseHandler, options?.signal));
  }

  async #dispatch<T, E extends AnyResponseError>(
    apiRequest: ApiRequest,
    responseHandler: ResponseHandler<T, E>,
    callerSignal: AbortSignal | undefined,
  ): Promise<RequestOutcome<T, E>> {
    const timeoutMs = resolveTimeout(this.#config.timeout);

    const controller = new AbortController();
    const onCallerAbort = (): void =>
      controller.abort(
        new AbortError({ message: "Request was aborted by the caller.", cause: callerSignal?.reason }),
      );
    callerSignal?.addEventListener("abort", onCallerAbort, { once: true });
    if (callerSignal?.aborted) onCallerAbort();
    const timer = setTimeout(
      () => controller.abort(new TimeoutError({ message: `Request timed out after ${timeoutMs}ms.` })),
      timeoutMs,
    );

    let response: Response;
    try {
      const auth = await apiRequest.auth.resolve(controller.signal);

      const url = buildUrl(
        apiRequest.url,
        apiRequest.pathParams,
        apiRequest.query,
        this.#config.defaultQuery,
        this.#config.defaultPathParams,
        auth.query,
      );
      const body = buildBody(apiRequest.body);
      const headers = buildHeaders(
        body.contentType,
        [this.#config.defaultHeaders, apiRequest.headers, auth.headers],
        auth.cookies,
      );
      const init: RequestInit = { method: apiRequest.method, headers, body: body.body };

      response = await this.#fetch.call(undefined, url, {
        ...init,
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timer);
      callerSignal?.removeEventListener("abort", onCallerAbort);
      if (err instanceof CoreError) throw err;
      if (controller.signal.aborted) throw controller.signal.reason;
      throw new ConnectionError({ message: errorMessage(err, "Connection error."), cause: err });
    }

    if (response.status === 401) apiRequest.auth.invalidate?.();

    const { status, headers: responseHeaders, statusText } = response;
    try {
      if (isSuccess(status)) {
        const data = await decodeResponse(responseHandler.success, response);
        return { ok: true, status, headers: responseHeaders, data };
      }

      const payload = await decodeErrorPayload(response, responseHandler.errorFactory.errors, status);
      const error = new responseHandler.errorFactory({
        status,
        headers: responseHeaders,
        message: statusMessage(status, statusText),
        payload,
      });

      return { ok: false, status, headers: responseHeaders, error };
    } catch (err) {
      if (err instanceof CoreError) throw err;
      throw new SdkError({ message: errorMessage(err, "Response handling failed."), cause: err });
    } finally {
      clearTimeout(timer);
      callerSignal?.removeEventListener("abort", onCallerAbort);
    }
  }
}

function resolveTimeout(configured: number): number {
  if (!Number.isFinite(configured) || configured <= 0) return DEFAULT_TIMEOUT_MS;
  return Math.min(configured, MAX_TIMEOUT_MS);
}

function isSuccess(status: number): boolean {
  return status >= 200 && status <= 299;
}

function statusMessage(status: number, statusText: string): string {
  return `${status} ${statusText || "HTTP error"}`;
}

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

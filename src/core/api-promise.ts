import type { AnyResponseError, PayloadOf } from "./response-error.js";

export type RequestOutcome<T, E extends AnyResponseError> =
  | { ok: true; status: number; headers: Headers; data: T }
  | { ok: false; status: number; headers: Headers; error: E };

/**
 * The non-throwing view of a call, returned by {@link ApiPromise.asApiResult}.
 *
 * @remarks
 * Narrow on `ok`. Both branches carry the HTTP `status` and response `headers`, so a failure stays
 * inspectable without a `catch`. On the failure branch `error` is the error **payload**, not the
 * error instance — narrow it further on `error.kind`, which is the arm name the operation's error
 * class declares for a status the spec describes, and `"undeclared"` for one it does not.
 */
export type ApiResult<T, E extends AnyResponseError> =
  | { ok: true; status: number; headers: Headers; value: T }
  | { ok: false; status: number; headers: Headers; errorMessage: string; error: PayloadOf<E> };

/**
 * The promise every operation returns: resolves with `T`, rejects with `E`.
 *
 * @remarks
 * It is a real `Promise`, so `await`, `.then` and `Promise.all` all work. Awaiting it throws the
 * operation's error class on failure. Call {@link ApiPromise.asApiResult} instead to get a
 * non-throwing {@link ApiResult} carrying the status and headers alongside the value.
 */
export class ApiPromise<T, E extends AnyResponseError> extends Promise<T> {
  readonly #outcome: Promise<RequestOutcome<T, E>>;

  constructor(outcome: Promise<RequestOutcome<T, E>>) {
    super((resolve, reject) => {
      outcome.then((o) => (o.ok ? resolve(o.data) : reject(o.error)), reject);
    });
    this.#outcome = outcome;

    this.catch(() => {});
  }

  static override get [Symbol.species](): PromiseConstructor {
    return Promise;
  }

  /**
   * Resolves to an {@link ApiResult} instead of throwing, and never rejects for an API error.
   *
   * @remarks
   * This is also the only way to reach the HTTP status and response headers of a successful call.
   * Transport faults — a dropped connection, a timeout, an abort — still reject, because there is
   * no response to report.
   */
  async asApiResult(): Promise<ApiResult<T, E>> {
    const o = await this.#outcome;
    return o.ok
      ? {
          ok: true,
          value: o.data,
          status: o.status,
          headers: o.headers,
        }
      : {
          ok: false,
          error: o.error.payload as PayloadOf<E>,
          errorMessage: o.error.message,
          status: o.error.status,
          headers: o.headers,
        };
  }
}

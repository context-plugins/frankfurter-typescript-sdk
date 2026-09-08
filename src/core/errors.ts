/** Discriminant of the {@link CoreError} family. Closed, so a `switch` over it is exhaustive. */
export type ErrorKind = "connection" | "timeout" | "abort" | "sdk" | "schema" | "auth";

/**
 * Root of the failures that never produced a usable response. Exported as `AcmeError`.
 *
 * @remarks
 * The SDK has **two disjoint error families** and neither is `instanceof` the other, so the two
 * `catch` branches can never overlap. This one covers everything that never reached a usable
 * response — a dropped connection, a timeout, an abort, an SDK bug, a body that failed to decode,
 * or auth that could not be obtained. `ResponseError` covers the answers the API itself gave.
 *
 * Narrow with `instanceof` on a leaf, or exhaustively on `err.kind`.
 */
export abstract class CoreError extends Error {
  abstract readonly kind: ErrorKind;

  protected constructor(message: string, options?: { cause?: unknown }) {
    super(message, options?.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Constructor input shared by every {@link CoreError} leaf. */
export type TransportErrorInit = { message: string; cause?: unknown };

/**
 * The request never completed at the transport layer, or the response body could not
 * be read.
 */
export class ConnectionError extends CoreError {
  readonly kind = "connection" as const;
  constructor(init: TransportErrorInit) {
    super(init.message, init.cause !== undefined ? { cause: init.cause } : undefined);
  }
}

/**
 * The request exceeded the client timeout. The budget covers auth resolution as well as
 * the call itself.
 */
export class TimeoutError extends CoreError {
  readonly kind = "timeout" as const;
  constructor(init: TransportErrorInit) {
    super(init.message, init.cause !== undefined ? { cause: init.cause } : undefined);
  }
}

/**
 * The caller aborted the request through the `AbortSignal` passed in `RequestOptions`.
 */
export class AbortError extends CoreError {
  readonly kind = "abort" as const;
  constructor(init: TransportErrorInit) {
    super(init.message, init.cause !== undefined ? { cause: init.cause } : undefined);
  }
}

/**
 * The SDK itself is at fault — a malformed request it built, or a decoder that threw
 * something other than a schema failure. Report it.
 */
export class SdkError extends CoreError {
  readonly kind = "sdk" as const;
  constructor(init: TransportErrorInit) {
    super(init.message, init.cause !== undefined ? { cause: init.cause } : undefined);
  }
}

/**
 * A credential could not be obtained: a token request failed, a scheme is misconfigured,
 * or every branch of an `anyAuth` failed. Distinct from a 401, which is a `ResponseError`.
 */
export class AuthError extends CoreError {
  readonly kind = "auth" as const;
  constructor(init: TransportErrorInit) {
    super(init.message, init.cause !== undefined ? { cause: init.cause } : undefined);
  }
}

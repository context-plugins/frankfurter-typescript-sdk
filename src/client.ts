import { DEFAULT_CLIENT_OPTIONS, type ClientOptions } from "./client-options.js";
import type { ApiPromise } from "./core/api-promise.js";
import type { RequestOptions } from "./core/api-request.js";
import { noneAuth } from "./core/auth/schemes.js";
import { RawClient } from "./core/raw-client.js";
import { ResponseError, type Declared, type ErrorDecoders } from "./core/response-error.js";
import * as s from "./core/validation/index.js";
import { currencyDetailSchema, type CurrencyDetail } from "./models/currency-detail.js";
import { currencySchema, type Currency } from "./models/currency.js";
import { expandSchema, type Expand } from "./models/expand.js";
import { groupSchema, type Group } from "./models/group.js";
import { notFound1Schema, type NotFound1 } from "./models/not-found1.js";
import { providerSchema, type Provider } from "./models/provider.js";
import { rateSchema, type Rate } from "./models/rate.js";
import { scopeSchema, type Scope } from "./models/scope.js";
import { serviceUnavailable1Schema, type ServiceUnavailable1 } from "./models/service-unavailable1.js";
import { unprocessableEntity1Schema, type UnprocessableEntity1 } from "./models/unprocessable-entity1.js";
import { buildServers, type Servers } from "./servers.js";

/**
 * Frankfurter is an open-source API for current and historical foreign exchange rates published by
 * central banks.
 */
export class FrankfurterApiClient {
  readonly #rawClient: RawClient;
  readonly #servers: Servers;

  constructor(clientOptions: Partial<ClientOptions> = {}) {
    const options = { ...DEFAULT_CLIENT_OPTIONS, ...clientOptions };

    this.#rawClient = new RawClient({
      timeout: options.timeout,
      defaultHeaders: [],
      defaultQuery: [],
      defaultPathParams: [],
      fetch: options.fetch,
    });

    this.#servers = buildServers(options.serverEnvironment, options.serverOptions);
  }

  /**
   * Get available currencies
   *
   * @remarks
   * Returns available currencies with their names and date ranges. By default, only active
   * currencies are included.
   *
   * @returns Available currencies
   *
   * @throws {@link ResponseError} when the API answers with an error status
   *
   * @throws {@link FrankfurterApiError} when no usable response was produced: a connection failure,
   * a timeout, an abort, a schema violation, or a credential that could not be obtained
   */
  getCurrencies(
    request: FrankfurterApiClient.GetCurrenciesRequest,
    options?: RequestOptions,
  ): ApiPromise<Currency[], ResponseError> {
    return this.#rawClient.execute<Currency[], ResponseError>(
      {
        method: "GET",
        url: this.#servers.default("/currencies"),
        auth: noneAuth,
        query: [
          { name: "scope", value: request.scope, schema: s.optional(s.lazy(() => scopeSchema)) },
          { name: "providers", value: request.providers, schema: s.optional(s.string()) },
        ],
        body: { kind: "empty" },
      },
      {
        success: { kind: "json", schema: s.array(s.lazy(() => currencySchema)) },
        errorFactory: ResponseError,
      },
      options,
    );
  }

  /**
   * Get a single currency
   *
   * @remarks
   * Returns details for a single currency, including provider information or peg metadata.
   *
   * @returns Currency details
   *
   * @throws {@link FrankfurterApiClient.GetCurrencyError} when the API answers with an error status
   * — narrow on `err.payload.kind`
   *
   * @throws {@link FrankfurterApiError} when no usable response was produced: a connection failure,
   * a timeout, an abort, a schema violation, or a credential that could not be obtained
   */
  getCurrency(
    request: FrankfurterApiClient.GetCurrencyRequest,
    options?: RequestOptions,
  ): ApiPromise<CurrencyDetail, FrankfurterApiClient.GetCurrencyError> {
    return this.#rawClient.execute(
      {
        method: "GET",
        url: this.#servers.default("/currency/{code}"),
        auth: noneAuth,
        pathParams: [{ name: "code", value: request.code, schema: s.string() }],
        body: { kind: "empty" },
      },
      {
        success: { kind: "json", schema: currencyDetailSchema },
        errorFactory: FrankfurterApiClient.GetCurrencyError,
      },
      options,
    );
  }

  /**
   * Get available data providers
   *
   * @remarks
   * Returns available exchange rate data providers with their base currency.
   *
   * @returns Available providers
   *
   * @throws {@link ResponseError} when the API answers with an error status
   *
   * @throws {@link FrankfurterApiError} when no usable response was produced: a connection failure,
   * a timeout, an abort, a schema violation, or a credential that could not be obtained
   */
  getProviders(options?: RequestOptions): ApiPromise<Provider[], ResponseError> {
    return this.#rawClient.execute<Provider[], ResponseError>(
      {
        method: "GET",
        url: this.#servers.default("/providers"),
        auth: noneAuth,
        body: { kind: "empty" },
      },
      {
        success: { kind: "json", schema: s.array(s.lazy(() => providerSchema)) },
        errorFactory: ResponseError,
      },
      options,
    );
  }

  /**
   * Get a single exchange rate pair
   *
   * @remarks
   * Returns the blended exchange rate for a single currency pair. Without a date param, returns the
   * latest rate. A same-currency pair returns the identity rate of 1.
   *
   * @returns Exchange rate
   *
   * @throws {@link FrankfurterApiClient.GetRateError} when the API answers with an error status —
   * narrow on `err.payload.kind`
   *
   * @throws {@link FrankfurterApiError} when no usable response was produced: a connection failure,
   * a timeout, an abort, a schema violation, or a credential that could not be obtained
   */
  getRate(
    request: FrankfurterApiClient.GetRateRequest,
    options?: RequestOptions,
  ): ApiPromise<Rate, FrankfurterApiClient.GetRateError> {
    return this.#rawClient.execute(
      {
        method: "GET",
        url: this.#servers.default("/rate/{base}/{quote}"),
        auth: noneAuth,
        pathParams: [
          { name: "base", value: request.base, schema: s.string() },
          { name: "quote", value: request.quote, schema: s.string() },
        ],
        query: [
          { name: "date", value: request.date, schema: s.optional(s.dateOnly()) },
          { name: "providers", value: request.providers, schema: s.optional(s.string()) },
        ],
        body: { kind: "empty" },
      },
      {
        success: { kind: "json", schema: rateSchema },
        errorFactory: FrankfurterApiClient.GetRateError,
      },
      options,
    );
  }

  /**
   * Get exchange rates
   *
   * @remarks
   * Returns exchange rates blended across providers. Without date params, returns the latest rates.
   * Each record is a single currency pair. The response includes an identity record for the base
   * currency (base equals quote, rate 1), subject to the quotes filter like any other record. Daily
   * date ranges of any length are served, including full history. Limit: requests using `providers`
   * or `expand=providers` recompute the blend per date, so at daily granularity they return 422 for
   * ranges longer than 5 years. With `providers` naming at most 5 providers, a `quotes` list of at
   * most 5 currencies lifts the cap; without `providers`, `expand=providers` ranges compute every
   * currency regardless of `quotes`, so aggregate with `group=week` or `group=month`, add
   * `providers`, or split the range into shorter requests.
   *
   * @returns Exchange rates
   *
   * @throws {@link FrankfurterApiClient.GetRatesError} when the API answers with an error status —
   * narrow on `err.payload.kind`
   *
   * @throws {@link FrankfurterApiError} when no usable response was produced: a connection failure,
   * a timeout, an abort, a schema violation, or a credential that could not be obtained
   */
  getRates(
    request: FrankfurterApiClient.GetRatesRequest,
    options?: RequestOptions,
  ): ApiPromise<Rate[], FrankfurterApiClient.GetRatesError> {
    return this.#rawClient.execute(
      {
        method: "GET",
        url: this.#servers.default("/rates"),
        auth: noneAuth,
        query: [
          { name: "date", value: request.date, schema: s.optional(s.dateOnly()) },
          { name: "from", value: request.from, schema: s.optional(s.dateOnly()) },
          { name: "to", value: request.to, schema: s.optional(s.dateOnly()) },
          { name: "base", value: request.base, schema: s.defaulted(s.string(), "EUR") },
          { name: "quotes", value: request.quotes, schema: s.optional(s.string()) },
          { name: "providers", value: request.providers, schema: s.optional(s.string()) },
          { name: "group", value: request.group, schema: s.optional(s.lazy(() => groupSchema)) },
          { name: "expand", value: request.expand, schema: s.optional(s.lazy(() => expandSchema)) },
        ],
        body: { kind: "empty" },
      },
      {
        success: { kind: "json", schema: s.array(s.lazy(() => rateSchema)) },
        errorFactory: FrankfurterApiClient.GetRatesError,
      },
      options,
    );
  }
}

export namespace FrankfurterApiClient {
  export type GetCurrenciesRequest = {
    /** Set to 'all' to include legacy currencies */
    scope?: Scope;
    /** Comma-separated list of data providers to include */
    providers?: string;
  };

  export type GetCurrencyRequest = {
    code: string;
  };

  export class GetCurrencyError extends ResponseError<Declared<"notFound1", NotFound1>> {
    static readonly errors: ErrorDecoders<GetCurrencyError> = [
      { on: 404, kind: "notFound1", decode: { kind: "json", schema: notFound1Schema } },
    ];
  }

  export type GetRateRequest = {
    base: string;
    quote: string;
    /** Specific date (YYYY-MM-DD). Cannot be combined with from/to. */
    date?: string;
    /** Comma-separated list of data providers to include */
    providers?: string;
  };

  export class GetRateError extends ResponseError<
    | Declared<"unprocessableEntity1", UnprocessableEntity1>
    | Declared<"notFound1", NotFound1>
    | Declared<"serviceUnavailable1", ServiceUnavailable1>
  > {
    static readonly errors: ErrorDecoders<GetRateError> = [
      { on: 422, kind: "unprocessableEntity1", decode: { kind: "json", schema: unprocessableEntity1Schema } },
      { on: 404, kind: "notFound1", decode: { kind: "json", schema: notFound1Schema } },
      { on: 503, kind: "serviceUnavailable1", decode: { kind: "json", schema: serviceUnavailable1Schema } },
    ];
  }

  export type GetRatesRequest = {
    /** Specific date (YYYY-MM-DD). Cannot be combined with from/to. */
    date?: string;
    /** Start of date range (YYYY-MM-DD) */
    from?: string;
    /** End of date range (YYYY-MM-DD). Defaults to today. */
    to?: string;
    /** Base currency (default: EUR) @default "EUR" */
    base?: string;
    /** Comma-separated list of quote currencies to include */
    quotes?: string;
    /** Comma-separated list of data providers to include */
    providers?: string;
    /** Downsample rates by time period. Only applies to date ranges. */
    group?: Group;
    /**
     * Comma-separated list of optional fields to include per record. Currently supports
     * `providers`, which adds an array of `{ key, date, rate }` objects per record showing each
     * provider's individual observation date and rate. Outliers excluded from the blend (and
     * providers whose rate was overridden by a currency peg) are flagged with `excluded: true`. The
     * field is omitted on synthesized peg rows where no provider published the quote. In CSV
     * output, the `providers` column is encoded as `KEY:RATE` pairs joined by `|`, with a trailing
     * `*` on excluded entries (e.g. `ECB:0.92|FED:1.50*`).
     */
    expand?: Expand;
  };

  export class GetRatesError extends ResponseError<
    | Declared<"unprocessableEntity1", UnprocessableEntity1>
    | Declared<"notFound1", NotFound1>
    | Declared<"serviceUnavailable1", ServiceUnavailable1>
  > {
    static readonly errors: ErrorDecoders<GetRatesError> = [
      { on: 422, kind: "unprocessableEntity1", decode: { kind: "json", schema: unprocessableEntity1Schema } },
      { on: 404, kind: "notFound1", decode: { kind: "json", schema: notFound1Schema } },
      { on: 503, kind: "serviceUnavailable1", decode: { kind: "json", schema: serviceUnavailable1Schema } },
    ];
  }
}

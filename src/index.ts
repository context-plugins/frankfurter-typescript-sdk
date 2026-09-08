export { FrankfurterApiClient } from "./client.js";
export { DEFAULT_CLIENT_OPTIONS, type ClientOptions } from "./client-options.js";

export { ServerEnvironment, DEFAULT_SERVER_OPTIONS } from "./servers.js";
export type { ServerOptions, DefaultServerOptions } from "./servers.js";

export { currencySchema, type Currency } from "./models/currency.js";
export { currencyDetailSchema, type CurrencyDetail } from "./models/currency-detail.js";
export { notFoundSchema, type NotFound } from "./models/not-found.js";
export { notFound1Schema, type NotFound1 } from "./models/not-found1.js";
export { pegSchema, type Peg } from "./models/peg.js";
export { providerSchema, type Provider } from "./models/provider.js";
export { provider2Schema, type Provider2 } from "./models/provider2.js";
export { PublishCadence, publishCadenceSchema } from "./models/publish-cadence.js";
export { rateSchema, type Rate } from "./models/rate.js";
export { serviceUnavailableSchema, type ServiceUnavailable } from "./models/service-unavailable.js";
export { serviceUnavailable1Schema, type ServiceUnavailable1 } from "./models/service-unavailable1.js";
export { unprocessableEntitySchema, type UnprocessableEntity } from "./models/unprocessable-entity.js";
export { unprocessableEntity1Schema, type UnprocessableEntity1 } from "./models/unprocessable-entity1.js";
export { Expand, expandSchema } from "./models/expand.js";
export { Group, groupSchema } from "./models/group.js";
export { Scope, scopeSchema } from "./models/scope.js";

export {
  CoreError as FrankfurterApiError,
  ConnectionError,
  TimeoutError,
  AbortError,
  SdkError,
  AuthError,
} from "./core/errors.js";
export { ResponseError } from "./core/response-error.js";
export { SchemaError } from "./core/validation/schema-error.js";
export type { ApiPromise, ApiResult } from "./core/api-promise.js";
export type { RequestOptions } from "./core/api-request.js";
export type { ErrorKind } from "./core/errors.js";
export type { ErrorPayload, Declared, Undeclared } from "./core/response-error.js";
export type { Schema, EnumSchema, Encoded } from "./core/validation/schema.js";

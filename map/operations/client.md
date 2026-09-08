<!-- Generated file — do not edit; regenerated with the SDK. -->

# FrankfurterApiClient — ungrouped operations

Accessor: `client` (the client itself) · Source: `src/client.ts` · 5 operations · Request and error types: namespace `FrankfurterApiClient`

Operations the spec leaves untagged are methods on the client rather than on a resource, so there is no accessor property to go through. The request type still lives in a namespace merged onto the exported class, so you write `FrankfurterApiClient.GetCurrenciesRequest`.

**Type sources**: every type an operation names, with the file that declares it and the schema value exported beside it. Import every name from `frankfurter-api`; the `Source` path is where to **read** the shape, never what to import. `ResponseError` and the runtime error family are excluded — see sdk-map.md.

### getCurrencies

- **Signature**: `getCurrencies(request: FrankfurterApiClient.GetCurrenciesRequest, options?: RequestOptions): ApiPromise<Currency[], ResponseError>`
- **Wire**: `GET /currencies`
- **Auth**: none — public; no credential is sent
- **Request body**: none — no `Content-Type` header is sent
- **Returns**: `Currency[]` — a bare `application/json` array; the success type *is* the array, not a wrapper model
- **Error**: `ResponseError` — untyped, `payload.kind` always `"undeclared"`

**Fields** — `FrankfurterApiClient.GetCurrenciesRequest` (2):

| Field | Channel | Type | Req |
| --- | --- | --- | --- |
| `scope` | `query` | `Scope` | no |
| `providers` | `query` | `string` | no |

| Type | Schema value | Source |
| --- | --- | --- |
| `Scope` | `scopeSchema` | `src/models/scope.ts` |
| `Currency` | `currencySchema` | `src/models/currency.ts` |

### getCurrency

- **Signature**: `getCurrency(request: FrankfurterApiClient.GetCurrencyRequest, options?: RequestOptions): ApiPromise<CurrencyDetail, FrankfurterApiClient.GetCurrencyError>`
- **Wire**: `GET /currency/{code}`
- **Auth**: none — public; no credential is sent
- **Request body**: none — no `Content-Type` header is sent
- **Returns**: `CurrencyDetail`
- **Error**: `FrankfurterApiClient.GetCurrencyError` — **typed arms**, narrowed on `err.payload.kind`
- **Error arms**: `"notFound1"` [404] `NotFound1` · `"undeclared"` [any other] `rawBody: ArrayBuffer`

**Fields** — `FrankfurterApiClient.GetCurrencyRequest` (1):

| Field | Channel | Type | Req |
| --- | --- | --- | --- |
| `code` | `path` | `string` | yes |

| Type | Schema value | Source |
| --- | --- | --- |
| `CurrencyDetail` | `currencyDetailSchema` | `src/models/currency-detail.ts` |
| `NotFound1` | `notFound1Schema` | `src/models/not-found1.ts` |

### getProviders

- **Signature**: `getProviders(options?: RequestOptions): ApiPromise<Provider[], ResponseError>`
- **Wire**: `GET /providers`
- **Auth**: none — public; no credential is sent
- **Request body**: none — no `Content-Type` header is sent
- **Returns**: `Provider[]` — a bare `application/json` array; the success type *is* the array, not a wrapper model
- **Error**: `ResponseError` — untyped, `payload.kind` always `"undeclared"`

| Type | Schema value | Source |
| --- | --- | --- |
| `Provider` | `providerSchema` | `src/models/provider.ts` |

### getRate

- **Signature**: `getRate(request: FrankfurterApiClient.GetRateRequest, options?: RequestOptions): ApiPromise<Rate, FrankfurterApiClient.GetRateError>`
- **Wire**: `GET /rate/{base}/{quote}`
- **Auth**: none — public; no credential is sent
- **Request body**: none — no `Content-Type` header is sent
- **Returns**: `Rate`
- **Error**: `FrankfurterApiClient.GetRateError` — **typed arms**, narrowed on `err.payload.kind`
- **Error arms**: `"unprocessableEntity1"` [422] `UnprocessableEntity1` · `"notFound1"` [404] `NotFound1` · `"serviceUnavailable1"` [503] `ServiceUnavailable1` · `"undeclared"` [any other] `rawBody: ArrayBuffer`

**Fields** — `FrankfurterApiClient.GetRateRequest` (4):

| Field | Channel | Type | Req |
| --- | --- | --- | --- |
| `base` | `path` | `string` | yes |
| `quote` | `path` | `string` | yes |
| `date` | `query` | `string` (date) | no |
| `providers` | `query` | `string` | no |

| Type | Schema value | Source |
| --- | --- | --- |
| `Rate` | `rateSchema` | `src/models/rate.ts` |
| `UnprocessableEntity1` | `unprocessableEntity1Schema` | `src/models/unprocessable-entity1.ts` |
| `NotFound1` | `notFound1Schema` | `src/models/not-found1.ts` |
| `ServiceUnavailable1` | `serviceUnavailable1Schema` | `src/models/service-unavailable1.ts` |

### getRates

- **Signature**: `getRates(request: FrankfurterApiClient.GetRatesRequest, options?: RequestOptions): ApiPromise<Rate[], FrankfurterApiClient.GetRatesError>`
- **Wire**: `GET /rates`
- **Auth**: none — public; no credential is sent
- **Request body**: none — no `Content-Type` header is sent
- **Returns**: `Rate[]` — a bare `application/json` array; the success type *is* the array, not a wrapper model
- **Error**: `FrankfurterApiClient.GetRatesError` — **typed arms**, narrowed on `err.payload.kind`
- **Error arms**: `"unprocessableEntity1"` [422] `UnprocessableEntity1` · `"notFound1"` [404] `NotFound1` · `"serviceUnavailable1"` [503] `ServiceUnavailable1` · `"undeclared"` [any other] `rawBody: ArrayBuffer`

**Fields** — `FrankfurterApiClient.GetRatesRequest` (8):

| Field | Channel | Type | Req | Default |
| --- | --- | --- | --- | --- |
| `date` | `query` | `string` (date) | no | — |
| `from` | `query` | `string` (date) | no | — |
| `to` | `query` | `string` (date) | no | — |
| `base` | `query` | `string` | no | `"EUR"` |
| `quotes` | `query` | `string` | no | — |
| `providers` | `query` | `string` | no | — |
| `group` | `query` | `Group` | no | — |
| `expand` | `query` | `Expand` | no | — |

| Type | Schema value | Source |
| --- | --- | --- |
| `Group` | `groupSchema` | `src/models/group.ts` |
| `Expand` | `expandSchema` | `src/models/expand.ts` |
| `Rate` | `rateSchema` | `src/models/rate.ts` |
| `UnprocessableEntity1` | `unprocessableEntity1Schema` | `src/models/unprocessable-entity1.ts` |
| `NotFound1` | `notFound1Schema` | `src/models/not-found1.ts` |
| `ServiceUnavailable1` | `serviceUnavailable1Schema` | `src/models/service-unavailable1.ts` |


# Reference

> Source: [FrankfurterApiClient](src/client.ts)

<details>
<summary><code>getCurrencies(request: FrankfurterApiClient.GetCurrenciesRequest, options?: RequestOptions): ApiPromise&lt;Currency[], ResponseError&gt;</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Returns available currencies with their names and date ranges. By default, only active currencies are included.

</dd>
</dl>

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.getCurrencies();
  // TODO: Handle 'response' of type Currency[]
} catch (err) {
  // TODO: Handle 'err' of type ResponseError, where 'err.payload' is of type Undeclared
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.getCurrencies().asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type Currency[]
} else {
  // TODO: Use 'result.errorMessage' and 'result.error' of type Undeclared
}
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>scope?</code> | <code>[Scope](src/models/scope.ts)</code> | Set to 'all' to include legacy currencies |
| <code>providers?</code> | <code>string</code> | Comma-separated list of data providers to include |

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.getCurrencies(request)`

- **OnSuccess**: <code>[Currency](src/models/currency.ts)[]</code>
- **OnError**: throws <code>[ResponseError](src/core/response-error.ts)</code>, with `err.payload` of type <code>[Undeclared](src/core/response-error.ts)</code>

**As ApiResult**: `await client.getCurrencies(request).asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;Currency[], ResponseError&gt;</code>, with `result.value` of type <code>[Currency](src/models/currency.ts)[]</code>
- **OnError**: `result.error` of type <code>[Undeclared](src/core/response-error.ts)</code>, with `result.errorMessage`

**Always thrown**: <code>[FrankfurterApiError](src/core/errors.ts)</code>

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>getCurrency(request: FrankfurterApiClient.GetCurrencyRequest, options?: RequestOptions): ApiPromise&lt;CurrencyDetail, FrankfurterApiClient.GetCurrencyError&gt;</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Returns details for a single currency, including provider information or peg metadata.

</dd>
</dl>

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.getCurrency({ code });
  // TODO: Handle 'response' of type CurrencyDetail
} catch (err) {
  // TODO: Handle 'err' of type FrankfurterApiClient.GetCurrencyError, discriminated with 'err.payload.kind'
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.getCurrency({ code }).asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type CurrencyDetail
} else {
  // TODO: Use 'result.errorMessage' and 'result.error', discriminated with 'result.error.kind'
}
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>code</code> | <code>string</code> | - |

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.getCurrency(request)`

- **OnSuccess**: <code>[CurrencyDetail](src/models/currency-detail.ts)</code>
- **OnError**: throws <code>[FrankfurterApiClient.GetCurrencyError](src/client.ts)</code>, with `err.payload` discriminated on `kind`

**As ApiResult**: `await client.getCurrency(request).asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;CurrencyDetail, FrankfurterApiClient.GetCurrencyError&gt;</code>, with `result.value` of type <code>[CurrencyDetail](src/models/currency-detail.ts)</code>
- **OnError**: `result.error` discriminated on `kind`, with `result.errorMessage`

**Always thrown**: <code>[FrankfurterApiError](src/core/errors.ts)</code>

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>getProviders(options?: RequestOptions): ApiPromise&lt;Provider[], ResponseError&gt;</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Returns available exchange rate data providers with their base currency.

</dd>
</dl>

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.getProviders();
  // TODO: Handle 'response' of type Provider[]
} catch (err) {
  // TODO: Handle 'err' of type ResponseError, where 'err.payload' is of type Undeclared
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.getProviders().asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type Provider[]
} else {
  // TODO: Use 'result.errorMessage' and 'result.error' of type Undeclared
}
```

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.getProviders()`

- **OnSuccess**: <code>[Provider](src/models/provider.ts)[]</code>
- **OnError**: throws <code>[ResponseError](src/core/response-error.ts)</code>, with `err.payload` of type <code>[Undeclared](src/core/response-error.ts)</code>

**As ApiResult**: `await client.getProviders().asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;Provider[], ResponseError&gt;</code>, with `result.value` of type <code>[Provider](src/models/provider.ts)[]</code>
- **OnError**: `result.error` of type <code>[Undeclared](src/core/response-error.ts)</code>, with `result.errorMessage`

**Always thrown**: <code>[FrankfurterApiError](src/core/errors.ts)</code>

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>getRate(request: FrankfurterApiClient.GetRateRequest, options?: RequestOptions): ApiPromise&lt;Rate, FrankfurterApiClient.GetRateError&gt;</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Returns the blended exchange rate for a single currency pair. Without a date param, returns the latest rate. A same-currency pair returns the identity rate of 1.

</dd>
</dl>

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.getRate({ base, quote });
  // TODO: Handle 'response' of type Rate
} catch (err) {
  // TODO: Handle 'err' of type FrankfurterApiClient.GetRateError, discriminated with 'err.payload.kind'
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.getRate({ base, quote }).asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type Rate
} else {
  // TODO: Use 'result.errorMessage' and 'result.error', discriminated with 'result.error.kind'
}
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>base</code> | <code>string</code> | - |
| <code>quote</code> | <code>string</code> | - |
| <code>date?</code> | <code>string</code> (date) | Specific date (YYYY-MM-DD). Cannot be combined with from/to. |
| <code>providers?</code> | <code>string</code> | Comma-separated list of data providers to include |

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.getRate(request)`

- **OnSuccess**: <code>[Rate](src/models/rate.ts)</code>
- **OnError**: throws <code>[FrankfurterApiClient.GetRateError](src/client.ts)</code>, with `err.payload` discriminated on `kind`

**As ApiResult**: `await client.getRate(request).asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;Rate, FrankfurterApiClient.GetRateError&gt;</code>, with `result.value` of type <code>[Rate](src/models/rate.ts)</code>
- **OnError**: `result.error` discriminated on `kind`, with `result.errorMessage`

**Always thrown**: <code>[FrankfurterApiError](src/core/errors.ts)</code>

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>getRates(request: FrankfurterApiClient.GetRatesRequest, options?: RequestOptions): ApiPromise&lt;Rate[], FrankfurterApiClient.GetRatesError&gt;</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Returns exchange rates blended across providers. Without date params, returns the latest rates. Each record is a single currency pair. The response includes an identity record for the base currency (base equals quote, rate 1), subject to the quotes filter like any other record. Daily date ranges of any length are served, including full history. Limit: requests using `providers` or `expand=providers` recompute the blend per date, so at daily granularity they return 422 for ranges longer than 5 years. With `providers` naming at most 5 providers, a `quotes` list of at most 5 currencies lifts the cap; without `providers`, `expand=providers` ranges compute every currency regardless of `quotes`, so aggregate with `group=week` or `group=month`, add `providers`, or split the range into shorter requests.

</dd>
</dl>

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.getRates();
  // TODO: Handle 'response' of type Rate[]
} catch (err) {
  // TODO: Handle 'err' of type FrankfurterApiClient.GetRatesError, discriminated with 'err.payload.kind'
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.getRates().asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type Rate[]
} else {
  // TODO: Use 'result.errorMessage' and 'result.error', discriminated with 'result.error.kind'
}
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>date?</code> | <code>string</code> (date) | Specific date (YYYY-MM-DD). Cannot be combined with from/to. |
| <code>from?</code> | <code>string</code> (date) | Start of date range (YYYY-MM-DD) |
| <code>to?</code> | <code>string</code> (date) | End of date range (YYYY-MM-DD). Defaults to today. |
| <code>base?</code> | <code>string</code> | Base currency (default: EUR)<br>**Default**: "EUR" |
| <code>quotes?</code> | <code>string</code> | Comma-separated list of quote currencies to include |
| <code>providers?</code> | <code>string</code> | Comma-separated list of data providers to include |
| <code>group?</code> | <code>[Group](src/models/group.ts)</code> | Downsample rates by time period. Only applies to date ranges. |
| <code>expand?</code> | <code>[Expand](src/models/expand.ts)</code> | Comma-separated list of optional fields to include per record. Currently supports `providers`, which adds an array of `{ key, date, rate }` objects per record showing each provider's individual observation date and rate. Outliers excluded from the blend (and providers whose rate was overridden by a currency peg) are flagged with `excluded: true`. The field is omitted on synthesized peg rows where no provider published the quote. In CSV output, the `providers` column is encoded as `KEY:RATE` pairs joined by `\|`, with a trailing `*` on excluded entries (e.g. `ECB:0.92\|FED:1.50*`). |

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.getRates(request)`

- **OnSuccess**: <code>[Rate](src/models/rate.ts)[]</code>
- **OnError**: throws <code>[FrankfurterApiClient.GetRatesError](src/client.ts)</code>, with `err.payload` discriminated on `kind`

**As ApiResult**: `await client.getRates(request).asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;Rate[], FrankfurterApiClient.GetRatesError&gt;</code>, with `result.value` of type <code>[Rate](src/models/rate.ts)[]</code>
- **OnError**: `result.error` discriminated on `kind`, with `result.errorMessage`

**Always thrown**: <code>[FrankfurterApiError](src/core/errors.ts)</code>

</dd>
</dl>

</dd>
</dl>

</details>


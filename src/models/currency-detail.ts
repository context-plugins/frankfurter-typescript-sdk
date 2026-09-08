import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { pegSchema, type Peg } from "./peg.js";

export type CurrencyDetail = {
  /** ISO 4217 currency code */
  isoCode: string;
  /** ISO 4217 numeric code */
  isoNumeric?: string | null;
  /** Full currency name */
  name: string;
  /** Currency symbol */
  symbol?: string | null;
  /** Provider keys that publish this currency */
  providers?: string[];
  /** Peg metadata, present only for pegged currencies */
  peg?: Peg;
};

export const currencyDetailSchema: Schema<CurrencyDetail> = s.object<CurrencyDetail>({
  isoCode: s.string(),
  isoNumeric: s.optionalNullable(s.string()),
  name: s.string(),
  symbol: s.optionalNullable(s.string()),
  providers: s.optional(s.array(s.string())),
  peg: s.optional(s.lazy(() => pegSchema)),
  _keysMap: {
    isoCode: "iso_code",
    isoNumeric: "iso_numeric",
  },
});

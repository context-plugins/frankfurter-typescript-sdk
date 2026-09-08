import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

export type Currency = {
  /** ISO 4217 currency code */
  isoCode: string;
  /** ISO 4217 numeric code */
  isoNumeric?: string | null;
  /** Full currency name */
  name: string;
  /** Currency symbol */
  symbol?: string | null;
  /** Earliest available date */
  startDate?: string | null;
  /** Latest available date */
  endDate?: string | null;
};

export const currencySchema: Schema<Currency> = s.object<Currency>({
  isoCode: s.string(),
  isoNumeric: s.optionalNullable(s.string()),
  name: s.string(),
  symbol: s.optionalNullable(s.string()),
  startDate: s.optionalNullable(s.dateOnly()),
  endDate: s.optionalNullable(s.dateOnly()),
  _keysMap: {
    isoCode: "iso_code",
    isoNumeric: "iso_numeric",
    startDate: "start_date",
    endDate: "end_date",
  },
});

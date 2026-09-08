import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { provider2Schema, type Provider2 } from "./provider2.js";

export type Rate = {
  /** The date of the rate */
  date: string;
  /** Base currency code */
  base: string;
  /** Quote currency code */
  quote: string;
  /** Exchange rate value */
  rate: number;
  /**
   * Per-provider rates for this pair. Present only when `expand=providers` is set. Each entry has
   * the provider's observation date and published rate (rebased to the row's base). Entries with
   * `excluded: true` did not contribute to the blended `rate` — either flagged as outliers by the
   * consensus filter, or overridden by a currency peg. Omitted on synthesized peg rows where no
   * provider published the quote.
   */
  providers?: Provider2[];
};

export const rateSchema: Schema<Rate> = s.object<Rate>({
  date: s.dateOnly(),
  base: s.string(),
  quote: s.string(),
  rate: s.number(),
  providers: s.optional(s.array(s.lazy(() => provider2Schema))),
});

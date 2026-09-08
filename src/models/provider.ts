import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { publishCadenceSchema, type PublishCadence } from "./publish-cadence.js";

export type Provider = {
  /** Provider identifier */
  key: string;
  /** Full provider name */
  name: string;
  /** ISO 3166-1 alpha-2 country code */
  countryCode?: string | null;
  /** Official rate type as used by the source */
  rateType?: string | null;
  /** Base currency for published rates */
  pivotCurrency?: string | null;
  /** Link to the data source */
  dataUrl?: string | null;
  /** Link to terms of use */
  termsUrl?: string | null;
  /** Earliest available date */
  startDate?: string | null;
  /** Latest available date */
  endDate?: string | null;
  /**
   * How often the provider publishes rates. Determines the unit of publishes_missed: a count of
   * days, ISO weeks, or calendar months. Null for historical-only providers with no scheduled
   * cadence.
   */
  publishCadence?: PublishCadence | null;
  /**
   * Number of expected publishes missed since end_date, in units of publish_cadence. For daily
   * providers, counts scheduled publish days strictly between end_date and today. For weekly and
   * monthly providers, counts ISO weeks or calendar months between the latest imported bucket and
   * the bucket whose publish window has already started. Null when the provider has no scheduled
   * cadence or no imported data.
   */
  publishesMissed?: number | null;
  /** Currency codes covered by this provider */
  currencies: string[];
};

export const providerSchema: Schema<Provider> = s.object<Provider>({
  key: s.string(),
  name: s.string(),
  countryCode: s.optionalNullable(s.string()),
  rateType: s.optionalNullable(s.string()),
  pivotCurrency: s.optionalNullable(s.string()),
  dataUrl: s.optionalNullable(s.string()),
  termsUrl: s.optionalNullable(s.string()),
  startDate: s.optionalNullable(s.dateOnly()),
  endDate: s.optionalNullable(s.dateOnly()),
  publishCadence: s.optionalNullable(s.lazy(() => publishCadenceSchema)),
  publishesMissed: s.optionalNullable(s.number()),
  currencies: s.array(s.string()),
  _keysMap: {
    countryCode: "country_code",
    rateType: "rate_type",
    pivotCurrency: "pivot_currency",
    dataUrl: "data_url",
    termsUrl: "terms_url",
    startDate: "start_date",
    endDate: "end_date",
    publishCadence: "publish_cadence",
    publishesMissed: "publishes_missed",
  },
});

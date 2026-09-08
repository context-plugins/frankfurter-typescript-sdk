import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

export type Provider2 = {
  /** Provider key */
  key: string;
  /** Provider observation date used for this entry */
  date: string;
  /** Provider's rate, rebased to the row's base */
  rate: number;
  /** Present and true when this entry did not contribute to the blended rate */
  excluded?: boolean;
};

export const provider2Schema: Schema<Provider2> = s.object<Provider2>({
  key: s.string(),
  date: s.dateOnly(),
  rate: s.number(),
  excluded: s.optional(s.boolean()),
});

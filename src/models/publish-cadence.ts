import * as s from "../core/validation/index.js";
import type { EnumSchema } from "../core/validation/schema.js";

/**
 * How often the provider publishes rates. Determines the unit of publishes_missed: a count of days,
 * ISO weeks, or calendar months. Null for historical-only providers with no scheduled cadence.
 */
export const PublishCadence = {
  Daily: "daily",
  Weekly: "weekly",
  Monthly: "monthly",
} as const;
export type PublishCadence = (typeof PublishCadence)[keyof typeof PublishCadence] | (string & {});

export const publishCadenceSchema: EnumSchema<PublishCadence> = s.enumOf<PublishCadence>(PublishCadence);

import * as s from "../core/validation/index.js";
import type { EnumSchema } from "../core/validation/schema.js";

export const Group = {
  Week: "week",
  Month: "month",
} as const;
export type Group = (typeof Group)[keyof typeof Group] | (string & {});

export const groupSchema: EnumSchema<Group> = s.enumOf<Group>(Group);

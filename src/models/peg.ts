import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

/** Peg metadata, present only for pegged currencies */
export type Peg = {
  base?: string;
  rate?: number;
  authority?: string;
  source?: string;
};

export const pegSchema: Schema<Peg> = s.object<Peg>({
  base: s.optional(s.string()),
  rate: s.optional(s.number()),
  authority: s.optional(s.string()),
  source: s.optional(s.string()),
});

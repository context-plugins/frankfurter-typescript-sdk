import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

export type UnprocessableEntity1 = {
  message?: string;
};

export const unprocessableEntity1Schema: Schema<UnprocessableEntity1> = s.object<UnprocessableEntity1>({
  message: s.optional(s.string()),
});

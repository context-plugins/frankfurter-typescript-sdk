import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

export type NotFound1 = {
  message?: string;
};

export const notFound1Schema: Schema<NotFound1> = s.object<NotFound1>({
  message: s.optional(s.string()),
});

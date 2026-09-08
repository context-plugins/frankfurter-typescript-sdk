import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

export type NotFound = {
  message?: string;
};

export const notFoundSchema: Schema<NotFound> = s.object<NotFound>({
  message: s.optional(s.string()),
});

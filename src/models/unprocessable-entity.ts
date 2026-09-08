import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

export type UnprocessableEntity = {
  message?: string;
};

export const unprocessableEntitySchema: Schema<UnprocessableEntity> = s.object<UnprocessableEntity>({
  message: s.optional(s.string()),
});

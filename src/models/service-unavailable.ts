import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

export type ServiceUnavailable = {
  message?: string;
};

export const serviceUnavailableSchema: Schema<ServiceUnavailable> = s.object<ServiceUnavailable>({
  message: s.optional(s.string()),
});

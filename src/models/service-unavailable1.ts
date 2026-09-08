import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

export type ServiceUnavailable1 = {
  message?: string;
};

export const serviceUnavailable1Schema: Schema<ServiceUnavailable1> = s.object<ServiceUnavailable1>({
  message: s.optional(s.string()),
});

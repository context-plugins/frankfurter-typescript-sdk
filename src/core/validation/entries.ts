import * as zod from "zod/v4-mini";
import type { ZodMiniType } from "zod/v4-mini";
import { resolve, type Encoded, type Entry, type Schema } from "./schema.js";

export function lazy<T>(target: () => Schema<T, Encoded<T>>): ZodMiniType<T, Encoded<T>> {
  return zod.lazy(() => resolve(target()));
}

export function defaulted<T>(entry: Entry<T, Encoded<T>>, value: T): ZodMiniType<T, Encoded<T>> {
  return zod.codec(zod.optional(resolve(entry)), zod.custom<T>(), {
    decode: (given: T | undefined) => (given === undefined ? value : given),
    encode: (given: T | undefined) => (given === undefined ? value : given),
  }) as unknown as ZodMiniType<T, Encoded<T>>;
}

export function optionalNullable<T>(
  entry: Entry<T, Encoded<T>>,
): ZodMiniType<T | null | undefined, Encoded<T> | null | undefined> {
  return zod.optional(zod.nullable(resolve(entry)));
}

export const dateTime = (): ZodMiniType<Date, string> =>
  zod.codec(zod.iso.datetime({ offset: true }), zod.date(), {
    decode: (value) => new Date(value),
    encode: (date) => date.toISOString(),
  });

const IMF_FIXDATE =
  /^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun), \d{2} (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4} \d{2}:\d{2}:\d{2} GMT$/;

export const rfc1123DateTime = (): ZodMiniType<Date, string> =>
  zod.codec(zod.string().check(zod.regex(IMF_FIXDATE)), zod.date(), {
    decode: (value) => new Date(value),
    encode: (date) => date.toUTCString(),
  });

const EPOCH_SECONDS = /^-?\d+(?:\.\d+)?$/;

export const unixSecondsDateTime = (): ZodMiniType<Date, number> =>
  zod.codec(zod.union([zod.number(), zod.string().check(zod.regex(EPOCH_SECONDS))]), zod.date(), {
    decode: (value) => new Date(Number(value) * 1000),
    encode: (date) => Math.floor(date.getTime() / 1000),
  }) as unknown as ZodMiniType<Date, number>;

export const dateOnly = (): ZodMiniType<string, string> => zod.iso.date();

const BYTES = zod.custom<Uint8Array>((value) => value instanceof Uint8Array);

export const bytes = (): ZodMiniType<Uint8Array, string> =>
  zod.codec(zod.base64(), BYTES, {
    decode: (value) => decodeBase64(value),
    encode: (value) => encodeBase64(value),
  });

function decodeBase64(value: string): Uint8Array {
  const latin1 = atob(value);
  const bytes = new Uint8Array(latin1.length);
  for (let index = 0; index < latin1.length; index++) bytes[index] = latin1.charCodeAt(index);
  return bytes;
}

function encodeBase64(value: Uint8Array): string {
  let latin1 = "";
  for (const byte of value) latin1 += String.fromCharCode(byte);
  return btoa(latin1);
}

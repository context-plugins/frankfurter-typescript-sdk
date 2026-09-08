import * as schema from "zod/v4-mini";
import type { ZodMiniType } from "zod/v4-mini";
import { CoreError } from "../errors.js";
import type { Entry, Schema } from "./schema.js";

/** Constructor input for {@link SchemaError}. */
export type SchemaErrorInit = {
  message: string;
  rawBody?: unknown;
  cause?: unknown;
};

/**
 * A value did not match the schema that describes it.
 *
 * @remarks
 * Thrown on both directions: decoding a response whose shape has drifted from the spec, and
 * encoding a request value that does not match its declared type. It is a {@link CoreError}, not a
 * `ResponseError` — a response arrived, but nothing usable could be made of it.
 *
 * `rawBody` carries what was actually read — the response text, the parsed body, or the offending
 * parameter value — and `cause` is the underlying issue list with its original paths. That pair is
 * the escape hatch when a server disagrees with its own spec and a call is otherwise blocked.
 */
export class SchemaError extends CoreError {
  readonly kind = "schema" as const;

  /** What was read when validation failed, for diagnosis. */
  readonly rawBody: unknown;

  constructor(init: SchemaErrorInit) {
    super(init.message, init.cause !== undefined ? { cause: init.cause } : undefined);
    this.rawBody = init.rawBody;
  }
}

export function decodeWith<T>(zodType: ZodMiniType<T, unknown>, value: unknown): T {
  const result = zodType.safeParse(value);
  if (result.success) return result.data;
  throw new SchemaError({
    message: issuesMessage(result.error, value),
    rawBody: value,
    cause: result.error,
  });
}

export function encodeWith<T, W>(zodType: ZodMiniType<T, W>, value: unknown): W {
  const result = schema.safeEncode(zodType, value as T);
  if (result.success) return result.data;
  throw new SchemaError({
    message: issuesMessage(result.error, value, "Type could not be encoded for the wire."),
    rawBody: value,
    cause: result.error,
  });
}

export function decodeEntry<V>(schema: Entry<V>, value: unknown): V {
  return isSchemaEntry(schema) ? schema.decode(value) : decodeWith(schema, value);
}

export function encodeEntry<V, W>(schema: Entry<V, W>, value: unknown): W {
  return isSchemaEntry(schema) ? schema.encode(value) : encodeWith(schema, value);
}

function isSchemaEntry<V, W>(entry: Entry<V, W>): entry is Schema<V, W> {
  return typeof (entry as { decode?: unknown }).decode === "function";
}

type SchemaIssue = {
  readonly path: readonly PropertyKey[];
  readonly message: string;
  readonly expected?: string | undefined;
  readonly format?: string | undefined;
  readonly options?: readonly unknown[] | undefined;
};

type SchemaIssues = { readonly issues: readonly SchemaIssue[] };

function issuesMessage(
  error: SchemaIssues,
  value: unknown,
  prefix = "Wire value could not be decoded.",
): string {
  const issues = error.issues.map((issue) => {
    const path = issue.path.map(String).join(".") || "<root>";
    return `${path}: ${issueReason(issue, valueAt(value, issue.path))}`;
  });
  return `${prefix} ${issues.join("; ")}`;
}

function issueReason(issue: SchemaIssue, actual: unknown): string {
  if (issue.expected !== undefined) return `expected ${issue.expected}, received ${typeName(actual)}`;
  if (issue.format !== undefined) return `expected ${issue.format} format, received ${literal(actual)}`;
  if (issue.options !== undefined) {
    return `expected one of ${issue.options.map(literal).join(" | ")}, received ${literal(actual)}`;
  }
  return issue.message;
}

function valueAt(value: unknown, path: readonly PropertyKey[]): unknown {
  let current = value;
  for (const key of path) {
    if (current === null || typeof current !== "object") return undefined;
    current = (current as Record<PropertyKey, unknown>)[key];
  }
  return current;
}

function typeName(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function literal(value: unknown): string {
  return JSON.stringify(value) ?? "undefined";
}

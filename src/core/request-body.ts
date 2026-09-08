import { SdkError } from "./errors.js";
import type { ParamValue, StyledParam } from "./param-value.js";
import { isScalar, jsonValue, scalar } from "./param-value.js";
import { formString } from "./params.js";
import type { Entry } from "./validation/schema.js";
import { encodeEntry } from "./validation/schema-error.js";

export type Json = string | number | boolean | null | readonly Json[] | JsonObject;

export type JsonObject = { readonly [key: string]: Json | undefined };

export type ContentType =
  | "application/x-www-form-urlencoded;charset=UTF-8"
  | "application/json"
  | "text/plain;charset=utf-8";

export type BodyContent = {
  body: string | null;
  contentType?: ContentType;
};

export type EmptyBody = {
  readonly kind: "empty";
};

export type JsonBody = {
  readonly kind: "json";
  readonly value: unknown;
  readonly schema: Entry<unknown>;
};

export type FormUrlEncodedBody = {
  readonly kind: "formUrlEncoded";
  readonly value: readonly StyledParam[];
};

export type TextBody = {
  readonly kind: "text";
  readonly value: unknown;
  readonly schema: Entry<unknown>;
};

export type RequestBody = EmptyBody | JsonBody | FormUrlEncodedBody | TextBody;

export function buildBody(body: RequestBody): BodyContent {
  switch (body.kind) {
    case "empty":
      return { body: null };
    case "json":
      return buildJson(body);
    case "formUrlEncoded":
      return buildFormUrlEncoded(body);
    case "text":
      return buildText(body);
    default:
      return unknownBodyKind(body);
  }
}

function unknownBodyKind(body: never): never {
  const kind = (body as { kind?: unknown }).kind;
  throw new SdkError({ message: `Unsupported request body kind: ${String(kind)}` });
}

function buildFormUrlEncoded(body: FormUrlEncodedBody): BodyContent {
  return { body: formString(body.value), contentType: "application/x-www-form-urlencoded;charset=UTF-8" };
}

function buildJson(body: JsonBody): BodyContent {
  const text = JSON.stringify(encodeEntry(body.schema, body.value));
  if (text === undefined) return { body: null };
  return { body: text, contentType: "application/json" };
}

function buildText(body: TextBody): BodyContent {
  const encoded = encodeEntry(body.schema, body.value) as ParamValue;
  if (encoded === undefined) return { body: null };
  return {
    body: isScalar(encoded) ? scalar(encoded) : jsonValue(encoded),
    contentType: "text/plain;charset=utf-8",
  };
}

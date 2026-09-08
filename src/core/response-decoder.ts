import type { Entry } from "./validation/schema.js";
import { CoreError, ConnectionError, SdkError } from "./errors.js";
import { SchemaError, decodeEntry } from "./validation/schema-error.js";

export type JsonResponseDecoder<T> = {
  readonly kind: "json";
  readonly schema: Entry<T>;
};

export type TextResponseDecoder<T> = {
  readonly kind: "text";
  readonly schema: Entry<T>;
};

export type EmptyResponseDecoder = {
  readonly kind: "empty";
};

export type ResponseDecoder<T> =
  | JsonResponseDecoder<T>
  | TextResponseDecoder<T>
  | ([T] extends [undefined] ? EmptyResponseDecoder : never);

export type AnyResponseDecoder =
  | JsonResponseDecoder<unknown>
  | TextResponseDecoder<unknown>
  | EmptyResponseDecoder;

export function decodeResponse<T>(decoder: ResponseDecoder<T>, response: Response): Promise<T>;
export function decodeResponse(decoder: AnyResponseDecoder, response: Response): Promise<unknown>;
export async function decodeResponse(decoder: AnyResponseDecoder, response: Response): Promise<unknown> {
  switch (decoder.kind) {
    case "json":
      return decodeJson(decoder, response);
    case "text":
      return decodeText(decoder, response);
    case "empty":
      return decodeEmpty(response);
    default: {
      await response.body?.cancel().catch(() => {});
      return unknownDecoderKind(decoder);
    }
  }
}

async function decodeJson<T>(decoder: JsonResponseDecoder<T>, response: Response): Promise<T> {
  let text: string;
  try {
    text = await response.text();
  } catch (err) {
    if (err instanceof CoreError) throw err;
    throw new ConnectionError({ message: "Response body could not be read.", cause: err });
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    throw new SchemaError({
      message: "Response body could not be parsed.",
      rawBody: text,
      cause: err,
    });
  }
  return decodeEntry(decoder.schema, parsed);
}

async function decodeText<T>(decoder: TextResponseDecoder<T>, response: Response): Promise<T> {
  let text: string;
  try {
    text = await response.text();
  } catch (err) {
    if (err instanceof CoreError) throw err;
    throw new ConnectionError({ message: "Response body could not be read.", cause: err });
  }
  return decodeEntry(decoder.schema, text);
}

async function decodeEmpty(response: Response): Promise<undefined> {
  let bytes: ArrayBuffer;
  try {
    bytes = await response.arrayBuffer();
  } catch (err) {
    if (err instanceof CoreError) throw err;
    throw new ConnectionError({ message: "Response body could not be read.", cause: err });
  }
  if (bytes.byteLength > 0)
    throw new SchemaError({
      message: "Expected an empty response body.",
      rawBody: bytes,
    });
  return undefined;
}

function unknownDecoderKind(decoder: never): never {
  const kind = (decoder as { kind?: unknown }).kind;
  throw new SdkError({ message: `Unsupported response decoder kind: ${String(kind)}` });
}

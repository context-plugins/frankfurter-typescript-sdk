import type { UrlTemplate } from "./api-request.js";
import type { StyledParam, Param } from "./param-value.js";
import { encodedParam, flattenValue } from "./param-value.js";
import { percentEncode, queryString } from "./params.js";
import { SdkError } from "./errors.js";

export function buildUrl(
  template: UrlTemplate,
  pathParams: readonly Param[] | undefined,
  query: readonly StyledParam[] | undefined,
  defaultQuery: readonly StyledParam[],
  defaultPathParams?: readonly Param[],
  authQuery?: readonly StyledParam[],
): URL {
  const resolvedBase = expandVariables(template.baseUrl, template.variables);
  const path = expandPath(template.subPath, pathParams, defaultPathParams);
  const url = new URL(joinUrl(resolvedBase, path));
  const search = queryString([defaultQuery, query, authQuery], [...url.searchParams]);
  if (search) url.search = search;
  return url;
}

function expandVariables(template: string, variables: Record<string, string> | undefined): string {
  let out = template;
  for (const [key, value] of Object.entries(variables ?? {})) {
    out = out.replaceAll(`{${key}}`, percentEncode(value));
  }
  return out;
}

function expandPath(template: string, ...layers: ReadonlyArray<readonly Param[] | undefined>): string {
  let out = template;
  const skipped: string[] = [];
  for (const layer of layers) {
    for (const source of layer ?? []) {
      const value = encodedParam(source);
      if (value === undefined) {
        skipped.push(source.name);
        continue;
      }
      const replacement = value === null ? "" : flattenValue(value).map(percentEncode).join(",");
      out = out.replaceAll(`{${source.name}}`, replacement);
    }
  }
  for (const name of skipped) {
    if (!out.includes(`{${name}}`)) continue;
    throw new SdkError({
      message: `Path parameter "${name}" resolved to undefined and left {${name}} unfilled.`,
    });
  }
  return out;
}

function joinUrl(base: string, path: string): string {
  const left = base.replace(/\/+$/, "");
  const right = path.replace(/^\/+/, "");
  return `${left}/${right}`;
}

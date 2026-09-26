// URL parameters are untrusted input, even when their TypeScript type is known.
export function readRouteId(value: string | string[] | undefined): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

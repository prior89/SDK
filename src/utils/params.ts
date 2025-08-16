export function toSearchParams(obj: Record<string, any>): string {
  const usp = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (Array.isArray(v)) {
      v.forEach(i => usp.append(k, String(i)));
    } else {
      usp.set(k, String(v));
    }
  });
  return usp.toString();
}

export function parseSearchParams(query: string): Record<string, string | string[]> {
  const usp = new URLSearchParams(query.startsWith('?') ? query.slice(1) : query);
  const out: Record<string, any> = {};
  usp.forEach((value, key) => {
    if (key in out) {
      out[key] = Array.isArray(out[key]) ? [...out[key], value] : [out[key], value];
    } else {
      out[key] = value;
    }
  });
  return out;
}
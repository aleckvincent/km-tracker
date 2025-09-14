export function toCamelCase<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(item => toCamelCase(item)) as unknown as T;
  } else if (obj !== null && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      result[camelKey] = toCamelCase(value);
    }
    return result as T;
  }
  return obj;
}

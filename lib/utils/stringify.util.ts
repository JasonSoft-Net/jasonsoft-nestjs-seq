/**
 * Safely converts an object to a JSON string, handling circular references and special types.
 * Added by Jason.Song (成长的小猪) on 2023/11/22 19:17:54
 * @param obj The object to be converted to a JSON string.
 * @returns A JSON string representing the object, handling circular references and special types.
 */
function safeStringify(obj: any): string {
  const seen = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    } else if (typeof value === 'function') {
      return `[Function: ${value.name || 'anonymous'}]`;
    } else if (typeof value === 'symbol') {
      return value.toString();
    }
    return value;
  });
}

export { safeStringify };

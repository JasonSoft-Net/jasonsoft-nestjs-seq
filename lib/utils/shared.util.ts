/**
 * Returns the default value if the value is null or undefined.
 * Added by Jason.Song (成长的小猪) on 2023/11/17 12:28:18
 * @param {T} value The value to check.
 * @param {T} defaultValue The default value to return if the value is null or undefined.
 * @returns {T} The value if it is not null or undefined, or the default value if it is.
 */
export function defaultIfNullOrUndefined<T>(value: T, defaultValue: T): T {
  return value === null || value === undefined ? defaultValue : value;
}

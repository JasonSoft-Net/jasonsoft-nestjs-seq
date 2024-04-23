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

/**
 * Checks if the provided value is a plain object, i.e., an object created by the
 * Object constructor or one with a null prototype.
 * @param {any} obj The object to check.
 * @returns {boolean} True if the object is a plain object, false otherwise.
 */
export function isPlainObject(obj: any): boolean {
  if (
    obj === null ||
    typeof obj !== 'object' ||
    Object.prototype.toString.call(obj) !== '[object Object]'
  ) {
    return false;
  }
  const proto = Object.getPrototypeOf(obj);
  return proto === null || proto === Object.prototype;
}

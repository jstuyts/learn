/**
 * Check if value is string
 * @param {any} value - The item to check
 * @return {boolean} True or False
 */
export function isString(value): boolean {
  return typeof value === 'string' || value instanceof String;
}

/**
 * Check if value is number
 * @param {any} value - The item to check
 * @return {boolean} True or False
 */
export function isNumber(value): boolean {
  return typeof value === 'number' && isFinite(value);
}

/**
 * Check if value is array
 * @param {any} value - The item to check
 * @return {boolean} True or False
 */
export function isArray(value): boolean {
  return value && typeof value === 'object' && value.constructor === Array;
}

/**
 * Check if value is function
 * @param {any} value - The item to check
 * @return {boolean} True or False
 */
export function isFunction(value): boolean {
  return typeof value === 'function';
}

/**
 * Check if value is object
 * @param {any} value - The item to check
 * @return {boolean} True or False
 */
export function isObject(value): boolean {
  return value && typeof value === 'object' && value.constructor === Object;
}

/**
 * Check if value is null
 * @param {any} value - The item to check
 * @return {boolean} True or False
 */
export function isNull(value): boolean {
  return value === null;
}

/**
 * Check if value is undefined
 * @param {any} value - The item to check
 * @return {boolean} True or False
 */
export function isUndefined(value): boolean {
  return typeof value === 'undefined';
}

/**
 * Check if value is boolean
 * @param {any} value - The item to check
 * @return {boolean} True or False
 */
export function isBoolean(value): boolean {
  return typeof value === 'boolean';
}

/**
 * Check if value is regexp
 * @param {any} value - The item to check
 * @return {boolean} True or False
 */
export function isRegExp(value): boolean {
  return value && typeof value === 'object' && value.constructor === RegExp;
}

/**
 * Check if value is error
 * @param {any} value - The item to check
 * @return {boolean} True or False
 */
export function isError(value): boolean {
  return value instanceof Error && typeof value.message !== 'undefined';
}

/**
 * Check if value is date
 * @param {any} value - The item to check
 * @return {boolean} True or False
 */
export function isDate(value): boolean {
  return value instanceof Date;
}

/**
 * Check if value is symbol
 * @param {any} value - The item to check
 * @return {boolean} True or False
 */
export function isSymbol(value): boolean {
  return typeof value === 'symbol';
}

/**
 * Generates a unique ID
 * @return {string} A unique ID
 */
export function generateUniqueId(): string {
  let dt = new Date().getTime();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
      .replace(/[xy]/g, function(c) {
        const r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
      });
}

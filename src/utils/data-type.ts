const toString = Object.prototype.toString;

/**
 * Generic function for type checking.
 */
function isOfType<T>(obj: T, type: string): boolean {
  return toString.call(obj) === `[object ${type}]`;
}

export function isObject<T>(obj: T) {
  return isOfType(obj, 'Object');
}

export function isRegExp<T>(obj: T) {
  return isOfType(obj, 'RegExp');
}

export function isString<T>(obj: T) {
  return isOfType(obj, 'String');
}

export function isValidArrayIndex(val: number): boolean {
  const n = parseFloat(String(val));

  return n >= 0 && Math.floor(n) === n && isFinite(val);
}

// 判断是否为uuid
export function isUUID(str: string): boolean {
  return /\w{8}(-\w{4}){3}-\w{12}/.test(str);
}

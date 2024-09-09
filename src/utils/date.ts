export function getCurrentTimestamp(): number {
  return Date.parse(new Date().toString()) / 1000;
}

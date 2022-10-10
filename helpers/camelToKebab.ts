export function camelToKebab(string: string) {
  return string.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())
}

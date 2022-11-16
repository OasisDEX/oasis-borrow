export function toggleArrayItem<T>(array: T[], item: T): T[] {
  return array.includes(item) ? array.filter((arrayItem) => arrayItem !== item) : [...array, item]
}

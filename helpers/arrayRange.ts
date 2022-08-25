export function arrayRange(start: number, end: number) {
  return [...Array(end + 1).keys()].filter((value) => end >= value && start <= value)
}

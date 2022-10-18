export function allDefined(...params: any[]) {
  if (params && params.length === 0) {
    return false
  }

  return !params.includes(undefined)
}

export const isAnyValueDefined = (...params: (unknown | undefined)[]): boolean => {
  return params.some((value) => value !== undefined)
}

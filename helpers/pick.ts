// typesafe pick from https://stackoverflow.com/a/47232883/614523
export function pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
  const ret: any = {}
  keys.forEach((key) => {
    ret[key] = obj[key]
  })
  return ret
}

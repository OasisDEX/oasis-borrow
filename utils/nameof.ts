export function nameof<T>(name: keyof T) {
  return name
}
export function nameofFactory<T>() {
  return (name: keyof T) => name
}

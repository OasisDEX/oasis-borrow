type Entry<T> = [keyof T, T[keyof T]]

// Function to keep proper typing when using object entries since native fn Object.entries infer types very poorly
export function objectEntries<T extends object>(obj: T): Entry<T>[] {
  return (Object.keys(obj) as Array<keyof T>).map((key) => [key, obj[key]]) as Entry<T>[]
}

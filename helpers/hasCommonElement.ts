export const hasCommonElement = (arr1: unknown[], arr2: unknown[]): boolean => {
  // Use a Set to efficiently check for common elements
  const set1 = new Set(arr1)

  // Check if any element in arr2 is in set1
  return arr2.some((element) => set1.has(element))
}

export function moveItemsToFront<T>(
  array: T[],
  condition: (item: T) => boolean,
  sortFunction?: (a: T, b: T) => number,
): T[] {
  // Filter out the items that meet the condition
  const matchedItems = array.filter(condition)
  // Filter out the items that don't meet the condition
  const nonMatchedItems = array.filter((item) => !condition(item))

  // Sort the matched items and non-matched items if sort functions are provided
  if (sortFunction) {
    matchedItems.sort(sortFunction)
    nonMatchedItems.sort(sortFunction)
  }

  // Concatenate the matched items followed by the non-matched items
  return matchedItems.concat(nonMatchedItems)
}

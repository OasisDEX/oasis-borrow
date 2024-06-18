interface BooleanCount {
  trueCount: number
  falseCount: number
}

/**
 * Counts the number of true and false values in an object with boolean properties.
 * @param obj An object where each property's value is a boolean.
 * @returns An object with counts of true and false values.
 */
export const countBooleanValues = <T extends {}>(obj: T): BooleanCount => {
  const { trueCount, falseCount } = Object.entries(obj).reduce(
    (acc, [, value]) => {
      if (value) {
        acc.trueCount++
      } else {
        acc.falseCount++
      }
      return acc
    },
    { trueCount: 0, falseCount: 0 },
  )

  return { trueCount, falseCount }
}

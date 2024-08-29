/**
 * Checks if the current date and time is between a given start and end date.
 *
 * This function compares the current date with the provided start and end dates.
 * It returns `true` if the current date is greater than or equal to the start date
 * and strictly less than the end date.
 *
 * @param startDate - The starting date of the range.
 * @param endDate - The ending date of the range.
 * @returns `true` if the current date is between the start and end dates, otherwise `false`.
 */
export const isBetweenDates = (startDate: Date, endDate: Date): boolean => {
  // Get the current date and time
  const currentDate = new Date()

  // Check if current date is between the start and end dates
  return currentDate >= startDate && currentDate < endDate
}

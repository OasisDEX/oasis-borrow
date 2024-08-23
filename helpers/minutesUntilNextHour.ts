export const minutesUntilNextHour = () => {
  // Get the current time
  const now = new Date()

  // Calculate the number of minutes until the next hour
  const minutes = now.getMinutes()

  // Return formatted string
  return `${60 - minutes} min`
}

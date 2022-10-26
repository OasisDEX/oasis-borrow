const relativeTimeUnits = {
  year: 24 * 60 * 60 * 1000 * 365,
  month: (24 * 60 * 60 * 1000 * 365) / 12,
  day: 24 * 60 * 60 * 1000,
  hour: 60 * 60 * 1000,
  minute: 60 * 1000,
  second: 1000,
}
const languagesMap = {
  cn: 'chi',
}

export function timeAgo({
  from = new Date(),
  lang = 'en',
  numeric = 'auto',
  style = 'long',
  to,
}: {
  from?: Date
  lang?: string
  numeric?: Intl.RelativeTimeFormatNumeric
  style?: Intl.RelativeTimeFormatStyle
  to: Date
}) {
  const mappedLang = Object.keys(languagesMap).includes(lang)
    ? languagesMap[lang as keyof typeof languagesMap]
    : lang
  const elapsed = to.getTime() - from.getTime()
  const closestUnit = Object.keys(relativeTimeUnits).filter((unit) => {
    return Math.abs(elapsed) > relativeTimeUnits[unit as keyof typeof relativeTimeUnits]
  }) as (keyof typeof relativeTimeUnits)[]

  return new Intl.RelativeTimeFormat(mappedLang, { numeric, style }).format(
    Math.round(elapsed / relativeTimeUnits[closestUnit[0]]),
    closestUnit[0],
  )
}

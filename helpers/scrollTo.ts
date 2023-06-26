export function scrollTo(elementId: string) {
  if (!document.querySelectorAll(`#${elementId}`)[0]) {
    console.warn(`Element with id ${elementId} not found`)
    return () => void 0
  }
  return () => document.querySelectorAll(`#${elementId}`)[0]?.scrollIntoView({ behavior: 'smooth' })
}

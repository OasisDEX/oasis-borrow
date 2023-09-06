export function scrollTo(elementId: string) {
  return () => {
    if (!document.querySelectorAll(`#${elementId}`)[0]) {
      return () => {
        console.warn(`Element with id ${elementId} not found`)
        void 0
      }
    }

    return document.querySelectorAll(`#${elementId}`)[0]?.scrollIntoView({ behavior: 'smooth' })
  }
}

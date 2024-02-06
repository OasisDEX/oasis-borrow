export function renderCssGradient(angle: string, gradient: string[]) {
  const stops = gradient.map((item, i) => `${item} ${(1 / (gradient.length - 1)) * i * 100}%`)

  return `linear-gradient(${angle}, ${stops.join(', ')})`
}

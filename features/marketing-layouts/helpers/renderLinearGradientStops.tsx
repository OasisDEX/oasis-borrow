export function renderLinearGradientStops(gradient: string[]) {
  return gradient.map((item, i) => (
    <stop offset={(1 / (gradient.length - 1)) * i} stop-color={item} />
  ))
}

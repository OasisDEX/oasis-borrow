import React from 'react'

export function renderLinearGradientStops(gradient: string[]) {
  return gradient.map((item, i) => (
    <stop key={i} offset={(1 / (gradient.length - 1)) * i} stopColor={item} />
  ))
}

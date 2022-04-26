import BigNumber from 'bignumber.js'
import React from 'react'

type SliceBackground = {
  color: string,
  svgBgId?: string,
}

export type PieChartItem = {
  value: BigNumber
} & SliceBackground

type SliceDimensions = {
  length: number,
  angle: number,
}

type Slice = SliceDimensions & SliceBackground

function getSlices(items: PieChartItem[], circleLength: number): Slice[] {
  const values = items.map(i => i.value)
  const totalValue = BigNumber.sum.apply(null, values) 
  const slices = []
  let angle = 0
  for (var i = 0; i < items.length; i++) {
    const ratio = values[i].dividedBy(totalValue).toNumber()
    slices.push({
      length: circleLength * ratio,
      angle,
      color: items[i].color,
      svgBgId: items[i].svgBgId,
    })
    angle += 360 * ratio
  }
  return slices
}

export function PieChart({ items, size = 258 }: { items: PieChartItem[], size: number }) {
  const strokeWidth = 34
  const radius = size / 2
  const viewSize = size + strokeWidth
  const circleLength = Math.PI * radius * 2
  const slices = getSlices(items, circleLength)

  const renderSlice = (length: number, angle: number, stroke: string)  => <circle 
    cx="50%" 
    cy="50%" 
    r={radius}
    strokeDasharray={`${length} ${circleLength}`} 
    stroke={stroke}
    strokeWidth={strokeWidth}
    fill="none"
    style={{ transformOrigin: 'center', transform: `rotate(${angle}deg)`}}
    >
  </circle>

  return <svg width={size} height={size} viewBox={`0 0 ${viewSize} ${viewSize}`}>
    <defs>
      <linearGradient id="pieChart-white-gradient">
        <stop offset="0%" style={{stopColor: 'rgb(255, 255, 255, 0.4)'}} />
        <stop offset="100%" style={{stopColor: 'rgb(255, 255, 255, 0)'}} />
      </linearGradient>
    </defs>
    {slices.map(({ length, angle, color }) => [
      renderSlice(length, angle, color),
      renderSlice(length, angle, 'url(#pieChart-white-gradient)')
    ])}
  </svg>
}

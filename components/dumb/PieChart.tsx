import BigNumber from 'bignumber.js'
import React from 'react'

export type PieChartItem = {
  value: BigNumber,
  color: string,
}

type Slice = {
  length: number,
  angle: number,
  color: string,
}

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
      color: items[i].color
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
  return <svg width={size} height={size} viewBox={`0 0 ${viewSize} ${viewSize}`}>
    {slices.map(({ length, angle, color }) => <circle 
      cx="50%" 
      cy="50%" 
      r={radius}
      strokeDasharray={`${length} ${circleLength}`} 
      stroke={color}
      strokeWidth={strokeWidth}
      fill="none"
      style={{ transformOrigin: 'center', transform: `rotate(${angle}deg)`}}
      >
    </circle>)}
  </svg>
}

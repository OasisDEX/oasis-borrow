import BigNumber from 'bignumber.js'
import React from 'react'

export type PieChartItem = {
  value: BigNumber,
  color: string,
}

function getStrokeDashArrays(values: BigNumber[], radius: number) {
  const circleLength = Math.PI * (radius * 2)
  const totalValue = BigNumber.sum.apply(null, values) 

  const dashArrays = []
  let spaceLeft = circleLength
  for (var c = 0; c < values.length; c++) {
    dashArrays.push(`${spaceLeft} ${circleLength}`)
    spaceLeft -= values[c].dividedBy(totalValue).toNumber() * circleLength
  }
  return dashArrays
}

export function PieChart({ items, size = 258 }: { items: PieChartItem[], size: number }) {
  const strokeWidth = 34
  const radius = size / 2
  const viewSize = size + strokeWidth
  const dashArrays = getStrokeDashArrays(items.map(i => i.value), radius)
  return <svg width={size} height={size} viewBox={`0 0 ${viewSize} ${viewSize}`}>
    {items.map(({ color }, index) => <circle 
      cx="50%" 
      cy="50%" 
      r={radius}
      strokeDasharray={dashArrays[index]} 
      stroke={color}
      fill="none"
      strokeWidth={strokeWidth}
      >
    </circle>)}
  </svg>
}

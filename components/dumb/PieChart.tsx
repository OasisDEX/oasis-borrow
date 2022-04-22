import BigNumber from 'bignumber.js'
import React from 'react'

export type PieChartItem = {
  value: BigNumber,
  color: string,
}

function getStrokeDashArrays(values: BigNumber[]) {
  const radius = 100
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

export function PieChart({ items }: { items: PieChartItem[] }) {
  const dashArrays = getStrokeDashArrays(items.map(i => i.value))
  return <svg>
    {items.map(({ color }, index) => <circle cx="150" cy="150" r="100" strokeDasharray={dashArrays[index]} stroke={color}></circle>)}
  </svg>
}
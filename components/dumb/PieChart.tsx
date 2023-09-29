import React from 'react'

export type PieChartItem = {
  value: number
  id: string
}

type Slice = {
  length: number
  angle: number
  color: string
}

const nameToColor = (id: string) => {
  return (
    {
      aave2: '#5687a3',
      aave3: '#7d4378',
      ajna: '#a2118e',
      makerdao: '#4e978c',
    }[id] ?? '#6d7b85'
  )
}

function getSlices(items: PieChartItem[], circleLength: number): Slice[] {
  const values = items.map((i) => i.value)
  const totalValue = values.reduce((a, b) => a + b, 0)
  const slices = []
  let angle = 0
  for (let i = 0; i < items.length; i++) {
    const ratio = values[i] / totalValue
    slices.push({
      length: circleLength * ratio,
      angle,
      color: nameToColor(items[i].id),
    })
    angle += 360 * ratio
  }

  return slices
}

export function PieChart({ items, size = 258 }: { items: PieChartItem[]; size?: number }) {
  const strokeWidth = 34
  const radius = size / 2
  const viewSize = size + strokeWidth
  const circleLength = Math.PI * radius * 2
  const slices = getSlices(items, circleLength)

  const renderSlice = (length: number, angle: number, stroke: string) => (
    <circle
      key={`${length}${angle}${stroke}`}
      cx="50%"
      cy="50%"
      r={radius}
      strokeDasharray={`${length} ${circleLength}`}
      stroke={stroke}
      strokeWidth={strokeWidth}
      fill="none"
      style={{ transformOrigin: 'center', transform: `rotate(${angle}deg)` }}
    ></circle>
  )

  return (
    <svg width={size} height={size} viewBox={`0 0 ${viewSize} ${viewSize}`}>
      <defs>
        <linearGradient id="pieChart-white-gradient">
          <stop offset="0%" style={{ stopColor: 'rgb(255, 255, 255, 0.4)' }} />
          <stop offset="100%" style={{ stopColor: 'rgb(255, 255, 255, 0)' }} />
        </linearGradient>
      </defs>
      {slices.map(({ length, angle, color }) => [
        renderSlice(length, angle, color),
        renderSlice(length, angle, 'url(#pieChart-white-gradient)'),
      ])}
    </svg>
  )
}

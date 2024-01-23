import type { MarketingLayoutIconPalette } from 'features/marketing-layouts/types'
import type { FC, ReactNode } from 'react'

interface IconWithPaletteProps extends MarketingLayoutIconPalette {
  size: number
  contents: (params: MarketingLayoutIconPalette) => ReactNode
}

export const IconWithPalette: FC<IconWithPaletteProps> = ({
  size,
  backgroundGradient,
  contents,
  foregroundGradient,
  symbolGradient,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {contents({ backgroundGradient, foregroundGradient, symbolGradient })}
    </svg>
  )
}

import type { PositionDetail } from 'features/portfolio/types'

export function getPortfolioAccentColor(accent: PositionDetail['accent']): string {
  return accent === 'positive' ? 'success100' : 'error100'
}

import type { PositionDetail } from 'lambdas/src/portfolio-positions/types'

export function getPortfolioAccentColor(accent: PositionDetail['accent']): string {
  return accent === 'positive' ? 'success100' : 'error100'
}

export function getPortfolioChangeColor(change: number): string {
  return change > 0 ? 'success100' : change < 0 ? 'critical100' : 'neutral80'
}

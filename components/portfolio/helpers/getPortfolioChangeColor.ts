export function getPortfolioChangeColor(change?: number): string {
  if (change === undefined) {
    return 'neutral80'
  }
  return change > 0 ? 'success100' : change < 0 ? 'critical100' : 'neutral80'
}

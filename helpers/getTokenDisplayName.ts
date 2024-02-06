export function getTokenDisplayName(token: string): string {
  return (token === 'WETH' ? 'ETH' : token?.toUpperCase()).replace(/-/gi, '')
}

export function getTokenDisplayName(token: string): string {
  // TODO temporary fix, it will be handled on the subgraph level
  if (token.toLowerCase() === '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2') {
    return 'MKR'
  }

  return (token === 'WETH' ? 'ETH' : token?.toUpperCase()).replace(/-/gi, '')
}

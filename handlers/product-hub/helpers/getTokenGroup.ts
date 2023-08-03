export function getTokenGroup(
  token: string,
  type: 'primary' | 'secondary',
): {
  primaryTokenGroup?: string
  secondaryTokenGroup?: string
} {
  // could be extended with switch case if there is more than one group of tokens
  // for now this simple condition is enough

  switch (token) {
    case 'CBETH':
    case 'RETH':
    case 'WSTETH':
      return { [`${type}TokenGroup`]: 'ETH' }
    case 'TBTC':
    case 'WBTC':
      return { [`${type}TokenGroup`]: 'BTC' }
    case 'SDAI':
      return { [`${type}TokenGroup`]: 'DAI' }
    default:
      return {}
  }
}

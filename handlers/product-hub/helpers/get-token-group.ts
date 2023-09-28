export function getTokenGroup(token: string): string {
  // could be extended with switch case if there is more than one group of tokens
  // for now this simple condition is enough

  switch (token) {
    case 'CBETH':
    case 'RETH':
    case 'WSTETH':
    case 'YIELDETH':
      return 'ETH'
    case 'TBTC':
    case 'WBTC':
    case 'YIELDBTC':
      return 'BTC'
    case 'SDAI':
      return 'DAI'
    default:
      return token
  }
}

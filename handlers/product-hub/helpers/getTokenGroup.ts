export function getTokenGroup(token: string, type: 'primary' | 'secondary'): {
  primaryTokenGroup?: string
  secondaryTokenGroup?: string
} {
  // could be extended with switch case if there is more than one group of tokens
  // for now this simple condition is enough

  return ['CBETH', 'RETH', 'WSTETH'].includes(token) ? { [`${type}TokenGroup`]: 'ETH' } : {}
}

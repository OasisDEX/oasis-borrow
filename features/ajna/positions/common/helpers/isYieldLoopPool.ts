const POOLS_WITH_YIELD_LOOP = ['CBETH-ETH', 'RETH-ETH', 'WSTETH-ETH']

interface isYieldLoopParams {
  collateralToken: string
  quoteToken: string
}

export function isYieldLoopPool({ collateralToken, quoteToken }: isYieldLoopParams): boolean {
  return POOLS_WITH_YIELD_LOOP.includes(`${collateralToken}-${quoteToken}`)
}

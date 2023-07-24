const YIELD_LOOP_COLLATERALS = ['CBETH', 'RETH', 'WSTETH']
const YIELD_LOOP_QUOTES = ['ETH']

interface isYieldLoopParams {
  collateralToken: string
  quoteToken: string
}

export function isYieldLoopPool({ collateralToken, quoteToken }: isYieldLoopParams): boolean {
  return YIELD_LOOP_COLLATERALS.includes(collateralToken) && YIELD_LOOP_QUOTES.includes(quoteToken)
}

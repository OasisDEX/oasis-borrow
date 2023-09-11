import { AJNA_POOLS_WITH_YIELD_LOOP } from 'features/ajna/common/consts'

interface IsYieldLoopParams {
  collateralToken: string
  quoteToken: string
}

export function isYieldLoopPool({ collateralToken, quoteToken }: IsYieldLoopParams): boolean {
  return AJNA_POOLS_WITH_YIELD_LOOP.includes(`${collateralToken}-${quoteToken}`)
}
